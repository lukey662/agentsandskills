import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readJsonFile } from "../shared.js";
import type { WizardDepth } from "./steps.js";

export interface RosterAgent {
  id: string;
  name: string;
  roleSummary: string;
  file?: string;
}

export interface AgentWizardStep {
  id: string;
  section: "team";
  title: string;
  why: string;
  fields: string[];
  agentId: string;
  agentName: string;
  roleSummary: string;
  depth: WizardDepth[];
  optional: true;
}

const AGENT_ROSTER_JSON = ".agent-kit/agent-roster.json";

const FALLBACK_SUMMARIES: Record<string, string> = {
  planner: "Owns planning, scope breakdown, sequencing, and council routing before implementation starts.",
  "lead-architect": "Owns architecture, affected-layer mapping, tradeoffs, and final delivery direction.",
  "supabase-postgres-engineer":
    "Owns Supabase Auth, SSR clients, schema, migrations, RLS, Storage policies, SQL functions, and indexes.",
  "nextjs-engineer": "Owns App Router implementation, rendering boundaries, data loading, forms, and UI state.",
  "frontend-design-lead":
    "Prevents generic AI-looking UI by owning content-first creative direction, design-system quality, visual QA, accessibility, and screenshot acceptance.",
  "marketing-copy-lead":
    "Owns positioning, value proposition, conversion copy, product voice, and UX copy for public-facing surfaces.",
  "security-reviewer": "Reviews implementation against OWASP Top 10 and project-specific auth/data boundaries.",
  "qa-engineer": "Owns tests, regression coverage, smoke checks, and acceptance evidence.",
  "docs-maintainer": "Keeps living docs accurate enough for another engineer or agent to continue safely.",
  "deployment-observability-engineer":
    "Owns release safety, environment configuration, migrations, logs, monitoring, and rollback.",
  "research-analyst": "Owns open-source repo research and conversion of evidence into reusable kit improvements."
};

function readPurposeFromAgentFile(cwd: string, relPath: string | undefined): string | null {
  if (!relPath) return null;
  const path = join(cwd, relPath);
  if (!existsSync(path)) return null;
  const text = readFileSync(path, "utf8");
  const match = text.match(/## Purpose\s*\n+\s*([^\n#]+)/);
  return match?.[1]?.trim() ?? null;
}

export function loadProjectRosterAgents(cwd: string): RosterAgent[] {
  const roster = readJsonFile<{ agents?: Array<{ id: string; name?: string; file?: string }> }>(cwd, AGENT_ROSTER_JSON);
  const agents = roster?.agents ?? [];
  if (agents.length === 0) {
    return Object.entries(FALLBACK_SUMMARIES).map(([id, roleSummary]) => ({
      id,
      name: id
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      roleSummary
    }));
  }
  return agents.map((agent) => {
    const fromFile = readPurposeFromAgentFile(cwd, agent.file);
    return {
      id: agent.id,
      name: agent.name ?? agent.id,
      roleSummary: fromFile ?? FALLBACK_SUMMARIES[agent.id] ?? "Specialist agent on your project council.",
      file: agent.file
    };
  });
}

export function buildAgentWizardSteps(cwd: string): AgentWizardStep[] {
  const agents = loadProjectRosterAgents(cwd);
  const depths: WizardDepth[] = ["quick", "standard", "complete", "undecided"];
  return [
    {
      id: "team-intro",
      section: "team",
      title: "Meet your agent team",
      why: "These specialists already know their craft. Brief them like freelancers you just hired — what is unique about this project?",
      fields: [],
      agentId: "",
      agentName: "",
      roleSummary: "",
      depth: depths,
      optional: true
    },
    ...agents.map((agent) => ({
      id: `brief-${agent.id}`,
      section: "team" as const,
      title: `Brief ${agent.name}`,
      why: `${agent.roleSummary} What should they know about this project that is not obvious from the repo?`,
      fields: [`agentBrief_${agent.id}`],
      agentId: agent.id,
      agentName: agent.name,
      roleSummary: agent.roleSummary,
      depth: depths,
      optional: true
    }))
  ];
}

export function agentBriefFieldName(agentId: string): string {
  return `agentBrief_${agentId}`;
}

export function parseAgentBriefFieldName(field: string): string | null {
  if (!field.startsWith("agentBrief_")) return null;
  return field.slice("agentBrief_".length);
}
