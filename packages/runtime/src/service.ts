import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { Command, isInterrupted } from "@langchain/langgraph";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { ApprovalRejectedError } from "./approval.js";
import { CursorAgentExecutor } from "./agents/cursor.js";
import { ModelAgentExecutor } from "./agents/model.js";
import { loadRuntimeConfig, type RuntimeConfig } from "./config.js";
import { CompositeCredentialStore, type CredentialStore } from "./credentials.js";
import { FileRunEventStore } from "./events.js";
import { McpClientBroker } from "./mcp.js";
import { ModelRouter, ProviderRegistry } from "./providers/registry.js";
import { loadAgentRoster, selectWorkflow, validateWorkflowBounds, type AgentRoster, type RosterAgent } from "./roster.js";
import { DockerSandbox } from "./sandbox/docker.js";
import { redactText } from "./security/redaction.js";
import { ToolBroker } from "./tools.js";
import type { ApprovalDecision, ProviderProbeResult, RunRecord, RuntimeApprovalHandler } from "./types.js";
import { compileCouncilGraph, initialCouncilState, type CouncilGraphState } from "./workflow.js";
import { WorktreeManager } from "./worktree.js";

export interface RuntimePlan {
  rosterId: string;
  workflowId: string;
  sequence: string[];
  council: string[];
  requiredOutputs: string[];
  mutationAgents: string[];
  cursorAgents: string[];
  modelAliases: string[];
  mcpServers: string[];
  approvals: Array<"plan" | "network" | "write" | "host-mutation" | "final-commit">;
}

export interface RuntimeValidation {
  valid: boolean;
  enabled: boolean;
  rosterId: string;
  workflows: string[];
  providers: string[];
  aliases: string[];
  warnings: string[];
}

export interface RuntimeServiceOptions {
  credentials?: CredentialStore;
  providerRegistry?: ProviderRegistry;
}

const activeRuns = new Map<string, AbortController>();

function activeRunKey(cwd: string, runId: string): string {
  return `${cwd}\0${runId}`;
}

function runId(): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  return `run-${timestamp}-${randomUUID().slice(0, 8)}`;
}

function checkpointPath(cwd: string, configured: string): string {
  if (isAbsolute(configured)) throw new Error("databasePath must be relative to the project.");
  const allowedRoot = resolve(cwd, ".agent-kit", "runtime");
  const path = resolve(cwd, configured);
  const relationship = relative(allowedRoot, path);
  if (relationship.startsWith("..") || isAbsolute(relationship)) {
    throw new Error("databasePath must remain inside .agent-kit/runtime.");
  }
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  return path;
}

function validateReferences(cwd: string, config: RuntimeConfig, roster: AgentRoster): string[] {
  const warnings: string[] = [];
  for (const [alias, route] of Object.entries(config.modelAliases)) {
    for (const candidate of route.candidates) {
      if (!config.providers[candidate.provider]) throw new Error(`Model alias ${alias} references unknown provider ${candidate.provider}.`);
    }
  }
  for (const [agent, alias] of Object.entries(config.agentRoutes)) {
    if (!config.modelAliases[alias]) throw new Error(`Agent route ${agent} references unknown model alias ${alias}.`);
  }
  const agentIds = new Set(roster.agents.map((agent) => agent.id));
  for (const agent of Object.keys(config.agentExecutors)) {
    if (!agentIds.has(agent)) throw new Error(`agentExecutors references unknown roster agent ${agent}.`);
  }
  for (const agent of config.mutationAgents) {
    if (!agentIds.has(agent)) warnings.push(`mutationAgents contains ${agent}, which is not present in this roster.`);
  }
  if (Object.keys(config.providers).length === 0) warnings.push("No model providers are configured.");
  if (Object.keys(config.modelAliases).length === 0) warnings.push("No model aliases are configured.");
  if (config.enabled && !config.modelAliases[config.defaultAlias]) {
    throw new Error(`Enabled runtime defaultAlias does not exist: ${config.defaultAlias}.`);
  }
  for (const [name, server] of Object.entries(config.mcpServers)) {
    if (server.allowedTools.length === 0) warnings.push(`MCP server ${name} exposes no tools because allowedTools is empty.`);
    if (server.transport === "stdio" && !server.allowHostExecution) {
      warnings.push(`Stdio MCP server ${name} is disabled until allowHostExecution is explicitly enabled.`);
    }
    if (server.transport === "stdio" && server.allowHostExecution && !config.sandbox.allowHostMutations) {
      throw new Error(`Stdio MCP server ${name} requires sandbox.allowHostMutations=true.`);
    }
  }
  checkpointPath(cwd, config.databasePath);
  return warnings;
}

