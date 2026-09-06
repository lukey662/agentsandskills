import { CLAUDE_TEMPLATE, CURSOR_RULE_FILE } from "../config/defaults.js";
import { findPackageRoot } from "../utils/package-root.js";
import { copyFromPackage, emptyCollector, type CopyCollector } from "./copy-asset.js";
import {
  generateAntigravityCommands,
  generateClaudeAgents,
  generateCodexAgents,
  generateCopilotInstructions,
  generateCursorAgents,
  generateCursorSkills
} from "./roster-adapters.js";

export type IdeTarget = "cursor" | "claude" | "codex" | "copilot" | "antigravity";

export interface ActivateIdeOptions {
  cwd: string;
  targets: Array<IdeTarget | "all">;
  force?: boolean;
}

export interface ActivateIdeResult extends CopyCollector {
  activated: IdeTarget[];
}

const ALLOWED = new Set<IdeTarget>(["cursor", "claude", "codex", "copilot", "antigravity"]);

export class InvalidActivateTargetError extends Error {
  constructor(public readonly invalid: string[]) {
    super(`Unknown --activate target(s): ${invalid.join(", ")}. Allowed: cursor, claude, codex, copilot, antigravity, all.`);
    this.name = "InvalidActivateTargetError";
  }
}

export function parseActivateTargets(raw: string[] | undefined): IdeTarget[] {
  if (!raw || raw.length === 0) return [];
  return normalizeTargets(raw.flatMap((value) => value.split(",")));
}

function normalizeTargets(targets: string[]): IdeTarget[] {
  const normalized = new Set<IdeTarget>();
  const invalid: string[] = [];
  for (const target of targets) {
    const value = target.trim().toLowerCase();
    if (!value) continue;
    if (value === "all") {
      for (const item of ALLOWED) normalized.add(item);
      continue;
    }
    if (ALLOWED.has(value as IdeTarget)) {
      normalized.add(value as IdeTarget);
    } else {
      invalid.push(target.trim());
    }
  }
  if (invalid.length > 0) throw new InvalidActivateTargetError(invalid);
  return [...normalized];
}

export function activateIdeTargets(options: ActivateIdeOptions): ActivateIdeResult {
  const cwd = options.cwd;
  const packageRoot = findPackageRoot();
  const targets = normalizeTargets(options.targets);
  const force = Boolean(options.force);
  const collector = emptyCollector();
  const result: ActivateIdeResult = { activated: targets, ...collector };

  if (targets.length === 0) return result;

  if (targets.includes("cursor")) {
    copyFromPackage(cwd, packageRoot, CURSOR_RULE_FILE.source, CURSOR_RULE_FILE.target, force, result);
    generateCursorAgents(cwd, force, result);
    generateCursorSkills(cwd, force, result);
  }
  if (targets.includes("claude")) {
    copyFromPackage(cwd, packageRoot, CLAUDE_TEMPLATE, "CLAUDE.md", force, result);
    generateClaudeAgents(cwd, force, result);
  }
  if (targets.includes("codex")) {
    generateCodexAgents(cwd, force, result);
  }
  if (targets.includes("copilot")) {
    generateCopilotInstructions(cwd, force, result);
  }
  if (targets.includes("antigravity")) {
    generateAntigravityCommands(cwd, force, result);
  }

  return result;
}

export function ideSurfaceToActivateTarget(ideSurface: string): IdeTarget | null {
  const value = ideSurface.trim().toLowerCase();
  if (value === "cursor" || value === "claude" || value === "codex" || value === "copilot" || value === "antigravity") {
    return value;
  }
  return null;
}
