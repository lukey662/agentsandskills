import type { ProviderConfig } from "../config.js";
import type { ModelCapability, ModelMessage, ModelProviderAdapter, ModelRequest, ModelResponse, ModelToolCall, ProviderProbeResult } from "../types.js";
import type { CredentialStore } from "../credentials.js";
import { assertSafeProviderUrl, fetchJson, joinUrl } from "./http.js";

const PROVIDER_DEFAULTS: Record<ProviderConfig["kind"], { baseUrl: string; credentialRef?: string; capabilities: ModelCapability[] }> = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    credentialRef: "env:OPENAI_API_KEY",
    capabilities: ["text", "tools", "parallel-tools", "structured-output", "streaming", "vision", "reasoning", "usage"]
  },
  xai: {
    baseUrl: "https://api.x.ai/v1",
    credentialRef: "env:XAI_API_KEY",
    capabilities: ["text", "tools", "parallel-tools", "structured-output", "streaming", "vision", "reasoning", "usage"]
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    credentialRef: "env:DEEPSEEK_API_KEY",
    capabilities: ["text", "tools", "streaming", "reasoning", "usage"]
  },
  kimi: {
    baseUrl: "https://api.moonshot.ai/v1",
    credentialRef: "env:KIMI_API_KEY",
    capabilities: ["text", "tools", "streaming", "reasoning", "usage"]
  },
  glm: {
    baseUrl: "https://api.z.ai/api/paas/v4",
    credentialRef: "env:ZAI_API_KEY",
    capabilities: ["text", "tools", "streaming", "reasoning", "usage"]
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    credentialRef: "env:OPENROUTER_API_KEY",
    capabilities: ["text", "streaming", "usage"]
  },
  ollama: { baseUrl: "http://127.0.0.1:11434/v1", capabilities: ["text"] },
  "lm-studio": { baseUrl: "http://127.0.0.1:1234/v1", capabilities: ["text"] },
  vllm: { baseUrl: "http://127.0.0.1:8000/v1", capabilities: ["text"] },
  "openai-compatible": { baseUrl: "http://127.0.0.1:8000/v1", capabilities: ["text"] },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    credentialRef: "env:ANTHROPIC_API_KEY",
    capabilities: ["text", "tools", "streaming", "vision", "reasoning", "usage"]
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com",
    credentialRef: "env:GEMINI_API_KEY",
    capabilities: ["text", "tools", "parallel-tools", "structured-output", "streaming", "vision", "reasoning", "usage"]
  }
};

function normalizeMessages(messages: ModelMessage[]): Array<Record<string, unknown>> {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    ...(message.name ? { name: message.name } : {}),
    ...(message.toolCallId ? { tool_call_id: message.toolCallId } : {})
  }));
}

export class OpenAICompatibleAdapter implements ModelProviderAdapter {
  readonly id: string;
  readonly capabilities: ReadonlySet<ModelCapability>;
  readonly baseUrl: string;
  private readonly credentialRef: string | undefined;
  private readonly timeoutMs: number;
  private readonly allowPrivateNetwork: boolean;

  constructor(
    id: string,
    config: ProviderConfig,
    private readonly credentials: CredentialStore
  ) {
    this.id = id;
    const defaults = PROVIDER_DEFAULTS[config.kind];
    this.baseUrl = config.baseUrl ?? defaults.baseUrl;
    this.credentialRef = config.credentialRef ?? defaults.credentialRef;
    this.timeoutMs = config.timeoutMs;
    this.allowPrivateNetwork = config.allowPrivateNetwork;
    this.capabilities = new Set((config.capabilities ?? defaults.capabilities) as ModelCapability[]);
  }

  async probe(signal?: AbortSignal): Promise<ProviderProbeResult> {
    const started = Date.now();
    try {
      const endpoint = joinUrl(this.baseUrl, "models");
      await assertSafeProviderUrl(this.baseUrl, endpoint, this.allowPrivateNetwork);
      const headers = await this.headers();
      const payload = await fetchJson(endpoint, { headers }, { timeoutMs: Math.min(this.timeoutMs, 15_000), ...(signal ? { signal } : {}) });
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
    const endpoint = joinUrl(this.baseUrl, "chat/completions");
    await assertSafeProviderUrl(this.baseUrl, endpoint, this.allowPrivateNetwork);
    const payload = await fetchJson(
      endpoint,
      {
        method: "POST",
        headers: { ...(await this.headers()), "Content-Type": "application/json" },
        body: JSON.stringify({
          model: request.model,
          messages: normalizeMessages(request.messages),
          ...(request.tools?.length
            ? {
                tools: request.tools.map((tool) => ({
                  type: "function",
                  function: { name: tool.name, description: tool.description, parameters: tool.inputSchema }
                }))
              }
            : {}),
          ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
          ...(request.maxOutputTokens !== undefined ? { max_tokens: request.maxOutputTokens } : {})
        })
      },
      { timeoutMs: this.timeoutMs, ...(request.signal ? { signal: request.signal } : {}) }
    );
    const choice = Array.isArray(payload.choices) ? payload.choices[0] : undefined;
    const choiceRecord = choice && typeof choice === "object" ? (choice as Record<string, unknown>) : {};
    const message = choiceRecord.message && typeof choiceRecord.message === "object" ? (choiceRecord.message as Record<string, unknown>) : {};
    const toolCalls: ModelToolCall[] = Array.isArray(message.tool_calls)
      ? message.tool_calls.flatMap((call, index) => {
          if (!call || typeof call !== "object") return [];
          const record = call as Record<string, unknown>;
          const fn = record.function && typeof record.function === "object" ? (record.function as Record<string, unknown>) : {};
          if (typeof fn.name !== "string") return [];
          let args: Record<string, unknown> = {};
          if (typeof fn.arguments === "string") {
            try {
              const parsed = JSON.parse(fn.arguments) as unknown;
              if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) args = parsed as Record<string, unknown>;
            } catch {
              throw new Error(`Provider returned invalid JSON arguments for tool ${fn.name}.`);
            }
          }
          return [{ id: typeof record.id === "string" ? record.id : `${fn.name}-${index}`, name: fn.name, arguments: args }];
        })
      : [];
    const usage = payload.usage && typeof payload.usage === "object" ? (payload.usage as Record<string, unknown>) : undefined;
    return {
      text: typeof message.content === "string" ? message.content : "",
      toolCalls,
      ...(typeof choiceRecord.finish_reason === "string" ? { finishReason: choiceRecord.finish_reason } : {}),
      ...(typeof payload.id === "string" ? { providerResponseId: payload.id } : {}),
      ...(usage
        ? {
            usage: {
              ...(typeof usage.prompt_tokens === "number" ? { inputTokens: usage.prompt_tokens } : {}),
              ...(typeof usage.completion_tokens === "number" ? { outputTokens: usage.completion_tokens } : {}),
              ...(typeof usage.total_tokens === "number" ? { totalTokens: usage.total_tokens } : {})
            }
          }
        : {})
    };
  }

  private async headers(): Promise<Record<string, string>> {
    if (!this.credentialRef) return {};
    return { Authorization: `Bearer ${await this.credentials.resolve(this.credentialRef)}` };
  }
}