export class AgentKitRuntimeService {
  readonly cwd: string;
  readonly config: RuntimeConfig;
  readonly roster: AgentRoster;
  readonly events: FileRunEventStore;
  readonly credentials: CredentialStore;
  readonly providers: ProviderRegistry;
  readonly router: ModelRouter;
  readonly worktrees: WorktreeManager;

  constructor(cwd: string, options: RuntimeServiceOptions = {}) {
    this.cwd = resolve(cwd);
    this.config = loadRuntimeConfig(this.cwd);
    this.roster = loadAgentRoster(this.cwd);
    this.events = new FileRunEventStore(this.cwd);
    this.credentials = options.credentials ?? new CompositeCredentialStore();
    this.providers = options.providerRegistry ?? new ProviderRegistry(this.config, this.credentials);
    this.router = new ModelRouter(this.config, this.providers);
    this.worktrees = new WorktreeManager(this.cwd);
  }

  validate(): RuntimeValidation {
    const warnings = validateReferences(this.cwd, this.config, this.roster);
    for (const workflow of this.roster.workflows) validateWorkflowBounds(workflow, this.config);
    return {
      valid: true,
      enabled: this.config.enabled,
      rosterId: this.roster.id,
      workflows: this.roster.workflows.map((workflow) => workflow.id).sort(),
      providers: Object.keys(this.config.providers).sort(),
      aliases: Object.keys(this.config.modelAliases).sort(),
      warnings
    };
  }

  plan(goal: string, requestedWorkflow?: string): RuntimePlan {
    if (!goal.trim()) throw new Error("A non-empty goal is required.");
    this.validate();
    const workflow = selectWorkflow(this.roster, requestedWorkflow, goal);
    validateWorkflowBounds(workflow, this.config);
    const approvals: RuntimePlan["approvals"] = [];
    if (this.config.approvals.requirePlan) approvals.push("plan");
    if (Object.keys(this.config.mcpServers).length > 0 || this.config.sandbox.network === "approved") approvals.push("network");
    if (workflow.sequence.some((agent) => this.config.mutationAgents.includes(agent))) approvals.push("write");
    if (
      workflow.sequence.some((agent) => this.config.agentExecutors[agent] === "cursor") ||
      Object.values(this.config.mcpServers).some((server) => server.transport === "stdio" && server.allowHostExecution)
    ) {
      approvals.push("host-mutation");
    }
    if (this.config.approvals.requireFinalCommit) approvals.push("final-commit");
    return {
      rosterId: this.roster.id,
      workflowId: workflow.id,
      sequence: [...workflow.sequence],
      council: [...workflow.council],
      requiredOutputs: [...workflow.requiredOutputs],
      mutationAgents: workflow.sequence.filter((agent) => this.config.mutationAgents.includes(agent)),
      cursorAgents: workflow.sequence.filter((agent) => this.config.agentExecutors[agent] === "cursor"),
      modelAliases: [...new Set(workflow.sequence.map((agent) => this.config.agentRoutes[agent] ?? this.config.defaultAlias))],
      mcpServers: Object.keys(this.config.mcpServers).sort(),
      approvals
    };
  }

