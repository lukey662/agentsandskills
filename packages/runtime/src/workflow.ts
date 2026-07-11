import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import type { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { requestGraphApproval } from "./approval.js";
import type { RuntimeConfig } from "./config.js";
import type { FileRunEventStore } from "./events.js";
import type { AgentRoster, RosterAgent, RosterWorkflow } from "./roster.js";
import { readAgentInstructions } from "./roster.js";
import type { AgentNodeExecutor, AgentNodeResult } from "./types.js";
import type { WorktreeManager } from "./worktree.js";

const CouncilState = Annotation.Root({
  runId: Annotation<string>(),
  workflowId: Annotation<string>(),
  goal: Annotation<string>(),
  sourceRoot: Annotation<string>(),
  baseCommit: Annotation<string>(),
  worktreePath: Annotation<string>(),
  results: Annotation<AgentNodeResult[]>(),
  visits: Annotation<Record<string, number>>(),
  steps: Annotation<number>(),
  planApproved: Annotation<boolean>(),
  externalApproved: Annotation<boolean>(),
  mutationApproved: Annotation<boolean>(),
  hostMutationApproved: Annotation<boolean>(),
  finalCommitApproved: Annotation<boolean>(),
  commit: Annotation<string | null>()
});

export type CouncilGraphState = typeof CouncilState.State;
type CouncilGraphUpdate = typeof CouncilState.Update;
type DynamicStateGraph = StateGraph<typeof CouncilState.spec, CouncilGraphState, CouncilGraphUpdate, string>;

export interface CouncilGraphDependencies {
  cwd: string;
  config: RuntimeConfig;
  roster: AgentRoster;
  workflow: RosterWorkflow;
  events: FileRunEventStore;
  worktrees: WorktreeManager;
  checkpointer: SqliteSaver;
  executorFor(agent: RosterAgent, state: CouncilGraphState): AgentNodeExecutor;
  signal?: AbortSignal;
}

export function initialCouncilState(input: {
  runId: string;
  workflowId: string;
  goal: string;
  sourceRoot: string;
  baseCommit: string;
  worktreePath: string;
}): CouncilGraphState {
  return {
    ...input,
    results: [],
    visits: {},
    steps: 0,
    planApproved: false,
    externalApproved: false,
    mutationApproved: false,
    hostMutationApproved: false,
    finalCommitApproved: false,
    commit: null
  };
}

function safeNodeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function compileCouncilGraph(dependencies: CouncilGraphDependencies) {
  const { config, workflow, roster, events, worktrees } = dependencies;
  const agents = new Map(roster.agents.map((agent) => [agent.id, agent]));
  const builder = new StateGraph(CouncilState) as unknown as DynamicStateGraph;
  const nodes: string[] = [];
  const addNode = (name: string, action: (state: CouncilGraphState) => Promise<CouncilGraphUpdate> | CouncilGraphUpdate) => {
    builder.addNode(name, action);
    nodes.push(name);
  };

  if (config.approvals.requirePlan) {
    addNode("gate_plan", (state) => {
      requestGraphApproval(events, {
        runId: state.runId,
        gate: "plan",
        risk: "plan",
        title: `Approve ${workflow.id} workflow plan`,
        detail: `Sequence: ${workflow.sequence.join(" -> ")}. Goal: ${state.goal.slice(0, 1_000)}`
      });
      return { planApproved: true };
    });
  }

  const needsExternalApproval = Object.keys(config.mcpServers).length > 0 || config.sandbox.network === "approved";
  if (needsExternalApproval) {
    addNode("gate_external", (state) => {
      requestGraphApproval(events, {
        runId: state.runId,
        gate: "external",
        risk: "network",
        title: "Allow configured external tool access",
        detail: "Approved MCP allowlists and sandbox network commands may be used during this run. Redirects and non-allowlisted MCP hosts remain blocked."
      });
      return { externalApproved: true };
    });
  }

  const cursorAgents = workflow.sequence.filter((agentId) => config.agentExecutors[agentId] === "cursor");
  const hostMcpServers = Object.entries(config.mcpServers)
    .filter(([, server]) => server.transport === "stdio" && server.allowHostExecution)
    .map(([name]) => name);
  if (cursorAgents.length > 0 || hostMcpServers.length > 0) {
    if (!config.sandbox.allowHostMutations) {
      throw new Error("Cursor and host-executed stdio MCP routes require sandbox.allowHostMutations=true.");
    }
    if (cursorAgents.length > 0 && !config.cursor.enabled) throw new Error("Cursor routes require cursor.enabled=true.");
    addNode("gate_host_mutation", (state) => {
      requestGraphApproval(events, {
        runId: state.runId,
        gate: "host-mutation",
        risk: "host-mutation",
        title: "Allow configured host execution",
        detail: `Cursor agents: ${cursorAgents.join(", ") || "none"}. Stdio MCP servers: ${hostMcpServers.join(", ") || "none"}. Execution remains scoped to the isolated worktree; Agent Kit will not merge, push, or open a pull request.`
      });
      return { hostMutationApproved: true };
    });
  }

  let mutationGateAdded = false;
  for (const [index, agentId] of workflow.sequence.entries()) {
    const agent = agents.get(agentId);
    if (!agent) throw new Error(`Workflow ${workflow.id} references unknown agent ${agentId}.`);
    const mutationAllowed = config.mutationAgents.includes(agentId);
    if (mutationAllowed && !mutationGateAdded) {
      mutationGateAdded = true;
      addNode("gate_mutation", (state) => {
        requestGraphApproval(events, {
          runId: state.runId,
          gate: "mutation",
          risk: "write",
          title: "Allow isolated worktree mutations",
          detail:
            "Approved implementation agents may edit only the isolated run worktree. Destructive commands, merges, pushes, and host mutations remain blocked."
        });
        return { mutationApproved: true };
      });
    }
    const nodeName = `agent_${index}_${safeNodeSegment(agentId)}`;
    addNode(nodeName, async (state) => {
      if (state.steps >= config.limits.maxSteps) throw new Error(`Run exceeded maxSteps=${config.limits.maxSteps}.`);
      const visits = (state.visits[agentId] ?? 0) + 1;
      if (visits > config.limits.maxAgentVisits) throw new Error(`Agent ${agentId} exceeded maxAgentVisits=${config.limits.maxAgentVisits}.`);
      events.update(state.runId, { activeAgentId: agentId, status: "running" });
      events.append(state.runId, { type: "agent_started", agentId, text: `${agent.name ?? agent.id} started.` });
      const execute = () =>
        dependencies.executorFor(agent, state).execute(
          {
            runId: state.runId,
            workflowId: workflow.id,
            agentId,
            goal: state.goal,
            instructions: readAgentInstructions(dependencies.cwd, agent),
            requiredOutputs: workflow.requiredOutputs,
            allowedHandoffs: agent.handsOffTo ?? [],
            mutationAllowed: mutationAllowed && state.mutationApproved,
            priorResults: state.results,
            worktreePath: state.worktreePath
          },
          dependencies.signal
        );
      const attempts = mutationAllowed ? 1 : config.limits.maxRetriesPerNode + 1;
      let result: AgentNodeResult | undefined;
      let lastError: Error | undefined;
      for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
          result = await execute();
          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          if (attempt < attempts) {
            events.append(state.runId, { type: "run_error", agentId, text: `Retrying read-only node after attempt ${attempt}: ${lastError.message}` });
          }
        }
      }
      if (!result) throw lastError ?? new Error(`Agent ${agentId} failed without an error.`);
      events.append(state.runId, { type: "agent_completed", agentId, text: result.summary });
      for (const artifact of result.artifacts) events.append(state.runId, { type: "artifact", agentId, text: artifact });
      for (const verification of result.verification) events.append(state.runId, { type: "verification", agentId, text: verification });
      const nextAgent = workflow.sequence[index + 1];
      if (nextAgent) events.append(state.runId, { type: "handoff", agentId, text: `${agentId} -> ${nextAgent}`, data: { from: agentId, to: nextAgent } });
      events.update(state.runId, { activeAgentId: undefined, results: [...state.results, result] });
      return {
        results: [...state.results, result],
        visits: { ...state.visits, [agentId]: visits },
        steps: state.steps + 1
      };
    });
  }

  if (config.approvals.requireFinalCommit) {
    addNode("gate_final_commit", async (state) => {
      const changed = await worktrees.changes(state.worktreePath);
      if (!changed) return { finalCommitApproved: true };
      requestGraphApproval(events, {
        runId: state.runId,
        gate: "final-commit",
        risk: "final-commit",
        title: "Approve the scoped worktree commit",
        detail: changed.slice(0, 4_000)
      });
      return { finalCommitApproved: true };
    });
  }

  addNode("finalize_commit", async (state) => {
    const changed = await worktrees.changes(state.worktreePath);
    if (!changed) {
      const head = await worktrees.head(state.worktreePath);
      if (head !== state.baseCommit) {
        events.update(state.runId, { commit: head });
        return { commit: head };
      }
      return { commit: null };
    }
    if (config.approvals.requireFinalCommit && !state.finalCommitApproved) throw new Error("Final commit approval is required.");
    const committed = await worktrees.commit(state.worktreePath, state.runId, state.goal);
    events.update(state.runId, { commit: committed.commit, changed: committed.changed });
    events.append(state.runId, { type: "artifact", text: `Created scoped commit ${committed.commit}.`, data: { commit: committed.commit } });
    return { commit: committed.commit };
  });

  if (nodes.length === 0) throw new Error(`Workflow ${workflow.id} compiled to no graph nodes.`);
  builder.addEdge(START, nodes[0]!);
  for (let index = 0; index < nodes.length - 1; index += 1) builder.addEdge(nodes[index]!, nodes[index + 1]!);
  builder.addEdge(nodes.at(-1)!, END);
  return builder.compile({ checkpointer: dependencies.checkpointer });
}
