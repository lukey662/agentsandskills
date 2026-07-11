import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { ModelCapability } from "./types.js";

export const RUNTIME_CONFIG_PATH = ".agent-kit/orchestrator.json";

const CapabilityContract = z.enum(["text", "tools", "parallel-tools", "structured-output", "streaming", "vision", "reasoning", "usage"]);

const CredentialRefContract = z.string().regex(/^(?:env:[A-Z][A-Z0-9_]*|keychain:[a-zA-Z0-9_.:@/-]+)$/);

const ProviderContract = z
  .object({
    kind: z.enum(["openai", "anthropic", "gemini", "xai", "deepseek", "kimi", "glm", "openrouter", "ollama", "lm-studio", "vllm", "openai-compatible"]),
    baseUrl: z.string().url().optional(),
    credentialRef: CredentialRefContract.optional(),
    allowPrivateNetwork: z.boolean().default(false),
    capabilities: z.array(CapabilityContract).optional(),
    timeoutMs: z.number().int().min(1_000).max(600_000).default(120_000)
  })
  .strict();

const CandidateContract = z
  .object({
    provider: z.string().min(1),
    model: z.string().min(1)
  })
  .strict();

const AliasContract = z
  .object({
    candidates: z.array(CandidateContract).min(1),
    requiredCapabilities: z.array(CapabilityContract).default(["text"]),
    maxAttempts: z.number().int().min(1).max(10).default(3)
  })
  .strict();

const LocalMcpContract = z
  .object({
    transport: z.literal("stdio"),
    command: z.string().min(1),
    args: z.array(z.string()).default([]),
    envRefs: z.record(z.string(), CredentialRefContract).default({}),
    allowHostExecution: z.boolean().default(false),
    allowedTools: z.array(z.string()).default([])
  })
  .strict();

const RemoteMcpContract = z
  .object({
    transport: z.literal("streamable-http"),
    url: z.string().url(),
    authRef: CredentialRefContract.optional(),
    allowedHosts: z.array(z.string().min(1)).min(1),
    allowPrivateNetwork: z.boolean().default(false),
    allowedTools: z.array(z.string()).default([])
  })
  .strict();

export const RuntimeConfigContract = z
  .object({
    schemaVersion: z.literal(1),
    enabled: z.boolean().default(false),
    defaultWorkflow: z.string().min(1).default("planning"),
    defaultAlias: z.string().min(1).default("balanced"),
    databasePath: z.string().min(1).default(".agent-kit/runtime/runtime.sqlite"),
    providers: z.record(z.string(), ProviderContract).default({}),
    modelAliases: z.record(z.string(), AliasContract).default({}),
    agentRoutes: z.record(z.string(), z.string().min(1)).default({}),
    agentExecutors: z.record(z.string(), z.enum(["model", "cursor"])).default({}),
    mutationAgents: z
      .array(z.string().min(1))
      .default([
        "supabase-postgres-engineer",
        "nextjs-engineer",
        "frontend-design-lead",
        "marketing-copy-lead",
        "qa-engineer",
        "docs-maintainer",
        "deployment-observability-engineer"
      ]),
    cursor: z
      .object({
        enabled: z.boolean().default(false),
        command: z.string().min(1).default("cursor-agent"),
        args: z.array(z.string()).default(["--print", "--output-format", "stream-json", "--force"]),
        timeoutMs: z.number().int().min(1_000).max(3_600_000).default(900_000)
      })
      .strict()
      .default({ enabled: false, command: "cursor-agent", args: ["--print", "--output-format", "stream-json", "--force"], timeoutMs: 900_000 }),
    mcpServers: z.record(z.string(), z.discriminatedUnion("transport", [LocalMcpContract, RemoteMcpContract])).default({}),
    sandbox: z
      .object({
        provider: z.enum(["docker", "host-readonly"]).default("docker"),
        image: z.string().min(1).default("node:22-bookworm-slim"),
        network: z.enum(["none", "approved"]).default("none"),
        allowHostMutations: z.boolean().default(false),
        timeoutMs: z.number().int().min(1_000).max(3_600_000).default(600_000),
        memoryMb: z.number().int().min(128).max(32_768).default(2_048),
        cpus: z.number().positive().max(32).default(2)
      })
      .strict()
      .default({
        provider: "docker",
        image: "node:22-bookworm-slim",
        network: "none",
        allowHostMutations: false,
        timeoutMs: 600_000,
        memoryMb: 2_048,
        cpus: 2
      }),
    approvals: z
      .object({
        mode: z.literal("risk-tiered").default("risk-tiered"),
        requirePlan: z.boolean().default(true),
        requireFinalCommit: z.boolean().default(true)
      })
      .strict()
      .default({ mode: "risk-tiered", requirePlan: true, requireFinalCommit: true }),
    limits: z
      .object({
        maxSteps: z.number().int().min(1).max(100).default(24),
        maxAgentVisits: z.number().int().min(1).max(10).default(2),
        maxRetriesPerNode: z.number().int().min(0).max(5).default(2),
        maxToolCallsPerAgent: z.number().int().min(0).max(100).default(20),
        runTimeoutMs: z.number().int().min(1_000).max(86_400_000).default(3_600_000)
      })
      .strict()
      .default({
        maxSteps: 24,
        maxAgentVisits: 2,
        maxRetriesPerNode: 2,
        maxToolCallsPerAgent: 20,
        runTimeoutMs: 3_600_000
      })
  })
  .strict();

export type RuntimeConfig = z.infer<typeof RuntimeConfigContract>;
export type ProviderConfig = z.infer<typeof ProviderContract>;
export type ModelAliasConfig = z.infer<typeof AliasContract>;
export type McpServerConfig = z.infer<typeof LocalMcpContract> | z.infer<typeof RemoteMcpContract>;

export function loadRuntimeConfig(cwd: string): RuntimeConfig {
  const path = join(cwd, RUNTIME_CONFIG_PATH);
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
  } catch (error) {
    throw new Error(`Could not read ${RUNTIME_CONFIG_PATH}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const result = RuntimeConfigContract.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(`Invalid ${RUNTIME_CONFIG_PATH}${issue ? ` at ${issue.path.join(".")}: ${issue.message}` : "."}`);
  }
  return result.data;
}

export function requiredCapabilities(config: RuntimeConfig, alias: string): ModelCapability[] {
  return [...(config.modelAliases[alias]?.requiredCapabilities ?? ["text"])] as ModelCapability[];
}
