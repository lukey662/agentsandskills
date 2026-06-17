import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ANTIGRAVITY_COMMANDS_SOURCE_DIR,
  ANTIGRAVITY_COMMANDS_TARGET_DIR,
  ANTIGRAVITY_PLUGIN_FILES,
  ANTIGRAVITY_RUNTIME_SKILLS_TARGET_DIR,
  CLAUDE_TEMPLATE,
  CODEX_CONFIG_SOURCE,
  COPILOT_INSTRUCTION_FILES,
  CURSOR_ADAPTER_FILES,
  CURSOR_SCOPED_ADAPTER_FILES,
  RUNTIME_SKILLS_SOURCE_DIR
} from "../config/defaults.js";
import { copyTextWithConflict, ensureDir, listFilesRecursive, writeText } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";
import {
  generateCodexCustomAgents,
  generateCursorSkillsFromKit,
  generateCursorSubagents,
  generateMarkdownSubagents
} from "./roster-adapters.js";

export type IdeTarget = "cursor" | "claude" | "codex" | "copilot" | "antigravity";

export interface ActivateIdeOptions {
  cwd: string;
  targets: Array<IdeTarget | "all">;
  force?: boolean;
}

export interface ActivateIdeResult {
  activated: IdeTarget[];
  copied: string[];
  unchanged: string[];
  conflicts: string[];
  overwritten: string[];
}

function normalizeTargets(targets: string[]): IdeTarget[] {
  const allowed = new Set<IdeTarget>(["cursor", "claude", "codex", "copilot", "antigravity"]);
  const normalized = new Set<IdeTarget>();
  for (const target of targets) {
    const value = target.trim().toLowerCase();
    if (value === "all") {
      for (const item of allowed) normalized.add(item);
      continue;
    }
    if (allowed.has(value as IdeTarget)) normalized.add(value as IdeTarget);
  }
  return [...normalized];
}

function copyAdapterFile(
  cwd: string,
  packageRoot: string,
  source: string,
  target: string,
  force: boolean,
  result: ActivateIdeResult
): void {
  const copyResult = copyTextWithConflict(join(packageRoot, source), cwd, target, {
    force,
    conflictRoot: join(cwd, ".agent-kit", "conflicts")
  });
  if (copyResult.action === "created") result.copied.push(copyResult.target);
  if (copyResult.action === "unchanged") result.unchanged.push(copyResult.target);
  if (copyResult.action === "overwritten") result.overwritten.push(copyResult.target);
  if (copyResult.action === "conflict") {
    result.conflicts.push(`${copyResult.target} -> ${copyResult.conflictPath}`);
  }
}

function generateClaudeSubagents(cwd: string, packageRoot: string, force: boolean, result: ActivateIdeResult): void {
  generateMarkdownSubagents(cwd, ".claude/agents", { proactive: false, force, result });
  copyAdapterFile(cwd, packageRoot, CLAUDE_TEMPLATE, "CLAUDE.md", force, result);
}

function copyDirectoryAsConflicts(
  cwd: string,
  packageRoot: string,
  sourceDir: string,
  targetDir: string,
  force: boolean,
  result: ActivateIdeResult
): void {
  for (const file of listFilesRecursive(join(packageRoot, sourceDir))) {
    copyAdapterFile(cwd, packageRoot, join(sourceDir, file), join(targetDir, file).replace(/\\/g, "/"), force, result);
  }
}

function installAntigravityAdapter(cwd: string, packageRoot: string, force: boolean, result: ActivateIdeResult): void {
  ensureDir(join(cwd, ".antigravity", "agent-kit", "commands"));
  ensureDir(join(cwd, ".antigravity", "runtime-skills"));

  for (const file of ANTIGRAVITY_PLUGIN_FILES) {
    copyAdapterFile(cwd, packageRoot, file.source, file.target, force, result);
  }

  copyDirectoryAsConflicts(
    cwd,
    packageRoot,
    ANTIGRAVITY_COMMANDS_SOURCE_DIR,
    ANTIGRAVITY_COMMANDS_TARGET_DIR,
    force,
    result
  );
  copyDirectoryAsConflicts(
    cwd,
    packageRoot,
    RUNTIME_SKILLS_SOURCE_DIR,
    ANTIGRAVITY_RUNTIME_SKILLS_TARGET_DIR,
    force,
    result
  );
}

