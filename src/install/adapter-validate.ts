import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCatalog } from "../catalog.js";
import type { IdeTarget } from "./ide-activate.js";

export type ValidationLevel = "pass" | "warn" | "fail";
export type AdapterValidationTarget = IdeTarget | "all";

export interface ValidationFinding {
  level: ValidationLevel;
  area: string;
  message: string;
  remediation?: string;
}

export interface ValidationReport {
  target: string;
  summary: Record<ValidationLevel, number>;
  findings: ValidationFinding[];
}

function summary(findings: ValidationFinding[]): Record<ValidationLevel, number> {
  return {
    pass: findings.filter((finding) => finding.level === "pass").length,
    warn: findings.filter((finding) => finding.level === "warn").length,
    fail: findings.filter((finding) => finding.level === "fail").length
  };
}

function report(target: string, findings: ValidationFinding[]): ValidationReport {
  return { target, summary: summary(findings), findings };
}

function has(cwd: string, relative: string): boolean {
  return existsSync(join(cwd, relative));
}

function text(cwd: string, relative: string): string {
  return readFileSync(join(cwd, relative), "utf8");
}

function validateCursor(cwd: string): ValidationFinding[] {
  const catalog = loadCatalog();
  const findings: ValidationFinding[] = [];
  if (!has(cwd, ".cursor/rules/cursor-agent-kit.mdc")) {
    findings.push({ level: "fail", area: "cursor", message: "Missing .cursor/rules/cursor-agent-kit.mdc", remediation: "Run agent-kit init --activate cursor" });
  } else {
    findings.push({ level: "pass", area: "cursor", message: "Cursor rule is present." });
  }
  for (const id of catalog.defaultAgents) {
    const path = `.cursor/agents/${id}.md`;
    if (!has(cwd, path)) {
      findings.push({ level: "fail", area: "cursor", message: `Missing ${path}` });
    } else if (id === "qa" && !text(cwd, path).includes("Do not review user-visible work from code alone") && !text(cwd, path).includes("Do not review code alone")) {
      findings.push({ level: "fail", area: "cursor", message: "Cursor QA agent dropped the screenshot fail-closed rule." });
    } else {
      findings.push({ level: "pass", area: "cursor", message: `${path} is present.` });
    }
  }
  if (!has(cwd, ".cursor/skills/browser-qa/SKILL.md")) {
    findings.push({ level: "fail", area: "cursor", message: "Missing .cursor/skills/browser-qa/SKILL.md" });
  }
  return findings;
}

function validateClaude(cwd: string): ValidationFinding[] {
  const catalog = loadCatalog();
  const findings: ValidationFinding[] = [];
  if (!has(cwd, "CLAUDE.md")) {
    findings.push({ level: "fail", area: "claude", message: "Missing CLAUDE.md", remediation: "Run agent-kit init --activate claude" });
  }
  for (const id of catalog.defaultAgents) {
    const path = `.claude/agents/${id}.md`;
    findings.push(
      has(cwd, path)
        ? { level: "pass", area: "claude", message: `${path} is present.` }
        : { level: "fail", area: "claude", message: `Missing ${path}` }
    );
    if (id === "qa" && has(cwd, path) && !text(cwd, path).includes("Do not review code alone") && !text(cwd, path).includes("Do not review user-visible work from code alone")) {
      findings.push({ level: "fail", area: "claude", message: "Claude QA agent dropped the screenshot fail-closed rule." });
    }
  }
  return findings;
}

function validateCodex(cwd: string): ValidationFinding[] {
  const catalog = loadCatalog();
  const findings: ValidationFinding[] = [];
  for (const id of catalog.defaultAgents) {
    const path = `.codex/agents/${id}.toml`;
    findings.push(
      has(cwd, path)
        ? { level: "pass", area: "codex", message: `${path} is present.` }
        : { level: "fail", area: "codex", message: `Missing ${path}`, remediation: "Run agent-kit init --activate codex" }
    );
    if (id === "qa" && has(cwd, path) && !text(cwd, path).includes("Do not review")) {
      findings.push({ level: "fail", area: "codex", message: "Codex QA agent dropped the screenshot fail-closed rule." });
    }
  }
  return findings;
}

function validateCopilot(cwd: string): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  if (!has(cwd, ".github/copilot-instructions.md")) {
    findings.push({ level: "fail", area: "copilot", message: "Missing .github/copilot-instructions.md" });
  } else if (!text(cwd, ".github/copilot-instructions.md").includes("Do not review user-visible work from code alone")) {
    findings.push({ level: "fail", area: "copilot", message: "Copilot instructions dropped the screenshot rule." });
  } else {
    findings.push({ level: "pass", area: "copilot", message: "Copilot instructions include the screenshot rule." });
  }
  return findings;
}

function validateAntigravity(cwd: string): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  if (!has(cwd, ".antigravity/agent-kit/plugin.json")) {
    findings.push({ level: "fail", area: "antigravity", message: "Missing Antigravity plugin.json" });
  } else {
    findings.push({ level: "pass", area: "antigravity", message: "Antigravity plugin is present." });
  }
  if (!has(cwd, ".antigravity/agent-kit/commands/browser-qa.toml")) {
    findings.push({ level: "fail", area: "antigravity", message: "Missing /browser-qa command." });
  } else if (!text(cwd, ".antigravity/agent-kit/commands/browser-qa.toml").includes("Do not review code alone")) {
    findings.push({ level: "fail", area: "antigravity", message: "/browser-qa dropped the screenshot rule." });
  } else {
    findings.push({ level: "pass", area: "antigravity", message: "/browser-qa includes the screenshot rule." });
  }
  return findings;
}

export function validateAdapter(cwd: string, target: AdapterValidationTarget): ValidationReport {
  if (target === "cursor") return report("cursor", validateCursor(cwd));
  if (target === "claude") return report("claude", validateClaude(cwd));
  if (target === "codex") return report("codex", validateCodex(cwd));
  if (target === "copilot") return report("copilot", validateCopilot(cwd));
  if (target === "antigravity") return report("antigravity", validateAntigravity(cwd));

  return report("all", [
    ...validateCursor(cwd),
    ...validateClaude(cwd),
    ...validateCodex(cwd),
    ...validateCopilot(cwd),
    ...validateAntigravity(cwd)
  ]);
}

export function validatePackage(): ValidationReport {
  const cwd = process.cwd();
  const findings: ValidationFinding[] = [];
  if (!existsSync(join(cwd, "catalog.json"))) {
    findings.push({ level: "fail", area: "package", message: "catalog.json is missing." });
  } else {
    findings.push({ level: "pass", area: "package", message: "catalog.json is present." });
  }
  if (!existsSync(join(cwd, "USER_GUIDE.md"))) {
    findings.push({ level: "fail", area: "package", message: "USER_GUIDE.md is missing." });
  } else if (!readFileSync(join(cwd, "USER_GUIDE.md"), "utf8").includes("Do not review code alone")) {
    findings.push({ level: "fail", area: "package", message: "USER_GUIDE.md dropped the screenshot fail-closed sentence." });
  } else {
    findings.push({ level: "pass", area: "package", message: "USER_GUIDE.md includes the screenshot rule." });
  }
  if (!existsSync(join(cwd, "skills/browser-qa/SKILL.md"))) {
    findings.push({ level: "fail", area: "package", message: "skills/browser-qa/SKILL.md is missing." });
  }
  return report("package", findings);
}
