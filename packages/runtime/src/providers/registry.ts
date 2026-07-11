import type { RuntimeConfig } from "../config.js";
import type { CredentialStore } from "../credentials.js";
import type { ModelCapability, ModelProviderAdapter, ModelRequest, RoutedModelResult } from "../types.js";
import { AnthropicAdapter } from "./anthropic.js";
import { GeminiAdapter } from "./gemini.js";
import { OpenAICompatibleAdapter } from "./openai-compatible.js";

export class ProviderRegistry {
  private readonly providers = new Map<string, ModelProviderAdapter>();

  constructor(config: RuntimeConfig, credentials: CredentialStore) {
    for (const [id, provider] of Object.entries(config.providers)) {
      const adapter =
        provider.kind === "anthropic"
          ? new AnthropicAdapter(id, provider, credentials)
          : provider.kind === "gemini"
            ? new GeminiAdapter(id, provider, credentials)
            : new OpenAICompatibleAdapter(id, provider, credentials);
      this.providers.set(id, adapter);
    }
  }

  register(adapter: ModelProviderAdapter): void {
    if (this.providers.has(adapter.id)) throw new Error(`Provider is already registered: ${adapter.id}`);
    this.providers.set(adapter.id, adapter);
  }

  get(id: string): ModelProviderAdapter {
    const provider = this.providers.get(id);
    if (!provider) throw new Error(`Unknown provider: ${id}`);
    return provider;
  }

  list(): ModelProviderAdapter[] {
    return [...this.providers.values()].sort((left, right) => left.id.localeCompare(right.id));
  }
}

export class ModelRouter {
  constructor(
    private readonly config: RuntimeConfig,
    private readonly registry: ProviderRegistry
  ) {}

  async invoke(alias: string, request: Omit<ModelRequest, "model">): Promise<RoutedModelResult> {
    const route = this.config.modelAliases[alias];
    if (!route) throw new Error(`Unknown model alias: ${alias}`);
    const required = new Set([...(route.requiredCapabilities as ModelCapability[]), ...(request.tools?.length ? (["tools"] as ModelCapability[]) : [])]);
    const attempts: RoutedModelResult["attempts"] = [];
    let attempted = 0;
    let lastError: Error | undefined;

    for (const candidate of route.candidates) {
      if (attempted >= route.maxAttempts) break;
      const provider = this.registry.get(candidate.provider);
      const missing = [...required].filter((capability) => !provider.capabilities.has(capability));
      if (missing.length > 0) {
        attempts.push({
          providerId: provider.id,
          model: candidate.model,
          outcome: "capability-mismatch",
          detail: `Missing: ${missing.join(", ")}`
        });
        continue;
      }
      attempted += 1;
      try {
        const response = await provider.invoke({ ...request, model: candidate.model });
        attempts.push({ providerId: provider.id, model: candidate.model, outcome: "selected" });
        return { providerId: provider.id, model: candidate.model, response, attempts };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempts.push({ providerId: provider.id, model: candidate.model, outcome: "error", detail: lastError.message });
      }
    }

    const capabilityOnly = attempts.length > 0 && attempts.every((attempt) => attempt.outcome === "capability-mismatch");
    if (capabilityOnly) throw new Error(`No candidate for alias ${alias} satisfies required capabilities: ${[...required].join(", ")}.`);
    throw new Error(`All candidates for alias ${alias} failed${lastError ? `: ${lastError.message}` : "."}`);
  }
}
