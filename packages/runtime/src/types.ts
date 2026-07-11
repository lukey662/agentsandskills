export type ModelCapability = "text" | "tools" | "parallel-tools" | "structured-output" | "streaming" | "vision" | "reasoning" | "usage";

export interface ModelMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface ModelToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  risk: "read" | "write" | "network" | "secret" | "destructive";
}

export interface ModelToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ModelUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface ModelRequest {
  model: string;
  messages: ModelMessage[];
  tools?: ModelToolDefinition[];
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}

export interface ModelResponse {
  text: string;
  toolCalls: ModelToolCall[];
  finishReason?: string;
  usage?: ModelUsage;
  providerResponseId?: string;
}

export interface ProviderProbeResult {
  providerId: string;
  available: boolean;
  capabilities: ModelCapability[];
  models?: string[];
  latencyMs: number;
  error?: string;
}

export interface ModelProviderAdapter {
  readonly id: string;
  readonly capabilities: ReadonlySet<ModelCapability>;
  probe(signal?: AbortSignal): Promise<ProviderProbeResult>;
  invoke(request: ModelRequest): Promise<ModelResponse>;
}

export interface RoutedModelResult {
  providerId: string;
  model: string;
  response: ModelResponse;
  attempts: Array<{ providerId: string; model: string; outcome: "selected" | "capability-mismatch" | "error"; detail?: string }>;
}

export interface AgentNodeInput {
  runId: string;
  workflowId: string;
  agentId: string;
  goal: string;
  instructions: string;
  requiredOutputs: string[];
  allowedHandoffs: string[];
  mutationAllowed: boolean;
  priorResults: AgentNodeResult[];
  worktreePath?: string;
}

export interface AgentNodeResult {
  agentId: string;
  summary: string;
  decision: string;
  risk: string;
  artifacts: string[];
  verification: string[];
  requestedHandoff?: string;
}

export interface AgentNodeExecutor {
  execute(input: AgentNodeInput, signal?: AbortSignal): Promise<AgentNodeResult>;
}

export interface RuntimeApprovalHandler {
  (request: Omit<ApprovalRequest, "approvalId" | "requestedAt">): Promise<boolean>;
}

export type ApprovalRisk = "plan" | "write" | "network" | "secret" | "destructive" | "host-mutation" | "final-commit";

export interface ApprovalRequest {
  approvalId: string;
  runId: string;
  risk: ApprovalRisk;
  title: string;
  detail: string;
  requestedAt: string;
}

export interface ApprovalDecision {
  approvalId: string;
  decision: "approve" | "reject";
  decidedAt: string;
  actor?: string;
  note?: string;
}

export type RunStatus = "planned" | "running" | "awaiting-approval" | "blocked" | "cancelled" | "failed" | "complete";

export interface RunEvent {
  schemaVersion: 1;
  eventId: string;
  sequence: number;
  runId: string;
  createdAt: string;
  type:
    | "run_started"
    | "run_status_changed"
    | "agent_started"
    | "agent_completed"
    | "handoff"
    | "approval_requested"
    | "approval_decided"
    | "tool_started"
    | "tool_completed"
    | "provider_selected"
    | "artifact"
    | "verification"
    | "run_error"
    | "run_completed";
  agentId?: string;
  text?: string;
  status?: RunStatus;
  approval?: ApprovalRequest | ApprovalDecision;
  data?: Record<string, unknown>;
}

export interface RunRecord {
  schemaVersion: 1;
  runId: string;
  workflowId: string;
  goal: string;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  sourceRoot: string;
  baseCommit: string;
  worktreePath?: string;
  branchName?: string;
  activeAgentId?: string | undefined;
  pendingApproval?: ApprovalRequest | undefined;
  commit?: string;
  changed?: string;
  results: AgentNodeResult[];
  error?: string;
}

export interface RuntimeCommandResult {
  ok: boolean;
  command: string;
  run?: RunRecord;
  runs?: RunRecord[];
  data?: unknown;
  message?: string;
}
