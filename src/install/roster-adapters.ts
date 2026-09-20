import { readFileSync } from "node:fs";
import { agentSourcePath, loadCatalog, parseFrontmatter, skillSourcePath } from "../catalog.js";
import { findPackageRoot } from "../utils/package-root.js";
import { writeGenerated, type CopyCollector } from "./copy-asset.js";

/**
 * One canonical agent file, five hosts, five frontmatter schemas. Each host honours a different
 * set of keys and some reject unknown ones (Claude refuses to launch a subagent whose `tools`
 * entries do not resolve). The body is never changed; only the frontmatter is rewritten, plus a
 * single "Required tools" line so the kit's gate contract stays visible to the model on hosts
 * that have no tools field.
 *
 * Skills follow the Agent Skills open standard. Cursor, Codex, Copilot, and Antigravity read
 * `.agents/skills/<id>/SKILL.md`; Claude reads `.claude/skills/<id>/SKILL.md`.
 */

export type AgentHost = "cursor" | "claude" | "codex" | "copilot" | "antigravity";

/** Kit tool vocabulary → Claude Code tool names. Browser-class tools are MCP-provided and vary per machine, so an agent that needs them inherits everything. */
const CLAUDE_TOOL_MAP: Record<string, string[]> = {
  repo: ["Read", "Grep", "Glob"],
  edit: ["Edit", "Write"],
  terminal: ["Bash"],
  "test-runner": ["Bash"]
};
const BROWSER_TOOLS = new Set(["browser", "screenshot", "image-review"]);

/** Agents whose judgment sets the rest of the chain get higher effort where the host supports it. */
const HIGH_EFFORT_AGENTS = new Set(["planner", "security", "design"]);

interface CanonicalAgent {
  id: string;
  name: string;
  description: string;
  tools: string[];
  requiredTools: string[];
  skills: string[];
  body: string;
}

function readCanonicalAgent(id: string): CanonicalAgent {
  const packageRoot = findPackageRoot();
  const markdown = readFileSync(agentSourcePath(packageRoot, id), "utf8");
  const meta = parseFrontmatter(markdown);
  const catalog = loadCatalog(packageRoot);
  return {
    id,
    name: meta.name ?? id,
    description: meta.description ?? id,
    tools: meta.tools ?? [],
    requiredTools: meta.requiredTools ?? [],
    skills: catalog.agentSkills[id] ?? [],
    body: meta.body
  };
}

/** The gate contract in prose. `doctor` checks this line on every rendered host file. */
export function requiredToolsLine(requiredTools: string[]): string {
  return requiredTools.length > 0 ? `> Required tools: ${requiredTools.join(", ")}. Do not drop them.\n\n` : "";
}

