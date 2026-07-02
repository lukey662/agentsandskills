import { existsSync, readFileSync } from "node:fs";
import { join, normalize } from "node:path";
import {
  ANTIGRAVITY_COMMANDS_SOURCE_DIR,
  ANTIGRAVITY_COMMANDS_TARGET_DIR,
  ANTIGRAVITY_RUNTIME_SKILLS_TARGET_DIR,
  RUNTIME_SKILLS_SOURCE_DIR
} from "../config/defaults.js";
import { containsLikelySecret } from "../studio/shared.js";
import { listFilesRecursive } from "../utils/fs.js";
import { createAuditReport } from "./audit.js";
import type { IdeTarget } from "./ide-activate.js";
import { assistantAdapterRowIsActive } from "./assistant-adapters-table.js";

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

const REQUIRED_COMMANDS = [
  "setup",
  "audit",
  "plan",
  "handoff",
  "frontend",
  "ui-audit",
  "ui-polish",
  "layout-cleanup",
  "responsive-cleanup",
  "accessibility-pass",
  "distinctiveness-pass",
  "screenshot-critique",
  "browser-qa",
  "security",
  "copy",
  "ship",
  "upgrade"
] as const;
const REQUIRED_SOURCE_REFERENCES = ["AGENTS.md", ".agent-kit/agent-roster.json", "QUALITY_GATES.md"];