  async run(goal: string, options: { workflowId?: string; acknowledgeDirtyBase?: boolean; signal?: AbortSignal } = {}): Promise<RunRecord> {
    if (!this.config.enabled) throw new Error("The Agent Kit runtime is disabled in .agent-kit/orchestrator.json.");
    const plan = this.plan(goal, options.workflowId);
    const id = runId();
    const worktree = await this.worktrees.create(id, {
      ...(options.acknowledgeDirtyBase !== undefined ? { acknowledgeDirtyBase: options.acknowledgeDirtyBase } : {})
    });
    const now = new Date().toISOString();
    try {
      this.events.create({
        schemaVersion: 1,
        runId: id,
        workflowId: plan.workflowId,
        goal,
        status: "planned",
        createdAt: now,
        updatedAt: now,
        sourceRoot: this.cwd,
        baseCommit: worktree.baseCommit,
        worktreePath: worktree.path,
        branchName: worktree.branchName,
        results: []
      });
      this.events.append(id, {
        type: "run_started",
        status: "planned",
        text: `Compiled ${plan.workflowId} from roster ${plan.rosterId}.`,
        data: { sequence: plan.sequence, excludedDirtyChanges: worktree.excludedDirtyChanges }
      });
      return await this.invoke(
        id,
        initialCouncilState({
          runId: id,
          workflowId: plan.workflowId,
          goal,
          sourceRoot: this.cwd,
          baseCommit: worktree.baseCommit,
          worktreePath: worktree.path
        }),
        options.signal
      );
    } catch (error) {
      if (!this.events.list().some((record) => record.runId === id)) {
        await this.worktrees.remove(worktree.path, { deleteBranch: true, force: true }).catch(() => undefined);
      }
      throw error;
    }
  }

  async resume(runId: string, input: Omit<ApprovalDecision, "decidedAt">, options: { signal?: AbortSignal } = {}): Promise<RunRecord> {
    const record = this.events.read(runId);
    if (record.status !== "awaiting-approval" || !record.pendingApproval) throw new Error(`Run ${runId} is not awaiting approval.`);
    if (record.pendingApproval.approvalId !== input.approvalId) throw new Error(`Approval id does not match run ${runId}.`);
    return this.invoke(runId, new Command({ resume: input }), options.signal);
  }

  status(runId?: string): RunRecord | RunRecord[] {
    return runId ? this.events.read(runId) : this.events.list();
  }

  cancel(runId: string): RunRecord {
    const record = this.events.read(runId);
    if (["complete", "failed", "cancelled"].includes(record.status)) return record;
    const next = this.events.update(runId, { status: "cancelled", pendingApproval: undefined, activeAgentId: undefined });
    this.events.append(runId, { type: "run_status_changed", status: "cancelled", text: "Run cancelled by operator." });
    activeRuns.get(activeRunKey(this.cwd, runId))?.abort(new Error("Run cancelled by operator."));
    return next;
  }

  async probeProvider(providerId?: string): Promise<ProviderProbeResult[]> {
    const providers = providerId ? [this.providers.get(providerId)] : this.providers.list();
    return Promise.all(providers.map((provider) => provider.probe()));
  }

  async probeMcp(server: string): Promise<unknown> {
    const broker = new McpClientBroker(this.config.mcpServers, this.credentials, this.cwd);
    try {
      return await broker.probe(server);
    } finally {
      await broker.close();
    }
  }

  async setCredential(reference: string, value: string): Promise<void> {
    await this.credentials.set(reference, value);
  }

  async deleteCredential(reference: string): Promise<boolean> {
    return this.credentials.delete(reference);
  }

  exportEvidence(runId: string): string {
    const record = this.events.read(runId);
    const events = this.events.events(runId);
    const lines = [
      `# Agent Kit Runtime Run ${record.runId}`,
      "",
      `- Workflow: \`${record.workflowId}\``,
      `- Status: \`${record.status}\``,
      `- Source commit: \`${record.baseCommit}\``,
      `- Branch: \`${record.branchName ?? "not created"}\``,
      `- Commit: \`${record.commit ?? "not committed"}\``,
      "",
      "## Goal",
      "",
      record.goal,
      "",
      "## Agent Results",
      ""
    ];
    for (const result of record.results) {
      lines.push(`### ${result.agentId}`, "", result.summary, "", `Decision: ${result.decision}`, "", `Risk: ${result.risk}`, "");
    }
    lines.push("## Event Timeline", "");
    for (const event of events) lines.push(`- ${event.createdAt} [${event.type}] ${event.agentId ? `${event.agentId}: ` : ""}${event.text ?? ""}`);
    return `${lines.join("\n")}\n`;
  }

