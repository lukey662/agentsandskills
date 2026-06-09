import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CLAUDE_TEMPLATE,
  CODEX_CONFIG_SOURCE,
  COPILOT_INSTRUCTION_FILES,
  CURSOR_ADAPTER_FILES
} from "../config/defaults.js";
import { copyTextWithConflict, ensureDir, writeText } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";
import { loadProjectRosterAgents } from "../studio/wizard/roster.js";

export type IdeTarget = "cursor" | "claude" | "codex" | "copilot";

export interface ActivateIdeOptions {
  cwd: string;
  targets: IdeTarget[];
  force?: boolean;
}

export interface ActivateIdeResult {
  activated: IdeTarget[];
  copied: string[];
  unchanged: string[];
  conflicts: string[];
  overwritten: string[];
}

const CANONICAL_READ_LIST =
  "`AGENTS.md`, `AGENT_ROSTER.md`, `.agent-kit/agent-roster.json`, `MODEL_ROUTING.md`, `.agent-kit/model-routing.json`, `.agent-kit/project-context.json`, `.agent-kit/project-context.md`, `.agent-kit/agent-briefs.md` when present, `.agent-kit/corrections/project-rules.json`, `.agent-kit/corrections/agent-rules.json`, `COUNCIL.md`, `.agent-kit/council-sessions/`, and `QUALITY_GATES.md`";

function normalizeTargets(targets: string[]): IdeTarget[] {
  const allowed = new Set<IdeTarget>(["cursor", "claude", "codex", "copilot"]);
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

function buildClaudeSubagentMarkdown(agentId: string, name: string, description: string): string {
  const defaultForHint =
    agentId === "planner"
      ? "Start with the Planner workflow."
      : agentId === "lead-architect"
        ? "Convene council for core changes before implementation."
        : agentId === "frontend-design-lead"
          ? "Require brand/content intake, creative-direction rationale, and visual QA evidence for UI changes."
          : agentId === "security-reviewer"
            ? "Review auth, RLS, data mutation, dependency, external-call, secret, and release-risk changes."
            : `Use for ${name.toLowerCase()} work defined in the roster.`;

  return `---
name: ${agentId}
description: ${description}
---

Read ${CANONICAL_READ_LIST} before making routing or implementation decisions.

${defaultForHint}

Record meaningful decisions, risks, handoffs, human corrections, artifacts, evidence, and verification through \`agent-kit session checkpoint\` or individual \`agent-kit session ...\` commands when available.
`;
}

function generateClaudeSubagents(cwd: string, packageRoot: string, force: boolean, result: ActivateIdeResult): void {
  ensureDir(join(cwd, ".claude", "agents"));
  const agents = loadProjectRosterAgents(cwd);
  for (const agent of agents) {
    const description =
      agent.roleSummary.length > 180 ? `${agent.roleSummary.slice(0, 177)}...` : agent.roleSummary;
    const target = `.claude/agents/${agent.id}.md`;
    const content = buildClaudeSubagentMarkdown(agent.id, agent.name, description);
    const targetPath = join(cwd, target);
    if (!force && existsSync(targetPath)) {
      const existing = readFileSync(targetPath, "utf8");
      if (existing === content) {
        result.unchanged.push(target);
        continue;
      }
      const conflictPath = join(cwd, ".agent-kit", "conflicts", target.replace(/\//g, "__"));
      ensureDir(join(cwd, ".agent-kit", "conflicts"));
      writeText(conflictPath, existing);
      result.conflicts.push(`${target} -> ${conflictPath}`);
      continue;
    }
    writeText(targetPath, content);
    result.copied.push(target);
  }

  copyAdapterFile(cwd, packageRoot, CLAUDE_TEMPLATE, "CLAUDE.md", force, result);
}

function updateAssistantAdaptersTable(cwd: string, activated: Set<IdeTarget>): void {
  const path = join(cwd, "ASSISTANT_ADAPTERS.md");
  if (!existsSync(path)) return;
  let content = readFileSync(path, "utf8");
  const today = new Date().toISOString().slice(0, 10);

  if (activated.has("cursor") && content.includes("| Cursor |")) {
    content = content.replace(
      /\| Cursor \|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|/,
      "| Cursor | `.cursor/rules/cursor-agent-kit.mdc` and `.cursor/rules/cursor-model-selection.mdc` | Active on init | Advisory | Advisory | `agent-kit init` copies rules; verify in Cursor Settings > Rules. | Installed via `agent-kit init` or `agent-kit init --activate cursor`. |"
    );
  }

  if (activated.has("copilot") && content.includes("| GitHub Copilot")) {
    content = content.replace(
      /\| GitHub Copilot[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|/,
      "| GitHub Copilot / VS Code | `.github/copilot-instructions.md` and `.github/instructions/next-supabase.instructions.md` | Active | Advisory | Advisory | `agent-kit init --activate copilot` on ${today}. | Copilot loads repository and path-specific instructions automatically in VS Code. |"
    );
  }

  if (activated.has("claude") && content.includes("| Claude Code |")) {
    content = content.replace(
      /\| Claude Code \|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|/,
      "| Claude Code | `.claude/agents/*.md` and `CLAUDE.md` | Active | Partial | Partial | `agent-kit init --activate claude` generated subagents on ${today}. | Subagents generated from `.agent-kit/agent-roster.json`; verify in Claude Code project settings. |"
    );
  }

  if (activated.has("codex") && content.includes("| Codex / AGENTS.md-compatible tools |")) {
    content = content.replace(
      /\| Codex \/ AGENTS\.md-compatible tools \|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|/,
      "| Codex / AGENTS.md-compatible tools | `AGENTS.md`, `.codex/config.toml` | Active | Partial | Partial | Root `AGENTS.md` on init; optional `.codex/config.toml` via `agent-kit init --activate codex`. | Confirm Codex loads root `AGENTS.md` and optional model routing comments. |"
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
  }

  updateAssistantAdaptersTable(cwd, activated);

  return result;
}
