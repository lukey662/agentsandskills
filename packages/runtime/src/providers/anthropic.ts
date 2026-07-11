import type { ProviderConfig } from "../config.js";
import type { CredentialStore } from "../credentials.js";
import type { ModelCapability, ModelProviderAdapter, ModelRequest, ModelResponse, ProviderProbeResult } from "../types.js";
import { assertSafeProviderUrl, fetchJson, joinUrl } from "./http.js";

export class AnthropicAdapter implements ModelProviderAdapter {
  readonly capabilities: ReadonlySet<ModelCapability>;
  readonly id: string;
  private readonly baseUrl: string;
  private readonly credentialRef: string;
  private readonly timeoutMs: number;
  private readonly allowPrivateNetwork: boolean;

  constructor(
    id: string,
    config: ProviderConfig,
    private readonly credentials: CredentialStore
  ) {
    this.id = id;
    this.baseUrl = config.baseUrl ?? "https://api.anthropic.com";
    this.credentialRef = config.credentialRef ?? "env:ANTHROPIC_API_KEY";
    this.timeoutMs = config.timeoutMs;
    this.allowPrivateNetwork = config.allowPrivateNetwork;
    this.capabilities = new Set((config.capabilities ?? ["text", "tools", "parallel-tools", "streaming", "vision", "reasoning", "usage"]) as ModelCapability[]);
  }

  async probe(signal?: AbortSignal): Promise<ProviderProbeResult> {
    const started = Date.now();
    try {
      const endpoint = joinUrl(this.baseUrl, "v1/models");
      await assertSafeProviderUrl(this.baseUrl, endpoint, this.allowPrivateNetwork);
      const payload = await fetchJson(endpoint, { headers: await this.headers() }, { timeoutMs: 15_000, ...(signal ? { signal } : {}) });
      const data = Array.isArray(payload.data) ? payload.data : [];
      const models = data.flatMap((item) =>
        item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string" ? [(item as { id: string }).id] : []
      );
      return { providerId: this.id, available: true, capabilities: [...this.capabilities], models, latencyMs: Date.now() - started };
    } catch (error) {
      return {
        providerId: this.id,
        available: false,
        capabilities: [...this.capabilities],
        latencyMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async invoke(request: ModelRequest): Promise<ModelResponse> {
    const endpoint = joinUrl(this.baseUrl, "v1/messages");
    await assertSafeProviderUrl(this.baseUrl, endpoint, this.allowPrivateNetwork);
    const system = request.messages
      .filter((message) => message.role === "system")
      .map((message) => message.content)
      .join("\n\n");
    const messages = request.messages
      .filter((message) => message.role !== "system")
      .map((message) =>
        message.role === "tool"
          ? {
              role: "user",
              content: [{ type: "tool_result", tool_use_id: message.toolCallId ?? message.name ?? "tool", content: message.content }]
            }
          : { role: message.role === "assistant" ? "assistant" : "user", content: message.content }
      );
    const payload = await fetchJson(
      endpoint,
      {
        method: "POST",
        headers: { ...(await this.headers()), "Content-Type": "application/json" },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxOutputTokens ?? 4_096,
          ...(system ? { system } : {}),
          messages,
          ...(request.tools?.length
            ? {
                tools: request.tools.map((tool) => ({
                  name: tool.name,
                  description: tool.description,
                  input_schema: tool.inputSchema
                }))
              }
            : {}),
          ...(request.temperature !== undefined ? { temperature: request.temperature } : {})
        })
      },
      { timeoutMs: this.timeoutMs, ...(request.signal ? { signal: request.signal } : {}) }
    );
    const content = Array.isArray(payload.content) ? payload.content : [];
    const text = content
      .flatMap((item) =>
        item && typeof item === "object" && (item as { type?: unknown }).type === "text" && typeof (item as { text?: unknown }).text === "string"
          ? [(item as { text: string }).text]
          : []
      )
      .join("\n");
    const toolCalls = content.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      if (record.type !== "tool_use" || typeof record.name !== "string") return [];
      return [
        {
          id: typeof record.id === "string" ? record.id : `${record.name}-tool`,
          name: record.name,
          arguments: record.input && typeof record.input === "object" && !Array.isArray(record.input) ? (record.input as Record<string, unknown>) : {}
        }
      ];
    });
    const usage = payload.usage && typeof payload.usage === "object" ? (payload.usage as Record<string, unknown>) : undefined;
    return {
      text,
      toolCalls,
      ...(typeof payload.stop_reason === "string" ? { finishReason: payload.stop_reason } : {}),
      ...(typeof payload.id === "string" ? { providerResponseId: payload.id } : {}),
      ...(usage
        ? {
            usage: {
              ...(typeof usage.input_tokens === "number" ? { inputTokens: usage.input_tokens } : {}),
              ...(typeof usage.output_tokens === "number" ? { outputTokens: usage.output_tokens } : {}),
              ...(typeof usage.input_tokens === "number" && typeof usage.output_tokens === "number"
                ? { totalTokens: usage.input_tokens + usage.output_tokens }
                : {})
            }
          }
        : {})
    };
  }

  private async headers(): Promise<Record<string, string>> {
    return {
      "x-api-key": await this.credentials.resolve(this.credentialRef),
      "anthropic-version": "2023-06-01"
    };
  }
}