  private async invoke(runId: string, input: CouncilGraphState | Command, externalSignal?: AbortSignal): Promise<RunRecord> {
    const record = this.events.read(runId);
    const workflow = this.roster.workflows.find((candidate) => candidate.id === record.workflowId);
    if (!workflow) throw new Error(`Run ${runId} references unknown workflow ${record.workflowId}.`);
    let database: SqliteSaver | undefined;
    let mcp: McpClientBroker | undefined;
    const controller = new AbortController();
    const key = activeRunKey(this.cwd, runId);
    if (activeRuns.has(key)) throw new Error(`Run ${runId} is already active in this process.`);
    activeRuns.set(key, controller);
    const onExternalAbort = () => controller.abort(externalSignal?.reason ?? new Error("Run cancelled by caller."));
    externalSignal?.addEventListener("abort", onExternalAbort, { once: true });
    const timeout = setTimeout(() => controller.abort(new Error(`Run timed out after ${this.config.limits.runTimeoutMs}ms.`)), this.config.limits.runTimeoutMs);
    try {
      database = SqliteSaver.fromConnString(checkpointPath(this.cwd, this.config.databasePath));
      mcp = new McpClientBroker(this.config.mcpServers, this.credentials, record.worktreePath ?? this.cwd);
      const sandbox = new DockerSandbox(this.config.sandbox, record.worktreePath ?? this.cwd);
      const tools = new ToolBroker(sandbox);
      const executorFor = (agent: RosterAgent, state: CouncilGraphState) => {
        const approve: RuntimeApprovalHandler = (request) => {
          if (request.risk === "write") return Promise.resolve(state.mutationApproved);
          if (request.risk === "network") return Promise.resolve(state.externalApproved);
          if (request.risk === "host-mutation") return Promise.resolve(state.hostMutationApproved);
          if (request.risk === "plan") return Promise.resolve(state.planApproved);
          if (request.risk === "final-commit") return Promise.resolve(state.finalCommitApproved);
          return Promise.resolve(false);
        };
        return this.config.agentExecutors[agent.id] === "cursor"
          ? new CursorAgentExecutor(this.config, approve)
          : new ModelAgentExecutor({ config: this.config, router: this.router, tools, mcp: mcp!, events: this.events, approve });
      };
      const graph = compileCouncilGraph({
        cwd: this.cwd,
        config: this.config,
        roster: this.roster,
        workflow,
        events: this.events,
        worktrees: this.worktrees,
        checkpointer: database,
        executorFor,
        signal: controller.signal
      });
      const output = await graph.invoke(input, {
        configurable: { thread_id: runId },
        recursionLimit: this.config.limits.maxSteps + workflow.sequence.length + 12,
        signal: controller.signal
      });
      if (isInterrupted(output)) return this.events.read(runId);
      const complete = this.events.update(runId, {
        status: "complete",
        pendingApproval: undefined,
        activeAgentId: undefined,
        results: output.results,
        ...(output.commit ? { commit: output.commit } : {})
      });
      this.events.append(runId, {
        type: "run_completed",
        status: "complete",
        text: output.commit ? `Run completed at commit ${output.commit}.` : "Run completed with no file changes."
      });
      return complete;
    } catch (error) {
      if (error instanceof ApprovalRejectedError) {
        this.events.append(runId, { type: "run_status_changed", status: "cancelled", text: error.message });
        return this.events.read(runId);
      }
      if (controller.signal.aborted) {
        const reason = controller.signal.reason instanceof Error ? controller.signal.reason.message : String(controller.signal.reason ?? "Run cancelled.");
        const status = reason.includes("timed out") ? "failed" : "cancelled";
        this.events.update(runId, { status, error: redactText(reason), pendingApproval: undefined, activeAgentId: undefined });
        this.events.append(runId, { type: status === "failed" ? "run_error" : "run_status_changed", status, text: redactText(reason) });
        return this.events.read(runId);
      }
      const message = redactText(error instanceof Error ? error.message : String(error));
      this.events.update(runId, { status: "failed", error: message, pendingApproval: undefined, activeAgentId: undefined });
      this.events.append(runId, { type: "run_error", status: "failed", text: message });
      return this.events.read(runId);
    } finally {
      clearTimeout(timeout);
      externalSignal?.removeEventListener("abort", onExternalAbort);
      activeRuns.delete(key);
      if (mcp) await mcp.close();
      if (database) closeCheckpointDatabase(database);
    }
  }
}

function closeCheckpointDatabase(saver: SqliteSaver): void {
  const database: unknown = saver.db;
  if (!isCloseable(database)) {
    throw new Error("SQLite checkpoint database does not expose close().");
  }
  database.close();
}

function isCloseable(value: unknown): value is { close(): void } {
  return Boolean(value && typeof value === "object" && "close" in value && typeof value.close === "function");
}