function updateAssistantAdaptersTable(cwd: string, activated: Set<IdeTarget>): void {
  const path = join(cwd, "ASSISTANT_ADAPTERS.md");
  if (!existsSync(path)) return;
  let content = readFileSync(path, "utf8");
  const today = new Date().toISOString().slice(0, 10);

  if (activated.has("cursor") && content.includes("| Cursor |")) {
    content = content.replace(
      /\| Cursor \|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|/,
      `| Cursor | \`.cursor/rules/*.mdc\`, \`.cursor/agents/*.md\`, \`.cursor/skills/*/SKILL.md\` | Active | Partial | Partial | \`agent-kit init --activate cursor\` on ${today}; verify subagents in Cursor. | Delegate to council subagents instead of role-playing; run \`agent-kit adapter validate cursor\`. |`
    );
  }

  if (activated.has("copilot") && content.includes("| GitHub Copilot")) {
    content = content.replace(
      /\| GitHub Copilot[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|/,
      `| GitHub Copilot / VS Code | \`.github/copilot-instructions.md\` and \`.github/instructions/next-supabase.instructions.md\` | Active | Advisory | Advisory | \`agent-kit init --activate copilot\` on ${today}. | Copilot loads repository and path-specific instructions automatically in VS Code. |`
    );
  }

  if (activated.has("claude") && content.includes("| Claude Code |")) {
    content = content.replace(
      /\| Claude Code \|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|/,
      `| Claude Code | \`.claude/agents/*.md\` and \`CLAUDE.md\` | Active | Partial | Partial | \`agent-kit init --activate claude\` generated subagents on ${today}. | Subagents generated from \`.agent-kit/agent-roster.json\`; verify in Claude Code project settings. |`
    );
  }

  if (activated.has("codex") && content.includes("| Codex / AGENTS.md-compatible tools |")) {
    content = content.replace(
      /\| Codex \/ AGENTS\.md-compatible tools \|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|/,
      `| Codex / AGENTS.md-compatible tools | \`AGENTS.md\`, \`.codex/config.toml\`, \`.codex/agents/*.toml\` | Active | Partial | Partial | \`agent-kit init --activate codex\` on ${today}. | Spawn council custom agents from \`.codex/agents/\`; run \`agent-kit adapter validate codex\`. |`
    );
  }

  if (activated.has("antigravity") && content.includes("| Antigravity |")) {
    content = content.replace(
      /\| Antigravity \|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|/,
      `| Antigravity | \`.antigravity/agent-kit/plugin.json\`, \`.antigravity/agent-kit/commands/*.toml\`, \`.antigravity/runtime-skills/*/SKILL.md\` | Active | Advisory | Advisory | \`agent-kit init --activate antigravity\` on ${today}; run \`agent-kit adapter validate antigravity\`. | Native commands wrap the Agent Kit council/session contract; runtime validation is structural unless \`agy\` is installed. |`
    );
  }

  writeText(path, content);
}

export function parseActivateTargets(raw: string[] | undefined): IdeTarget[] {
  if (!raw || raw.length === 0) return [];
  return normalizeTargets(raw.flatMap((value) => value.split(",")));
}

export function activateIdeTargets(options: ActivateIdeOptions): ActivateIdeResult {
  const cwd = options.cwd;
  const packageRoot = findPackageRoot();
  const targets = normalizeTargets(options.targets);
  const force = Boolean(options.force);
  const result: ActivateIdeResult = {
    activated: targets,
    copied: [],
    unchanged: [],
    conflicts: [],
    overwritten: []
  };

  if (targets.length === 0) return result;

  const activated = new Set<IdeTarget>(targets);

  if (activated.has("cursor")) {
    for (const adapter of CURSOR_ADAPTER_FILES) {
      copyAdapterFile(cwd, packageRoot, adapter.source, adapter.target, force, result);
    }
    for (const adapter of CURSOR_SCOPED_ADAPTER_FILES) {
      copyAdapterFile(cwd, packageRoot, adapter.source, adapter.target, force, result);
    }
    generateCursorSubagents(cwd, force, result);
    generateCursorSkillsFromKit(cwd, force, result);
  }

  if (activated.has("copilot")) {
    ensureDir(join(cwd, ".github", "instructions"));
    for (const file of COPILOT_INSTRUCTION_FILES) {
      copyAdapterFile(cwd, packageRoot, file.source, file.target, force, result);
    }
  }

  if (activated.has("claude")) {
    generateClaudeSubagents(cwd, packageRoot, force, result);
  }

  if (activated.has("codex")) {
    ensureDir(join(cwd, ".codex"));
    copyAdapterFile(cwd, packageRoot, CODEX_CONFIG_SOURCE, ".codex/config.toml", force, result);
    generateCodexCustomAgents(cwd, force, result);
  }

  if (activated.has("antigravity")) {
    installAntigravityAdapter(cwd, packageRoot, force, result);
  }

  updateAssistantAdaptersTable(cwd, activated);

  return result;
}

export function ideSurfaceToActivateTarget(ideSurface: string): IdeTarget | null {
  const value = ideSurface.trim().toLowerCase();
  if (value === "cursor" || value === "claude" || value === "codex" || value === "copilot") {
    return value;
  }
  return null;
}
