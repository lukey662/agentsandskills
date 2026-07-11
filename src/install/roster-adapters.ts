import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, writeConflictProposal, writeText } from "../utils/fs.js";
import { loadProjectRosterAgents, type RosterAgent } from "../studio/wizard/roster.js";
import type { ActivateIdeResult } from "./ide-activate.js";

export const CANONICAL_READ_LIST =
  "`AGENTS.md`, `AGENT_ROSTER.md`, `.agent-kit/agent-roster.json`, `MODEL_ROUTING.md`, `.agent-kit/model-routing.json`, `.agent-kit/project-context.json`, `.agent-kit/project-context.md`, `.agent-kit/agent-briefs.md` when present, `.agent-kit/corrections/project-rules.json`, `.agent-kit/corrections/agent-rules.json`, `COUNCIL.md`, `.agent-kit/council-sessions/`, and `QUALITY_GATES.md`";

type ReasoningEffort = "low" | "medium" | "high";

/** Quote a value for YAML frontmatter scalar fields. */
export function quoteYamlScalar(value: string): string {
  return JSON.stringify(value);
}

function buildAgentHint(agentId: string, name: string): string {
  if (agentId === "planner") return "Start with the Planner workflow.";
  if (agentId === "lead-architect") return "Convene council for core changes before implementation.";
  if (agentId === "frontend-design-lead") {
    return "Require brand/content intake, creative-direction rationale, and visual QA evidence for UI changes.";
  }
  if (agentId === "security-reviewer") {
    return "Review auth, RLS, data mutation, dependency, external-call, secret, and release-risk changes.";
  }
  return `Use for ${name.toLowerCase()} work defined in the roster.`;
}

function buildProactiveSuffix(agentId: string): string {
  const suffixes: Record<string, string> = {
    planner: "Use proactively for planning, scope breakdown, ambiguous requests, and workflow routing.",
    "lead-architect": "Use proactively for core changes, architecture, and cross-layer decisions.",
    "security-reviewer": "Use proactively for auth, RLS, API, Server Action, data mutation, dependency, secret, and release-risk changes.",
    "frontend-design-lead": "Use proactively for UI, design system, accessibility, and visual QA work.",
    "qa-engineer": "Use proactively after behavior changes to add or verify tests and acceptance evidence.",
    "supabase-postgres-engineer": "Use proactively for schema, migrations, RLS, auth, and SQL changes.",
    "nextjs-engineer": "Use proactively for App Router, Server Components, route handlers, and UI state work.",
    "marketing-copy-lead": "Use proactively for public-facing copy, positioning, and conversion surfaces.",
    "docs-maintainer": "Use proactively after significant changes to update living documentation.",
    "deployment-observability-engineer": "Use proactively for release, env var, migration order, monitoring, and rollback work."
  };
  return suffixes[agentId] ?? "";
}

export function buildSubagentDescription(agent: RosterAgent, proactive: boolean): string {
  const base = agent.roleSummary.length > 140 ? `${agent.roleSummary.slice(0, 137)}...` : agent.roleSummary;
  if (!proactive) return base;
  const suffix = buildProactiveSuffix(agent.id);
  return suffix ? `${base} ${suffix}` : base;
}

export function buildSubagentMarkdown(agent: RosterAgent, options: { proactive?: boolean } = {}): string {
  const description = buildSubagentDescription(agent, Boolean(options.proactive));
  const agentFile = agent.file ?? `.agent-kit/agents/${agent.id}.md`;
  const hint = buildAgentHint(agent.id, agent.name);

  return `---
name: ${quoteYamlScalar(agent.id)}
description: ${quoteYamlScalar(description)}
---

Read ${CANONICAL_READ_LIST} before making routing or implementation decisions.

Also read \`${agentFile}\` for this role's detailed contract.

${hint}

For council work, delegate to this subagent instead of role-playing the council in the main thread.

Record meaningful decisions, risks, handoffs, human corrections, artifacts, evidence, and verification through \`agent-kit session checkpoint\` or individual \`agent-kit session ...\` commands when available.
`;
}

function writeGeneratedAgentFile(cwd: string, relativePath: string, content: string, force: boolean, result: ActivateIdeResult): void {
  const targetPath = join(cwd, relativePath);
  if (!force && existsSync(targetPath)) {
    const existing = readFileSync(targetPath, "utf8");
    if (existing === content) {
      result.unchanged.push(relativePath);
      return;
    }
    const proposal = writeConflictProposal(cwd, relativePath, content, {
      currentContent: existing,
      reason: "Generated agent content changed while the local target is customized."
    });
    result.conflicts.push(`${relativePath} -> ${proposal.conflictPath}`);
    return;
  }
  ensureDir(join(cwd, relativePath.split("/").slice(0, -1).join("/")));
  writeText(targetPath, content);
  result.copied.push(relativePath);
}

export function generateMarkdownSubagents(cwd: string, agentsDir: string, options: { proactive?: boolean; force: boolean; result: ActivateIdeResult }): void {
  ensureDir(join(cwd, agentsDir));
  for (const agent of loadProjectRosterAgents(cwd)) {
    const relativePath = `${agentsDir}/${agent.id}.md`;
    writeGeneratedAgentFile(cwd, relativePath, buildSubagentMarkdown(agent, options), options.force, options.result);
  }
}

