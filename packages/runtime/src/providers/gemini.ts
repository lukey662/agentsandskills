import type { ProviderConfig } from "../config.js";
import type { CredentialStore } from "../credentials.js";
import type { ModelCapability, ModelProviderAdapter, ModelRequest, ModelResponse, ProviderProbeResult } from "../types.js";
import { assertSafeProviderUrl, fetchJson, joinUrl } from "./http.js";

export class GeminiAdapter implements ModelProviderAdapter {
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
    this.baseUrl = config.baseUrl ?? "https://generativelanguage.googleapis.com";
    this.credentialRef = config.credentialRef ?? "env:GEMINI_API_KEY";
    this.timeoutMs = config.timeoutMs;
    this.allowPrivateNetwork = config.allowPrivateNetwork;
    this.capabilities = new Set(
      (config.capabilities ?? ["text", "tools", "parallel-tools", "structured-output", "streaming", "vision", "reasoning", "usage"]) as ModelCapability[]
    );
  }

  async probe(signal?: AbortSignal): Promise<ProviderProbeResult> {
    const started = Date.now();
    try {
      const endpoint = joinUrl(this.baseUrl, "v1beta/models");
      await assertSafeProviderUrl(this.baseUrl, endpoint, this.allowPrivateNetwork);
      const payload = await fetchJson(
        endpoint,
        { headers: { "x-goog-api-key": await this.credentials.resolve(this.credentialRef) } },
        { timeoutMs: 15_000, ...(signal ? { signal } : {}) }
      );
      const models = (Array.isArray(payload.models) ? payload.models : []).flatMap((item) =>
        item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string"
          ? [(item as { name: string }).name.replace(/^models\//, "")]
          : []
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
    const endpoint = joinUrl(this.baseUrl, `v1beta/models/${encodeURIComponent(request.model)}:generateContent`);
    await assertSafeProviderUrl(this.baseUrl, endpoint, this.allowPrivateNetwork);
    const systemInstruction = request.messages
      .filter((message) => message.role === "system")
      .map((message) => message.content)
      .join("\n\n");
    const contents = request.messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts:
          message.role === "tool"
            ? [{ functionResponse: { name: message.name ?? "tool", response: { output: message.content } } }]
            : [{ text: message.content }]
      }));
    const payload = await fetchJson(
      endpoint,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": await this.credentials.resolve(this.credentialRef) },
        body: JSON.stringify({
          ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
          contents,
          generationConfig: {
            ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
            ...(request.maxOutputTokens !== undefined ? { maxOutputTokens: request.maxOutputTokens } : {})
          },
          ...(request.tools?.length
            ? {
                tools: [
                  {
                    functionDeclarations: request.tools.map((tool) => ({
                      name: tool.name,
                      description: tool.description,
                      parameters: tool.inputSchema
                    }))
                  }
                ]
              }
            : {})
        })
      },
      { timeoutMs: this.timeoutMs, ...(request.signal ? { signal: request.signal } : {}) }
    );
    const candidate = Array.isArray(payload.candidates) ? payload.candidates[0] : undefined;
    const candidateRecord = candidate && typeof candidate === "object" ? (candidate as Record<string, unknown>) : {};
    const content = candidateRecord.content && typeof candidateRecord.content === "object" ? (candidateRecord.content as Record<string, unknown>) : {};
    const parts = Array.isArray(content.parts) ? content.parts : [];
    const text = parts
      .flatMap((part) => (part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string" ? [(part as { text: string }).text] : []))
      .join("\n");
    const toolCalls = parts.flatMap((part, index) => {
      if (!part || typeof part !== "object") return [];
      const functionCall = (part as Record<string, unknown>).functionCall;
      if (!functionCall || typeof functionCall !== "object") return [];
      const record = functionCall as Record<string, unknown>;
      if (typeof record.name !== "string") return [];
      return [
        {
          id: `gemini-${index}-${record.name}`,
          name: record.name,
          arguments: record.args && typeof record.args === "object" && !Array.isArray(record.args) ? (record.args as Record<string, unknown>) : {}
        }
      ];
    });
    const usage = payload.usageMetadata && typeof payload.usageMetadata === "object" ? (payload.usageMetadata as Record<string, unknown>) : undefined;
    return {
      text,
      toolCalls,
      ...(typeof candidateRecord.finishReason === "string" ? { finishReason: candidateRecord.finishReason } : {}),
      ...(usage
        ? {
            usage: {
              ...(typeof usage.promptTokenCount === "number" ? { inputTokens: usage.promptTokenCount } : {}),
              ...(typeof usage.candidatesTokenCount === "number" ? { outputTokens: usage.candidatesTokenCount } : {}),
              ...(typeof usage.totalTokenCount === "number" ? { totalTokens: usage.totalTokenCount } : {})
            }
          }
        : {})
    };
  }
}