interface AntigravityLayout {
  mode: "source" | "installed";
  pluginRoot: string;
  commandsRoot: string;
  runtimeSkillsRoot: string;
  adapterDocPath: string;
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

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSafeRelativePath(path: string): boolean {
  const normalized = normalize(path).replace(/\\/g, "/");
  if (normalized.startsWith("../runtime-skills/")) return !normalized.slice("../runtime-skills/".length).includes("../");
  return !normalized.startsWith("/") && !normalized.startsWith("../") && !normalized.includes("/../");
}

function findAntigravityLayout(cwd: string): AntigravityLayout | null {
  const sourcePlugin = join(cwd, "antigravity", "plugin.json");
  if (existsSync(sourcePlugin)) {
    return {
      mode: "source",
      pluginRoot: join(cwd, "antigravity"),
      commandsRoot: join(cwd, ANTIGRAVITY_COMMANDS_SOURCE_DIR),
      runtimeSkillsRoot: join(cwd, RUNTIME_SKILLS_SOURCE_DIR),
      adapterDocPath: join(cwd, "assistant-adapters", "antigravity.md")
    };
  }

  const installedPlugin = join(cwd, ".antigravity", "agent-kit", "plugin.json");
  if (existsSync(installedPlugin)) {
    return {
      mode: "installed",
      pluginRoot: join(cwd, ".antigravity", "agent-kit"),
      commandsRoot: join(cwd, ANTIGRAVITY_COMMANDS_TARGET_DIR),
      runtimeSkillsRoot: join(cwd, ANTIGRAVITY_RUNTIME_SKILLS_TARGET_DIR),
      adapterDocPath: join(cwd, ".antigravity", "agent-kit", "README.md")
    };
  }

  return null;
}

function addSecretFinding(path: string, text: string, findings: ValidationFinding[]): void {
  if (containsLikelySecret(text)) {
    findings.push({
      level: "fail",
      area: "secrets",
      message: `${path} contains a secret-like value.`,
      remediation: "Remove tokens, credentials, private URLs, database URLs, and customer data from runtime adapter assets."
    });
  }
}

function commandField(text: string, field: string): string | null {
  const match = text.match(new RegExp(`^${field}\\s*=\\s*"([^"]+)"`, "m"));
  return match?.[1] ?? null;
}

function validateAntigravityCommands(layout: AntigravityLayout, findings: ValidationFinding[]): void {
  const files = listFilesRecursive(layout.commandsRoot).filter((file) => file.endsWith(".toml"));
  const commandNames = new Set<string>();

  for (const command of REQUIRED_COMMANDS) {
    const relativePath = `${command}.toml`;
    const path = join(layout.commandsRoot, relativePath);
    if (!existsSync(path)) {
      findings.push({
        level: "fail",
        area: "commands",
        message: `Missing Antigravity command ${relativePath}.`,
        remediation: "Restore the full native command set, including frontend and UI improvement commands."
      });
      continue;
    }

    const text = readFileSync(path, "utf8");
    addSecretFinding(relativePath, text, findings);

    const name = commandField(text, "name");
    const description = commandField(text, "description");
    if (name !== command) {
      findings.push({
        level: "fail",
        area: "commands",
        message: `${relativePath} has name "${name ?? "missing"}" instead of "${command}".`,
        remediation: "Keep command filename and command name aligned."
      });
    } else {
      commandNames.add(name);
    }

    if (!description || description.length < 20) {
      findings.push({
        level: "fail",
        area: "commands",
        message: `${relativePath} is missing a useful description.`,
        remediation: "Add a concise runtime-facing description."
      });
    }

    if (!text.includes('prompt = """') || !text.includes("Canonical sources:") || !text.includes("Required outputs:")) {
      findings.push({
        level: "fail",
        area: "commands",
        message: `${relativePath} is missing the prompt, canonical source list, or required output list.`,
        remediation: "Every native command must wrap Agent Kit source-of-truth files and name required outputs."
      });
    }

    if (!REQUIRED_SOURCE_REFERENCES.some((reference) => text.includes(reference))) {
      findings.push({
        level: "fail",
        area: "commands",
        message: `${relativePath} does not reference Agent Kit source-of-truth files.`,
        remediation: "Reference AGENTS.md, .agent-kit/agent-roster.json, QUALITY_GATES.md, or another canonical Agent Kit contract."
      });
    }
  }

  const extras = files.map((file) => file.replace(/\.toml$/, "")).filter((name) => !(REQUIRED_COMMANDS as readonly string[]).includes(name));
  if (extras.length > 0) {
    findings.push({
      level: "warn",
      area: "commands",
      message: `Antigravity command directory contains extra commands: ${extras.join(", ")}.`,
      remediation: "Keep extra commands only if they are documented and validated as runtime adapters."
    });
  }

  if (commandNames.size === REQUIRED_COMMANDS.length) {
    findings.push({
      level: "pass",
      area: "commands",
      message: "Antigravity native command set is complete and structurally valid."
    });
  }
}

function validateAntigravityPlugin(layout: AntigravityLayout, findings: ValidationFinding[]): void {
  const pluginPath = join(layout.pluginRoot, "plugin.json");
  const plugin = readJson(pluginPath);
  if (!plugin || !isRecord(plugin)) {
    findings.push({
      level: "fail",
      area: "manifest",
      message: "Antigravity plugin.json is missing or invalid JSON.",
      remediation: "Restore antigravity/plugin.json and run agent-kit adapter validate antigravity."
    });
    return;
  }

  const commands = Array.isArray(plugin.commands) ? plugin.commands.filter(isRecord) : [];
  const skills = Array.isArray(plugin.skills) ? plugin.skills.filter(isRecord) : [];
  const commandNames = new Set(commands.map((command) => command.name).filter((name): name is string => typeof name === "string"));
  const missingCommands = REQUIRED_COMMANDS.filter((command) => !commandNames.has(command));

  if (missingCommands.length > 0) {
    findings.push({
      level: "fail",
      area: "manifest",
      message: `plugin.json is missing command entries: ${missingCommands.join(", ")}.`,
      remediation: "List every native command in plugin.json."
    });
  } else {
    findings.push({
      level: "pass",
      area: "manifest",
      message: "plugin.json lists the required native commands."
    });
  }

  for (const entry of [...commands, ...skills]) {
    const path = typeof entry.path === "string" ? entry.path : "";
    if (!path || !isSafeRelativePath(path)) {
      const entryName = typeof entry.name === "string" ? entry.name : "unknown";
      findings.push({
        level: "fail",
        area: "manifest",
        message: `plugin.json has an unsafe or missing relative path for ${entryName}.`,
        remediation: "Use relative paths that stay inside the plugin/runtime skill bundle."
      });
      continue;
    }
    const resolved = join(layout.pluginRoot, path);
    if (!existsSync(resolved)) {
      findings.push({
        level: "fail",
        area: "manifest",
        message: `plugin.json references missing path ${path}.`,
        remediation: "Restore the referenced command or runtime skill asset."
      });
    }
  }

  const pluginText = readFileSync(pluginPath, "utf8");
  addSecretFinding("plugin.json", pluginText, findings);
  if (Array.isArray(plugin.sourceOfTruth) && plugin.sourceOfTruth.includes("AGENTS.md") && plugin.sourceOfTruth.includes(".agent-kit/agent-roster.json")) {
    findings.push({
      level: "pass",
      area: "manifest",
      message: "plugin.json points back to Agent Kit source-of-truth contracts."
    });
  } else {
    findings.push({
      level: "fail",
      area: "manifest",
      message: "plugin.json does not declare Agent Kit source-of-truth contracts.",
      remediation: "Keep AGENTS.md and .agent-kit/agent-roster.json as canonical references."
    });
  }
}

function validateRuntimeSkills(cwd: string, layout: AntigravityLayout, findings: ValidationFinding[]): void {
  const canonicalSkillsRoot = existsSync(join(cwd, "skills")) ? join(cwd, "skills") : join(cwd, ".agent-kit", "skills");
  const canonicalSkillNames = listFilesRecursive(canonicalSkillsRoot)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
  const runtimeSkillFiles = listFilesRecursive(layout.runtimeSkillsRoot).filter((file) => file.endsWith("/SKILL.md") || file === "SKILL.md");
  const runtimeSkillNames = runtimeSkillFiles
    .map((file) => file.split(/[\\/]/)[0])
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .filter((value, index, values) => values.indexOf(value) === index);

  for (const skillName of canonicalSkillNames) {
    const runtimePath = join(layout.runtimeSkillsRoot, skillName, "SKILL.md");
    if (!existsSync(runtimePath)) {
      findings.push({
        level: "fail",
        area: "runtime-skills",
        message: `Missing runtime skill wrapper for ${skillName}.`,
        remediation: "Add runtime-skills/<skill-id>/SKILL.md with frontmatter and a canonical skill reference."
      });
      continue;
    }

    const text = readFileSync(runtimePath, "utf8");
    addSecretFinding(`${skillName}/SKILL.md`, text, findings);
    if (!/^---\nname: .+\ndescription: .+\n---/m.test(text)) {
      findings.push({
        level: "fail",
        area: "runtime-skills",
        message: `${skillName}/SKILL.md is missing required frontmatter.`,
        remediation: "Add name and trigger-focused description frontmatter."
      });
    }
    if (!text.includes(`skills/${skillName}.md`) && !text.includes(`.agent-kit/skills/${skillName}.md`)) {
      findings.push({
        level: "fail",
        area: "runtime-skills",
        message: `${skillName}/SKILL.md does not reference the canonical skill file.`,
        remediation: "Runtime skill wrappers must not fork canonical skill policy."
      });
    }
  }

  const extras = runtimeSkillNames.filter((name) => !canonicalSkillNames.includes(name));
  if (extras.length > 0) {
    findings.push({
      level: "warn",
      area: "runtime-skills",
      message: `Runtime skills contain wrappers without canonical skills: ${extras.join(", ")}.`,
      remediation: "Add canonical skills or remove orphan runtime wrappers."
    });
  }

  if (canonicalSkillNames.length > 0 && canonicalSkillNames.every((skillName) => existsSync(join(layout.runtimeSkillsRoot, skillName, "SKILL.md")))) {
    findings.push({
      level: "pass",
      area: "runtime-skills",
      message: `Runtime SKILL.md wrappers exist for ${canonicalSkillNames.length} canonical skills.`
    });
  }
}

function validateAntigravity(cwd: string): ValidationReport {
  const findings: ValidationFinding[] = [];
  const layout = findAntigravityLayout(cwd);
  if (!layout) {
    return report("antigravity", [
      {
        level: "fail",
        area: "adapter",
        message: "No Antigravity adapter assets found.",
        remediation: "Run agent-kit init --activate antigravity or restore antigravity/plugin.json in the package source."
      }
    ]);
  }

  const adapterDoc = existsSync(layout.adapterDocPath) ? readFileSync(layout.adapterDocPath, "utf8") : "";
  if (!adapterDoc) {
    findings.push({
      level: "fail",
      area: "adapter",
      message: "Antigravity adapter documentation is missing.",
      remediation: "Restore assistant-adapters/antigravity.md or rerun agent-kit init --activate antigravity."
    });
  } else {
    addSecretFinding(layout.adapterDocPath, adapterDoc, findings);
    if (adapterDoc.includes("AGENTS.md") && adapterDoc.includes("agent-kit adapter validate antigravity")) {
      findings.push({
        level: "pass",
        area: "adapter",
        message: "Antigravity adapter documentation points to canonical Agent Kit validation."
      });
    } else {
      findings.push({
        level: "fail",
        area: "adapter",
        message: "Antigravity adapter documentation does not explain source-of-truth and validation behavior.",
        remediation: "Document canonical Agent Kit files and the structural validation command."
      });
    }
  }

  validateAntigravityPlugin(layout, findings);
  validateAntigravityCommands(layout, findings);
  validateRuntimeSkills(cwd, layout, findings);

  if (layout.mode === "source") {
    const packageJson = readJson(join(cwd, "package.json"));
    const files = isRecord(packageJson) && Array.isArray(packageJson.files) ? packageJson.files : [];
    for (const requiredFile of ["antigravity", "runtime-skills", "assistant-adapters"]) {
      if (!files.includes(requiredFile)) {
        findings.push({
          level: "fail",
          area: "package",
          message: `package.json#files does not include ${requiredFile}.`,
          remediation: "Add the runtime adapter asset to the public package allowlist."
        });
      }
    }
  }

  if (findings.every((finding) => finding.level !== "fail")) {
    findings.push({
      level: "pass",
      area: "adapter",
      message: "Antigravity adapter validation completed without blocking failures."
    });
  }

  return report("antigravity", findings);
}

function validateBasicAdapter(cwd: string, target: Exclude<IdeTarget, "antigravity">): ValidationReport {
  const findings: ValidationFinding[] = [];
  const isPackageSource = existsSync(join(cwd, "package.json")) && existsSync(join(cwd, "src")) && existsSync(join(cwd, "templates"));

  if (isPackageSource) {
    const sourcePaths: Record<Exclude<IdeTarget, "antigravity">, string[]> = {
      cursor: [
        "assistant-adapters/cursor-agent-kit.mdc",
        "assistant-adapters/model-selection/cursor-model-selection.mdc",
        "assistant-adapters/cursor-planner.mdc"
      ],
      claude: ["assistant-adapters/claude-code-subagents.md"],
      codex: ["assistant-adapters/codex-agents.md", "assistant-adapters/model-selection/codex-config.example.toml"],
      copilot: ["assistant-adapters/github-copilot-instructions.md", "assistant-adapters/github-next-supabase.instructions.md"]
    };

    for (const relativePath of sourcePaths[target]) {
      const path = join(cwd, relativePath);
      if (!existsSync(path)) {
        findings.push({
          level: "fail",
          area: "adapter",
          message: `${relativePath} is missing.`,
          remediation: "Restore the adapter template or run agent-kit update."
        });
        continue;
      }
      const text = readFileSync(path, "utf8");
      addSecretFinding(relativePath, text, findings);
      if (!text.includes("AGENTS.md") && !text.includes("MODEL_ROUTING.md")) {
        findings.push({
          level: "warn",
          area: "adapter",
          message: `${relativePath} does not clearly reference Agent Kit source-of-truth files.`,
          remediation: "Adapter templates should point back to AGENTS.md, MODEL_ROUTING.md, and the roster contract."
        });
      }
    }
  } else {
    findings.push(...validateInstalledIdeAdapter(cwd, target).findings);
  }

  if (findings.every((finding) => finding.level !== "fail")) {
    findings.push({
      level: "pass",
      area: "adapter",
      message: `${target} adapter ${isPackageSource ? "templates are present" : "activation assets are present"}.`
    });
  }

  return report(target, findings);
}

function readAssistantAdaptersDoc(cwd: string): string {
  const path = join(cwd, "ASSISTANT_ADAPTERS.md");
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function adaptersRowIsActive(doc: string, toolLabel: string): boolean {
  return assistantAdapterRowIsActive(doc, toolLabel);
}

function validateInstalledIdeAdapter(cwd: string, target: Exclude<IdeTarget, "antigravity">): ValidationReport {
  const findings: ValidationFinding[] = [];
  const adaptersDoc = readAssistantAdaptersDoc(cwd);

  if (target === "cursor") {
    const rulesPath = join(cwd, ".cursor/rules/cursor-agent-kit.mdc");
    if (!existsSync(rulesPath)) {
      findings.push({
        level: "fail",
        area: "adapter",
        message: ".cursor/rules/cursor-agent-kit.mdc is missing.",
        remediation: "Run agent-kit init or agent-kit init --activate cursor."
      });
    } else {
      addSecretFinding(".cursor/rules/cursor-agent-kit.mdc", readFileSync(rulesPath, "utf8"), findings);
    }

    const plannerAgent = join(cwd, ".cursor/agents/planner.md");
    if (existsSync(plannerAgent)) {
      findings.push({
        level: "pass",
        area: "adapter",
        message: ".cursor/agents/planner.md is installed."
      });
    } else if (adaptersRowIsActive(adaptersDoc, "Cursor")) {
      findings.push({
        level: "warn",
        area: "adapter",
        message: "Cursor is marked Active but .cursor/agents/planner.md is missing.",
        remediation: "Run agent-kit init --activate cursor to generate council subagents from the roster."
      });
    }

    const skillSample = join(cwd, ".cursor/skills/planning-council/SKILL.md");
    if (existsSync(skillSample)) {
      findings.push({
        level: "pass",
        area: "adapter",
        message: ".cursor/skills/*/SKILL.md project skills are installed."
      });
    }
  }

  if (target === "claude") {
    const plannerAgent = join(cwd, ".claude/agents/planner.md");
    if (!existsSync(plannerAgent)) {
      findings.push({
        level: "fail",
        area: "adapter",
        message: ".claude/agents/planner.md is missing.",
        remediation: "Run agent-kit init --activate claude."
      });
    }
  }

  if (target === "codex") {
    const configPath = join(cwd, ".codex/config.toml");
    if (!existsSync(configPath)) {
      findings.push({
        level: "fail",
        area: "adapter",
        message: ".codex/config.toml is missing.",
        remediation: "Run agent-kit init --activate codex."
      });
    }
    const plannerAgent = join(cwd, ".codex/agents/planner.toml");
    if (existsSync(plannerAgent)) {
      findings.push({
        level: "pass",
        area: "adapter",
        message: ".codex/agents/planner.toml is installed."
      });
    } else if (adaptersRowIsActive(adaptersDoc, "Codex / AGENTS.md-compatible tools")) {
      findings.push({
        level: "warn",
        area: "adapter",
        message: "Codex is marked Active but .codex/agents/planner.toml is missing.",
        remediation: "Run agent-kit init --activate codex to generate council custom agents from the roster."
      });
    }
  }

  if (target === "copilot") {
    const instructions = join(cwd, ".github/copilot-instructions.md");
    if (!existsSync(instructions)) {
      findings.push({
        level: "fail",
        area: "adapter",
        message: ".github/copilot-instructions.md is missing.",
        remediation: "Run agent-kit init --activate copilot."
      });
    }
  }

  return report(target, findings);
}

export function validateAdapter(cwd: string, target: AdapterValidationTarget = "antigravity"): ValidationReport {
  if (target === "all") {
    const findings: ValidationFinding[] = [];
    for (const item of ["antigravity", "cursor", "claude", "codex", "copilot"] as const) {
      findings.push(...validateAdapter(cwd, item).findings);
    }
    return report("all", findings);
  }

  if (target === "antigravity") return validateAntigravity(cwd);
  return validateBasicAdapter(cwd, target);
}

export function validatePackage(cwd: string): ValidationReport {
  const findings: ValidationFinding[] = [];
  const sourceMode = existsSync(join(cwd, "package.json")) && existsSync(join(cwd, "src")) && existsSync(join(cwd, "templates"));
  if (!sourceMode) {
    return report("package", [
      {
        level: "fail",
        area: "package",
        message: "Package validation must run from the Agent Kit source repository root.",
        remediation: "Run this command from the package repository, not from an installed downstream project."
      }
    ]);
  }

  findings.push(...validateAntigravity(cwd).findings);

  for (const doc of ["README.md", "DOCS.md", "SPEC.md", "DECISIONS.md", "QUALITY_GATES.md", "TESTING.md", "UPGRADE.md"]) {
    const path = join(cwd, doc);
    const text = existsSync(path) ? readFileSync(path, "utf8") : "";
    const lower = text.toLowerCase();
    if (!lower.includes("antigravity") && !lower.includes("runtime command") && !lower.includes("runtime adapter")) {
      findings.push({
        level: "warn",
        area: "docs",
        message: `${doc} does not mention the runtime adapter or Antigravity command layer.`,
        remediation: "Update living docs when runtime adapter behavior changes."
      });
    }
  }

  for (const examplePath of [
    "examples/next-supabase-installed/.agent-kit/agent-roster.json",
    "examples/next-supabase-installed/.agent-kit/model-routing.json",
    "examples/next-supabase-installed/.agent-kit/manifest.json",
    "examples/next-supabase-installed/audit-output.json"
  ]) {
    if (!existsSync(join(cwd, examplePath))) {
      findings.push({
        level: "fail",
        area: "examples",
        message: `${examplePath} is missing.`,
        remediation: "Regenerate or restore the example install snapshot."
      });
    }
  }

  const auditReport = createAuditReport(cwd);
  if (auditReport.summary.fail > 0) {
    findings.push({
      level: "fail",
      area: "audit",
      message: `Source package audit has ${auditReport.summary.fail} failure(s).`,
      remediation: "Fix package-root audit failures before release."
    });
  } else {
    findings.push({
      level: "pass",
      area: "audit",
      message: `Source package audit has no failures (${auditReport.readiness.level}).`
    });
  }

  if (findings.every((finding) => finding.level !== "fail")) {
    findings.push({
      level: "pass",
      area: "package",
      message: "Package validation completed without blocking failures."
    });
  }

  return report("package", findings);
}
