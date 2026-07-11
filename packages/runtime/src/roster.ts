import { readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { z } from "zod";
import type { RuntimeConfig } from "./config.js";

const AgentContract = z
  .object({
    id: z.string().min(1),
    name: z.string().optional(),
    file: z.string().optional(),
    defaultFor: z.array(z.string()).optional(),
    skills: z.array(z.string()).min(1),
    handsOffTo: z.array(z.string()).optional()
  })
  .strict();

const WorkflowContract = z
  .object({
    id: z.string().min(1),
    triggers: z.array(z.string()).optional(),
    sequence: z.array(z.string()).min(1),
    council: z.array(z.string()),
    requiredOutputs: z.array(z.string())
  })
  .strict();

const RosterContract = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().min(1),
    stack: z.string().min(1),
    required: z.boolean(),
    defaultWorkflow: z.string().min(1),
    principle: z.string().optional(),
    agents: z.array(AgentContract).min(1),
    workflows: z.array(WorkflowContract).min(1),
    handoffRules: z.array(z.string()).min(1)
  })
  .strict();

export type AgentRoster = z.infer<typeof RosterContract>;
export type RosterAgent = z.infer<typeof AgentContract>;
export type RosterWorkflow = z.infer<typeof WorkflowContract>;

function uniqueIds(values: Array<{ id: string }>, label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value.id)) throw new Error(`Duplicate ${label} id: ${value.id}`);
    seen.add(value.id);
  }
}

export function loadAgentRoster(cwd: string): AgentRoster {
  const path = join(cwd, ".agent-kit", "agent-roster.json");
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
  } catch (error) {
    throw new Error(`Could not read .agent-kit/agent-roster.json: ${error instanceof Error ? error.message : String(error)}`);
  }
  const result = RosterContract.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(`Invalid agent roster${issue ? ` at ${issue.path.join(".")}: ${issue.message}` : "."}`);
  }
  const roster = result.data;
  uniqueIds(roster.agents, "agent");
  uniqueIds(roster.workflows, "workflow");
  const agentIds = new Set(roster.agents.map((agent) => agent.id));
  const workflowIds = new Set(roster.workflows.map((workflow) => workflow.id));
  if (!workflowIds.has(roster.defaultWorkflow)) throw new Error(`Roster default workflow does not exist: ${roster.defaultWorkflow}`);
  for (const agent of roster.agents) {
    for (const handoff of agent.handsOffTo ?? []) {
      if (!agentIds.has(handoff)) throw new Error(`Agent ${agent.id} hands off to unknown agent ${handoff}.`);
    }
  }
  for (const workflow of roster.workflows) {
    for (const agentId of [...workflow.sequence, ...workflow.council]) {
      if (!agentIds.has(agentId)) throw new Error(`Workflow ${workflow.id} references unknown agent ${agentId}.`);
    }
  }
  return roster;
}

export function selectWorkflow(roster: AgentRoster, requested: string | undefined, goal: string): RosterWorkflow {
  if (requested) {
    const explicit = roster.workflows.find((workflow) => workflow.id === requested);
    if (!explicit) throw new Error(`Unknown workflow: ${requested}`);
    return explicit;
  }
  const normalizedGoal = goal.toLowerCase();
  const triggered = roster.workflows
    .map((workflow) => ({
      workflow,
      score: (workflow.triggers ?? []).filter((trigger) => normalizedGoal.includes(trigger.toLowerCase())).length
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.workflow.id.localeCompare(right.workflow.id))[0]?.workflow;
  return triggered ?? roster.workflows.find((workflow) => workflow.id === roster.defaultWorkflow)!;
}

export function validateWorkflowBounds(workflow: RosterWorkflow, config: RuntimeConfig): void {
  if (workflow.sequence.length > config.limits.maxSteps) {
    throw new Error(`Workflow ${workflow.id} has ${workflow.sequence.length} agents, exceeding maxSteps=${config.limits.maxSteps}.`);
  }
  const visits = new Map<string, number>();
  for (const agent of workflow.sequence) visits.set(agent, (visits.get(agent) ?? 0) + 1);
  const excessive = [...visits].find(([, count]) => count > config.limits.maxAgentVisits);
  if (excessive)
    throw new Error(`Workflow ${workflow.id} visits ${excessive[0]} ${excessive[1]} times, exceeding maxAgentVisits=${config.limits.maxAgentVisits}.`);
}

export function readAgentInstructions(cwd: string, agent: RosterAgent): string {
  if (!agent.file) return `${agent.name ?? agent.id}. Skills: ${agent.skills.join(", ")}.`;
  if (resolve(agent.file) === agent.file) throw new Error(`Agent instruction paths must be relative: ${agent.file}`);
  const root = realpathSync(resolve(cwd));
  const candidate = resolve(root, agent.file);
  const parent = realpathSync(dirname(candidate));
  if (parent !== root && !parent.startsWith(`${root}/`)) throw new Error(`Agent instruction path escapes the project: ${agent.file}`);
  return readFileSync(candidate, "utf8").slice(0, 200_000);
}
