import { existsSync, lstatSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { loadCatalog, parseFrontmatter } from "../catalog.js";
import { resolveInside } from "../utils/fs.js";

/**
 * 0.3 shipped an 11-agent "council" (Lead Architect, Frontend Design Lead, ...) with
 * roster/routing JSON, scorecard skills, and an always-on Cursor rule. 0.4 replaced it with
 * six agents and twelve skills, but `update` never deletes, so upgraders keep both.
 *
 * The leftovers are not inert: a 0.3 `planner.md` at the 0.4 path shadows the real Planner,
 * the 0.3 rule tells Cursor to route UI to `frontend-design-lead` (which has no screenshot
 * requiredTools), and the 0.3 skills all trigger on "any user-facing screen". This module
 * lists and removes exactly those paths. Nothing outside the allowlist is ever touched.
 */

/** Root files and directories that only the 0.3 council OS wrote. */
export const LEGACY_ROOT_PATHS = [
  "AGENT_ROSTER.md",
  "COUNCIL.md",
  "SKILLS.md",
  "QUALITY_GATES.md",
  "ASSISTANT_ADAPTERS.md",
  "MODEL_ROUTING.md",
  ".agent-kit/agent-roster.json",
  ".agent-kit/orchestrator.json",
  ".agent-kit/model-routing.json",
  ".agent-kit/agents",
  ".agent-kit/skills",
  ".agent-kit/checklists",
  ".agent-kit/prompts",
  ".agent-kit/rosters",
  ".agent-kit/schemas",
  ".agent-kit/assistant-adapters",
  ".agent-kit/design-adapters",
  ".agent-kit/design-briefs",
  ".agent-kit/profiles",
  ".cursor/rules/cursor-model-selection.mdc",
  ".cursor/agents/README.md",
  ".github/workflows/agent-kit-audit.yml"
] as const;

/** 0.3 council agent ids. `lead-architect` is also an optional 0.4 agent, so ids alone are never enough — see isCouncilAgentFile. */
export const LEGACY_COUNCIL_AGENT_IDS = [
  "lead-architect",
  "nextjs-engineer",
  "frontend-design-lead",
  "security-reviewer",
  "qa-engineer",
  "marketing-copy-lead",
  "supabase-postgres-engineer",
  "deployment-observability-engineer",
  "docs-maintainer",
  "research-analyst"
] as const;

/** 0.3 council skill ids. None collide with a 0.4 default or optional skill id. */
export const LEGACY_COUNCIL_SKILL_IDS = [
  "agent-handoff-tracing",
  "best-practice-maturity-review",
  "content-first-design",
  "conversion-copywriting",
  "deployment-observability",
  "docs-maintainer",
  "frontend-design-system",
  "frontend-distinctiveness-benchmark",
  "frontend-product-quality-rubric",
  "landing-page-copy",
  "onboarding-empty-state-copy",
  "planning-council",
  "positioning-messaging",
  "product-voice-tone",
  "reference-led-design-critique",
  "ui-improvement-harness",
  "upgrade-maintenance",
  "visual-regression-qa"
] as const;

/** 0.3 native Antigravity commands that 0.4 no longer generates. */
export const LEGACY_ANTIGRAVITY_COMMANDS = [
  "setup",
  "spec",
  "audit",
  "handoff",
  "ui-audit",
  "ui-polish",
  "layout-cleanup",
  "responsive-cleanup",
  "accessibility-pass",
  "distinctiveness-pass",
  "screenshot-critique",
  "review",
  "upgrade"
] as const;

/**
 * Phrases that appear only in 0.3 council prose, never in 0.4+ agents, skills, or rules.
 * Role names are deliberately absent: the optional lead-architect agent uses one as a heading.
 */
const COUNCIL_MARKERS = ["COUNCIL.md", "QUALITY_GATES.md", "AGENT_ROSTER.md", "agent-kit session", ".agent-kit/agents/"] as const;

export function isCouncilContent(text: string): boolean {
  return COUNCIL_MARKERS.some((marker) => text.includes(marker));
}

/**
 * A 0.3 stub tells the model to read the council docs and points at `.agent-kit/agents/<role>.md`
 * for its "detailed contract". 0.5 rendered agents have host frontmatter and a body that never
 * mentions those files. Frontmatter shape alone is not a signal any more: Cursor files have no
 * `tools:` by design.
 */
export function isCouncilAgentFile(text: string): boolean {
  const meta = parseFrontmatter(text);
  if (!meta.description) return true;
  return isCouncilContent(text);
}

/** True when `cwd` is this package's own source tree, where `skills/` is canonical and must never be pruned. */
export function isKitSource(cwd: string): boolean {
  return existsSync(join(cwd, "catalog.json")) && existsSync(join(cwd, "agents")) && existsSync(join(cwd, "src", "catalog.ts"));
}

export interface PrunePlanEntry {
  path: string;
  kind: "file" | "dir";
  reason: string;
}

export interface PruneLegacyResult {
  planned: PrunePlanEntry[];
  removed: string[];
}

function readIfExists(cwd: string, relative: string): string | null {
  const path = join(cwd, relative);
  if (!existsSync(path)) return null;
  try {
    if (lstatSync(path).isDirectory()) return null;
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

function kindOf(cwd: string, relative: string): "file" | "dir" | null {
  const path = join(cwd, relative);
  if (!existsSync(path)) return null;
  return lstatSync(path).isDirectory() ? "dir" : "file";
}

/** Everything `pruneLegacy` would delete, with a reason per path. Read-only. */
export function planLegacyPrune(cwd: string): PrunePlanEntry[] {
  const plan: PrunePlanEntry[] = [];
  const seen = new Set<string>();
  const add = (path: string, reason: string): void => {
    if (seen.has(path)) return;
    const kind = kindOf(cwd, path);
    if (!kind) return;
    seen.add(path);
    plan.push({ path, kind, reason });
  };

  for (const path of LEGACY_ROOT_PATHS) add(path, "0.3 council file. 0.4 reads AGENTS.md and USER_GUIDE.md.");

  // Shadowed 0.4 agents: a 0.3 stub sitting at the 0.4 path is what the IDE actually loads.
  const catalog = loadCatalog();
  const allAgentIds = [...catalog.defaultAgents, ...catalog.optionalAgents];
  for (const id of allAgentIds) {
    for (const relative of [`.cursor/agents/${id}.md`, `.claude/agents/${id}.md`]) {
      const text = readIfExists(cwd, relative);
      if (text && isCouncilAgentFile(text)) add(relative, `0.3 council stub shadows the 0.4 ${id} agent. update will regenerate it.`);
    }
    const toml = readIfExists(cwd, `.codex/agents/${id}.toml`);
    if (toml && isCouncilContent(toml)) add(`.codex/agents/${id}.toml`, `0.3 council stub shadows the 0.4 ${id} agent. update will regenerate it.`);
  }

  // Council-only agent ids. Content check keeps an optional 0.4 lead-architect.
  for (const id of LEGACY_COUNCIL_AGENT_IDS) {
    for (const relative of [`.cursor/agents/${id}.md`, `.claude/agents/${id}.md`]) {
      const text = readIfExists(cwd, relative);
      if (text && isCouncilAgentFile(text)) add(relative, "0.3 council agent. Not launched by any 0.4 workflow.");
    }
    const toml = readIfExists(cwd, `.codex/agents/${id}.toml`);
    if (toml && isCouncilContent(toml)) add(`.codex/agents/${id}.toml`, "0.3 council agent. Not launched by any 0.4 workflow.");
  }

  for (const id of LEGACY_COUNCIL_SKILL_IDS) {
    add(`.cursor/skills/${id}`, "0.3 council skill. Triggers on every UI task and duplicates a 0.4 skill.");
    add(`.antigravity/runtime-skills/${id}`, "0.3 council skill. Triggers on every UI task and duplicates a 0.4 skill.");
  }

  for (const name of LEGACY_ANTIGRAVITY_COMMANDS) {
    add(`.antigravity/agent-kit/commands/${name}.toml`, "0.3 Antigravity command. 0.4 generates seven commands.");
  }

  // 0.4 skill copies. 0.5 writes one location, .agents/skills/, which Cursor, Codex, Copilot, and
  // Antigravity all read. Leaving the old copies makes Cursor list every skill twice.
  const defaultSkills = new Set(catalog.defaultSkills);
  for (const id of [...catalog.defaultSkills, ...catalog.optionalSkills]) {
    add(`.cursor/skills/${id}`, "0.4 skill copy. 0.5 reads .agents/skills/.");
  }
  add(".antigravity", "0.4 Antigravity plugin and runtime-skills. 0.5 writes .agents/agents/, .agents/skills/, and .agents/rules/.");
  // Root skills/ was the 0.4 "portable" copy in downstream repos. In the kit's own source tree it is canonical.
  if (!isKitSource(cwd)) {
    for (const id of defaultSkills) add(`skills/${id}`, "0.4 portable skill copy. 0.5 reads .agents/skills/.");
  }

  // Kit-installed files whose 0.3 body routes to the council. Regenerated by update when the IDE is activated.
  const rule = readIfExists(cwd, ".cursor/rules/cursor-agent-kit.mdc");
  if (rule && isCouncilContent(rule))
    add(".cursor/rules/cursor-agent-kit.mdc", "0.3 council rule is always-on in Cursor and routes UI to frontend-design-lead. update will regenerate it.");

  const copilot = readIfExists(cwd, ".github/copilot-instructions.md");
  if (copilot && isCouncilContent(copilot))
    add(".github/copilot-instructions.md", "0.3 council Copilot instructions. update will regenerate them when copilot is activated.");

  const codexConfig = readIfExists(cwd, ".codex/config.toml");
  if (codexConfig && codexConfig.includes("Agent Kit") && codexConfig.includes("MODEL_ROUTING.md")) {
    add(".codex/config.toml", "0.3 Codex model-selection example. 0.4 sets reasoning effort per agent file.");
  }

  return plan;
}

/**
 * Delete the planned paths. Every path is re-resolved inside `cwd` before removal so a
 * crafted manifest or symlink cannot point the prune outside the project.
 */
export function pruneLegacy(cwd: string, options: { dryRun?: boolean } = {}): PruneLegacyResult {
  const planned = planLegacyPrune(cwd);
  if (options.dryRun) return { planned, removed: [] };

  const removed: string[] = [];
  for (const entry of planned) {
    const absolute = resolveInside(cwd, entry.path);
    if (!existsSync(absolute)) continue;
    // rmSync on a symlink removes the link, not its target, so a linked directory is safe.
    rmSync(absolute, { recursive: entry.kind === "dir", force: true });
    removed.push(entry.path);
  }
  return { planned, removed };
}