function yamlScalar(value: string): string {
  // Descriptions contain colons and quotes; a double-quoted scalar is safe on every host.
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function withFrontmatter(lines: string[], agent: CanonicalAgent): string {
  return `---\n${lines.join("\n")}\n---\n${requiredToolsLine(agent.requiredTools)}${agent.body.replace(/^\n/, "")}`;
}

/** Cursor: name, description, model, readonly, is_background. Nothing else. */
export function renderCursorAgent(id: string): string {
  const agent = readCanonicalAgent(id);
  const lines = [`name: ${agent.name}`, `description: ${yamlScalar(agent.description)}`, "model: inherit"];
  // A repo-only agent must not edit. Cursor enforces that natively.
  if (agent.tools.length > 0 && agent.tools.every((tool) => tool === "repo")) lines.push("readonly: true");
  return withFrontmatter(lines, agent);
}

/** Claude Code: real tool names or inherit, preloaded skills, effort. */
export function renderClaudeAgent(id: string): string {
  const agent = readCanonicalAgent(id);
  const lines = [`name: ${agent.name}`, `description: ${yamlScalar(agent.description)}`, "model: inherit"];
  if (HIGH_EFFORT_AGENTS.has(id)) lines.push("effort: high");
  const needsBrowser = agent.tools.some((tool) => BROWSER_TOOLS.has(tool));
  if (!needsBrowser && agent.tools.length > 0) {
    const mapped = [...new Set(agent.tools.flatMap((tool) => CLAUDE_TOOL_MAP[tool] ?? []))];
    // Skill lets a restricted agent still invoke unlisted skills on demand.
    lines.push(`tools: ${[...mapped, "Skill"].join(", ")}`);
  }
  if (agent.skills.length > 0) lines.push(`skills: [${agent.skills.join(", ")}]`);
  return withFrontmatter(lines, agent);
}

/** Copilot: description required, name optional; tools omitted means all. */
export function renderCopilotAgent(id: string): string {
  const agent = readCanonicalAgent(id);
  return withFrontmatter([`name: ${agent.name}`, `description: ${yamlScalar(agent.description)}`], agent);
}

/** Antigravity: name, description, subagent/mainAgent, skill paths relative to .agents/. */
export function renderAntigravityAgent(id: string): string {
  const agent = readCanonicalAgent(id);
  const lines = [`name: ${agent.name}`, `description: ${yamlScalar(agent.description)}`, "subagent: true", "mainAgent: true"];
  if (agent.skills.length > 0) {
    lines.push("skills:");
    for (const skill of agent.skills) lines.push(`  - skills/${skill}`);
  }
  return withFrontmatter(lines, agent);
}

function escapeTomlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Codex: TOML custom agent wrapping the canonical markdown verbatim. */
export function renderCodexAgent(id: string): string {
  const packageRoot = findPackageRoot();
  const markdown = readFileSync(agentSourcePath(packageRoot, id), "utf8");
  const meta = parseFrontmatter(markdown);
  const effort = HIGH_EFFORT_AGENTS.has(id) ? "high" : "medium";
  return `name = "${id}"
description = "${escapeTomlString(meta.description ?? id)}"
model_reasoning_effort = "${effort}"

developer_instructions = """
${markdown.replace(/"""/g, '\\"\\"\\"')}
"""
`;
}

export function agentTargetPath(host: AgentHost, id: string): string {
  switch (host) {
    case "cursor":
      return `.cursor/agents/${id}.md`;
    case "claude":
      return `.claude/agents/${id}.md`;
    case "codex":
      return `.codex/agents/${id}.toml`;
    case "copilot":
      return `.github/agents/${id}.agent.md`;
    case "antigravity":
      return `.agents/agents/${id}/agent.md`;
  }
}

export function renderAgent(host: AgentHost, id: string): string {
  switch (host) {
    case "cursor":
      return renderCursorAgent(id);
    case "claude":
      return renderClaudeAgent(id);
    case "codex":
      return renderCodexAgent(id);
    case "copilot":
      return renderCopilotAgent(id);
    case "antigravity":
      return renderAntigravityAgent(id);
  }
}

export function generateAgents(host: AgentHost, cwd: string, force: boolean, collector: CopyCollector): void {
  const catalog = loadCatalog(findPackageRoot());
  for (const id of catalog.defaultAgents) {
    writeGenerated(cwd, agentTargetPath(host, id), renderAgent(host, id), force, collector);
  }
}

/** `.agents/skills/` is read by Cursor, Codex, Copilot, and Antigravity. Written on every init. */
export function generateSkills(cwd: string, force: boolean, collector: CopyCollector): void {
  const packageRoot = findPackageRoot();
  const catalog = loadCatalog(packageRoot);
  for (const id of catalog.defaultSkills) {
    const content = readFileSync(skillSourcePath(packageRoot, id), "utf8");
    writeGenerated(cwd, `.agents/skills/${id}/SKILL.md`, content, force, collector);
  }
}

/** Claude reads `.claude/skills/` only. Same bytes as `.agents/skills/`. */
export function generateClaudeSkills(cwd: string, force: boolean, collector: CopyCollector): void {
  const packageRoot = findPackageRoot();
  const catalog = loadCatalog(packageRoot);
  for (const id of catalog.defaultSkills) {
    const content = readFileSync(skillSourcePath(packageRoot, id), "utf8");
    writeGenerated(cwd, `.claude/skills/${id}/SKILL.md`, content, force, collector);
  }
}

export function generateCopilotInstructions(cwd: string, force: boolean, collector: CopyCollector): void {
  const catalog = loadCatalog();
  const p = catalog.spawnPayloads;
  const fence = (label: string, text: string): string => `${label}:\n\n\`\`\`text\n${text}\n\`\`\``;
  const content = `# Copilot instructions

This repo uses a small agent and skill pack. Read \`AGENTS.md\` and \`USER_GUIDE.md\`. The specialists are custom agents in \`.github/agents/\`; skills are in \`.agents/skills/\`.

When the user describes a change, launch the agents in New feature order with \`/agent <id>\` (CLI: \`copilot --agent=<id>\`), each with its payload below: \`planner\`, then the owner (\`app-engineer\`, \`security\`, \`design\`, or \`copy\`), then \`qa\`. If this Copilot surface exposes no custom agents, run the same sequence in this thread under an explicit “now Planner” / “now App engineer” / “now QA” header. Do not stop after printing a prompt. Do not impersonate all six in one paragraph.

Agents:

${catalog.defaultAgents.map((id) => `- ${id}`).join("\n")}

${catalog.screenshotFailClosed}

Do not review user-visible work from code alone. Use the browser-qa skill.

${catalog.askPolicy}

${fence("Planner", p.planner)}

${fence("App engineer", p["app-engineer"])}

${fence("Security", p.security)}

${fence("Design", p.design)}

${fence("Design setup (no DESIGN.md yet)", p["design-setup"])}

${fence("QA", p.qa)}

${fence("Copy", p.copy)}

${fence("Release go/no-go (add to QA)", p.ship)}

If you cannot open a browser, use Playwright:

\`\`\`bash
npx playwright screenshot --viewport-size=1280,720 "$URL" qa-evidence/<slug>/desktop.png
npx playwright screenshot --viewport-size=390,844 "$URL" qa-evidence/<slug>/mobile.png
\`\`\`
`;
  writeGenerated(cwd, ".github/copilot-instructions.md", content, force, collector);
}

/** Optional agents render to every activated host that exists in the project. */
export function copyOptionalAgent(cwd: string, id: string, force: boolean, collector: CopyCollector, hosts: AgentHost[]): void {
  for (const host of hosts) {
    writeGenerated(cwd, agentTargetPath(host, id), renderAgent(host, id), force, collector);
  }
}

export function copyOptionalSkill(cwd: string, id: string, force: boolean, collector: CopyCollector, includeClaude: boolean): void {
  const packageRoot = findPackageRoot();
  const content = readFileSync(skillSourcePath(packageRoot, id), "utf8");
  writeGenerated(cwd, `.agents/skills/${id}/SKILL.md`, content, force, collector);
  if (includeClaude) writeGenerated(cwd, `.claude/skills/${id}/SKILL.md`, content, force, collector);
}
