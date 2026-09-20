import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCatalog } from "../catalog.js";
import { validateHostAgentFile } from "./host-frontmatter.js";
import { IDE_TARGETS, isIdeTarget, type IdeTarget } from "./ide-activate.js";
import { readManifest } from "./install.js";
import { agentTargetPath, type AgentHost } from "./roster-adapters.js";

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
  validated: IdeTarget[];
  summary: Record<ValidationLevel, number>;
  findings: ValidationFinding[];
}

const GATE = ["Do not review code alone", "Do not review user-visible work from code alone"];

function summary(findings: ValidationFinding[]): Record<ValidationLevel, number> {
  return {
    pass: findings.filter((finding) => finding.level === "pass").length,
    warn: findings.filter((finding) => finding.level === "warn").length,
    fail: findings.filter((finding) => finding.level === "fail").length
  };
}

function report(target: string, findings: ValidationFinding[], validated: IdeTarget[]): ValidationReport {
  return { target, validated, summary: summary(findings), findings };
}

function has(cwd: string, relative: string): boolean {
  return existsSync(join(cwd, relative));
}

function text(cwd: string, relative: string): string {
  return readFileSync(join(cwd, relative), "utf8");
}

function requireFile(cwd: string, area: string, relative: string, remediation: string, findings: ValidationFinding[]): boolean {
  if (!has(cwd, relative)) {
    findings.push({ level: "fail", area, message: `Missing ${relative}`, remediation });
    return false;
  }
  findings.push({ level: "pass", area, message: `${relative} is present.` });
  return true;
}

/** Every host: each default agent exists, loads under the host's documented frontmatter, and QA keeps the gate sentence. */
function validateAgents(cwd: string, host: AgentHost, findings: ValidationFinding[]): void {
  const catalog = loadCatalog();
  const remediation = `Run agent-kit init --activate ${host}`;
  for (const id of catalog.defaultAgents) {
    const path = agentTargetPath(host, id);
    if (!requireFile(cwd, host, path, remediation, findings)) continue;
    const body = text(cwd, path);
    if (host !== "codex") {
      const problems = validateHostAgentFile(host, body);
      if (problems.length > 0) {
        findings.push({
          level: "fail",
          area: host,
          message: `${path}: ${problems.join("; ")}`,
          remediation: `Run agent-kit update --force to re-render ${path}`
        });
      }
    }
    if (id === "qa" && !GATE.some((sentence) => body.includes(sentence))) {
      findings.push({ level: "fail", area: host, message: `${path} dropped the screenshot fail-closed rule.` });
    }
  }
}

function validateSkills(cwd: string, area: string, findings: ValidationFinding[]): void {
  if (!requireFile(cwd, area, ".agents/skills/browser-qa/SKILL.md", "Run agent-kit init", findings)) return;
  if (!text(cwd, ".agents/skills/browser-qa/SKILL.md").includes("Do not review code alone")) {
    findings.push({ level: "fail", area, message: ".agents/skills/browser-qa/SKILL.md no longer forbids code-only review." });
  }
}

function validateCursor(cwd: string): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  requireFile(cwd, "cursor", ".cursor/rules/cursor-agent-kit.mdc", "Run agent-kit init --activate cursor", findings);
  validateAgents(cwd, "cursor", findings);
  validateSkills(cwd, "cursor", findings);
  return findings;
}

function validateClaude(cwd: string): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  requireFile(cwd, "claude", "CLAUDE.md", "Run agent-kit init --activate claude", findings);
  validateAgents(cwd, "claude", findings);
  requireFile(cwd, "claude", ".claude/skills/browser-qa/SKILL.md", "Run agent-kit init --activate claude", findings);
  return findings;
}

function validateCodex(cwd: string): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  validateAgents(cwd, "codex", findings);
  validateSkills(cwd, "codex", findings);
  return findings;
}

function validateCopilot(cwd: string): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  if (!has(cwd, ".github/copilot-instructions.md")) {
    findings.push({ level: "fail", area: "copilot", message: "Missing .github/copilot-instructions.md", remediation: "Run agent-kit init --activate copilot" });
  } else if (!text(cwd, ".github/copilot-instructions.md").includes("Do not review user-visible work from code alone")) {
    findings.push({ level: "fail", area: "copilot", message: "Copilot instructions dropped the screenshot rule." });
  } else {
    findings.push({ level: "pass", area: "copilot", message: "Copilot instructions include the screenshot rule." });
  }
  validateAgents(cwd, "copilot", findings);
  validateSkills(cwd, "copilot", findings);
  return findings;
}

function validateAntigravity(cwd: string): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  requireFile(cwd, "antigravity", ".agents/rules/agent-kit.md", "Run agent-kit init --activate antigravity", findings);
  validateAgents(cwd, "antigravity", findings);
  validateSkills(cwd, "antigravity", findings);
  return findings;
}

const validators: Record<IdeTarget, (cwd: string) => ValidationFinding[]> = {
  cursor: validateCursor,
  claude: validateClaude,
  codex: validateCodex,
  copilot: validateCopilot,
  antigravity: validateAntigravity
};

export function resolveAdapterTargets(cwd: string, target: AdapterValidationTarget): IdeTarget[] {
  if (target !== "all") return [target];
  const activated = (readManifest(cwd)?.activated ?? []).filter(isIdeTarget);
  return activated.length > 0 ? activated : [...IDE_TARGETS];
}

export function validateAdapter(cwd: string, target: AdapterValidationTarget): ValidationReport {
  const validated = resolveAdapterTargets(cwd, target);
  const findings = validated.flatMap((ide) => validators[ide](cwd));
  const label = target === "all" && validated.length < IDE_TARGETS.length ? `all (${validated.join(", ")})` : target;
  return report(label, findings, validated);
}

export function validatePackage(): ValidationReport {
  const cwd = process.cwd();
  const findings: ValidationFinding[] = [];
  if (!existsSync(join(cwd, "catalog.json"))) {
    findings.push({ level: "fail", area: "package", message: "catalog.json is missing." });
  } else {
    findings.push({ level: "pass", area: "package", message: "catalog.json is present." });
  }
  for (const guide of ["USER_GUIDE.md", "USER_GUIDE.html"]) {
    if (!existsSync(join(cwd, guide))) {
      findings.push({ level: "fail", area: "package", message: `${guide} is missing.` });
    } else if (!readFileSync(join(cwd, guide), "utf8").includes("Do not review code alone")) {
      findings.push({ level: "fail", area: "package", message: `${guide} dropped the screenshot fail-closed sentence.` });
    } else {
      findings.push({ level: "pass", area: "package", message: `${guide} includes the screenshot rule.` });
    }
  }
  if (!existsSync(join(cwd, "skills/browser-qa/SKILL.md"))) {
    findings.push({ level: "fail", area: "package", message: "skills/browser-qa/SKILL.md is missing." });
  }
  return report("package", findings, []);
}