const CURSOR_AGENTS_README = `# Cursor council subagents

Project subagents generated from \`.agent-kit/agent-roster.json\`. Use them for isolated specialist context instead of role-playing the whole council in one chat.

## Delegation

| Risk / work type | Subagent |
| --- | --- |
| Planning / scope | \`@planner\` |
| Core architecture | \`@lead-architect\` |
| Auth / RLS / secrets | \`@security-reviewer\` or Task \`security-review\` |
| Frontend UI | \`@frontend-design-lead\` |
| QA / tests | \`@qa-engineer\` |

Record handoffs with \`agent-kit session checkpoint --file <json>\` when the CLI is available.

Regenerate with \`agent-kit init --activate cursor\` after roster changes.
`;

export function generateCursorSubagents(cwd: string, force: boolean, result: ActivateIdeResult): void {
  generateMarkdownSubagents(cwd, ".cursor/agents", { proactive: true, force, result });
  writeGeneratedAgentFile(cwd, ".cursor/agents/README.md", CURSOR_AGENTS_README, force, result);
}

export function loadAgentReasoningEffortMap(cwd: string): Map<string, ReasoningEffort> {
  const path = join(cwd, ".agent-kit/model-routing.json");
  const map = new Map<string, ReasoningEffort>();
  if (!existsSync(path)) return map;

  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as {
      agentRoutes?: Array<{ agentId?: string; defaultEffort?: string; profileId?: string }>;
      profiles?: Array<{ id?: string; reasoningEffort?: string }>;
    };
    const profileEffort = new Map<string, ReasoningEffort>();
    for (const profile of parsed.profiles ?? []) {
      if (profile.id && profile.reasoningEffort) {
        const effort = profile.reasoningEffort as ReasoningEffort;
        if (effort === "low" || effort === "medium" || effort === "high") {
          profileEffort.set(profile.id, effort);
        }
      }
    }
    for (const binding of parsed.agentRoutes ?? []) {
      if (!binding.agentId) continue;
      const direct = binding.defaultEffort as ReasoningEffort | undefined;
      if (direct === "low" || direct === "medium" || direct === "high") {
        map.set(binding.agentId, direct);
        continue;
      }
      if (binding.profileId && profileEffort.has(binding.profileId)) {
        map.set(binding.agentId, profileEffort.get(binding.profileId)!);
      }
    }
  } catch {
    return map;
  }
  return map;
}

function escapeTomlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function buildCodexAgentToml(agent: RosterAgent, effort: ReasoningEffort): string {
  const description = buildSubagentDescription(agent, true);
  const agentFile = agent.file ?? `.agent-kit/agents/${agent.id}.md`;
  const hint = buildAgentHint(agent.id, agent.name);
  const instructions = [
    `Read AGENTS.md, AGENT_ROSTER.md, .agent-kit/agent-roster.json, MODEL_ROUTING.md,`,
    `.agent-kit/model-routing.json, project context, corrections, COUNCIL.md, QUALITY_GATES.md,`,
    `and ${agentFile} before reviewing or implementing.`,
    "",
    hint,
    "",
    "Record meaningful decisions, risks, handoffs, and verification through agent-kit session checkpoint when available."
  ].join("\n");

  return `name = "${agent.id}"
description = "${escapeTomlString(description)}"
# model = "gpt-5.5"  # verify in your Codex environment; see MODEL_ROUTING.md
model_reasoning_effort = "${effort}"

developer_instructions = """
${instructions}
"""
`;
}

export function generateCodexCustomAgents(cwd: string, force: boolean, result: ActivateIdeResult): void {
  ensureDir(join(cwd, ".codex/agents"));
  const effortMap = loadAgentReasoningEffortMap(cwd);
  for (const agent of loadProjectRosterAgents(cwd)) {
    const effort = effortMap.get(agent.id) ?? "medium";
    const relativePath = `.codex/agents/${agent.id}.toml`;
    writeGeneratedAgentFile(cwd, relativePath, buildCodexAgentToml(agent, effort), force, result);
  }
}

function skillDescriptionFromMarkdown(text: string, skillId: string): string {
  const useWhen = text.match(/## Use When\s*\n+\s*([^\n#]+)/);
  if (useWhen?.[1]) return useWhen[1].trim().slice(0, 200);
  const firstHeading = text.match(/^#\s+(.+)/m);
  if (firstHeading?.[1]) return `${firstHeading[1].trim()} — Agent Kit council skill.`;
  return `Agent Kit skill for ${skillId.replace(/-/g, " ")}.`;
}

function kitSkillToCursorSkill(skillId: string, kitMarkdown: string): string {
  const description = skillDescriptionFromMarkdown(kitMarkdown, skillId);
  const body = kitMarkdown.replace(/^#\s+.+\n+/, "").trimStart();
  return `---
name: ${quoteYamlScalar(skillId)}
description: ${quoteYamlScalar(description)}
---

${body.trim()}
`;
}

export function generateCursorSkillsFromKit(cwd: string, force: boolean, result: ActivateIdeResult): void {
  const skillsRoot = join(cwd, ".agent-kit/skills");
  if (!existsSync(skillsRoot)) return;

  for (const file of readdirSync(skillsRoot).filter((name) => name.endsWith(".md"))) {
    const skillId = file.replace(/\.md$/, "");
    const kitMarkdown = readFileSync(join(skillsRoot, file), "utf8");
    const relativePath = `.cursor/skills/${skillId}/SKILL.md`;
    writeGeneratedAgentFile(cwd, relativePath, kitSkillToCursorSkill(skillId, kitMarkdown), force, result);
  }
}

export { assistantAdapterRowIsActive } from "./assistant-adapters-table.js";
