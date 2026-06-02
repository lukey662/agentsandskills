import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_AGENT_ROSTER_TARGET, ROOT_DOCS } from "../config/defaults.js";
import type { AuditFinding, AuditReport, StackProfile } from "../config/types.js";
import { listFilesRecursive, sha256 } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";
import { readManifest } from "./install.js";

interface TemplateOverride {
  reason?: string;
  reviewedAt?: string;
  owner?: string;
}

interface AgentKitOverrides {
  templates?: Record<string, TemplateOverride | string>;
}

interface AgentRosterAgent {
  id?: unknown;
  skills?: unknown;
  defaultFor?: unknown;
}

interface AgentRosterWorkflow {
  id?: unknown;
  sequence?: unknown;
  council?: unknown;
}

interface AgentRoster {
  schemaVersion?: unknown;
  defaultWorkflow?: unknown;
  required?: unknown;
  agents?: unknown;
  workflows?: unknown;
}

const REQUIRED_AGENT_IDS = [
  "planner",
  "lead-architect",
  "nextjs-engineer",
  "supabase-postgres-engineer",
  "security-reviewer",
  "frontend-design-lead",
  "qa-engineer",
  "docs-maintainer",
  "deployment-observability-engineer"
];

const REQUIRED_SKILL_IDS = [
  "planning-council",
  "nextjs-app-router",
  "supabase-auth-rls",
  "postgres-migrations",
  "owasp-security-review",
  "frontend-design-system",
  "accessibility-wcag",
  "testing-qa",
  "docs-maintainer",
  "deployment-observability"
];

function includesAny(text: string, values: string[]): boolean {
  const lower = text.toLowerCase();
  return values.some((value) => lower.includes(value.toLowerCase()));
}

function includesAll(text: string, values: string[]): boolean {
  const lower = text.toLowerCase();
  return values.every((value) => lower.includes(value.toLowerCase()));
}

function readDoc(cwd: string, file: string): string {
  const path = join(cwd, file);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function readOverrides(cwd: string): Record<string, TemplateOverride> {
  const path = join(cwd, ".agent-kit", "overrides.json");
  if (!existsSync(path)) return {};

  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as AgentKitOverrides;
    const templates = parsed.templates ?? {};
    return Object.fromEntries(
      Object.entries(templates).map(([file, override]) => [
        file,
        typeof override === "string"
          ? { reason: override }
          : override && typeof override === "object"
            ? override
            : { reason: String(override) }
      ])
    );
  } catch {
    return {};
  }
}

function readTemplate(stack: StackProfile, file: string): string | null {
  const path = join(findPackageRoot(), "templates", stack, file);
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function addAgentRosterFindings(cwd: string, findings: AuditFinding[]): void {
  const rosterPath = join(cwd, DEFAULT_AGENT_ROSTER_TARGET);
  if (!existsSync(rosterPath)) {
    findings.push({
      level: "fail",
      area: "agents",
      message: `${DEFAULT_AGENT_ROSTER_TARGET} is missing.`,
      remediation: "Run agent-kit update to install the default council roster and agent-to-skill routing."
    });
    return;
  }

  let roster: AgentRoster;
  try {
    const parsed = JSON.parse(readFileSync(rosterPath, "utf8")) as unknown;
    if (!isRecord(parsed)) throw new Error("Roster must be a JSON object.");
    roster = parsed;
  } catch {
    findings.push({
      level: "fail",
      area: "agents",
      message: `${DEFAULT_AGENT_ROSTER_TARGET} is not valid roster JSON.`,
      remediation: "Replace it with .agent-kit/rosters/next-supabase-default-council.json or rerun agent-kit update."
    });
    return;
  }

  if (roster.schemaVersion !== 1 || roster.required !== true || roster.defaultWorkflow !== "planning") {
    findings.push({
      level: "warn",
      area: "agents",
      message: "Agent roster metadata does not match the expected default council contract.",
      remediation: "Keep schemaVersion 1, required true, and defaultWorkflow planning unless a documented override exists."
    });
  }

  const agents = Array.isArray(roster.agents) ? (roster.agents.filter(isRecord) as AgentRosterAgent[]) : [];
  const agentIds = new Set(agents.map((agent) => (typeof agent.id === "string" ? agent.id : "")).filter(Boolean));
  const missingAgents = REQUIRED_AGENT_IDS.filter((agentId) => !agentIds.has(agentId));

  if (missingAgents.length > 0) {
    findings.push({
      level: "fail",
      area: "agents",
      message: `Agent roster is missing required default agents: ${missingAgents.join(", ")}.`,
      remediation: "Restore the default council roster so Planner, Architect, implementation, security, QA, docs, and deployment handoffs are always available."
    });
  } else {
    findings.push({
      level: "pass",
      area: "agents",
      message: "Agent roster contains the required default council agents."
    });
  }

  const skillIds = new Set(agents.flatMap((agent) => asStringArray(agent.skills)));
  const missingSkills = REQUIRED_SKILL_IDS.filter((skillId) => !skillIds.has(skillId));
  if (missingSkills.length > 0) {
    findings.push({
      level: "fail",
      area: "agents",
      message: `Agent roster is missing required skill routing: ${missingSkills.join(", ")}.`,
      remediation: "Map each default agent to its associated skills so handoffs can invoke the right review path automatically."
    });
  } else {
    findings.push({
      level: "pass",
      area: "agents",
      message: "Agent roster maps default agents to required skills."
    });
  }

  const planner = agents.find((agent) => agent.id === "planner");
  if (!planner || !asStringArray(planner.defaultFor).includes("planning")) {
    findings.push({
      level: "fail",
      area: "agents",
      message: "Planner is not marked as the default agent for planning.",
      remediation: "Set planner.defaultFor to include planning so planning requests do not bypass the planning role."
    });
  }

  const workflows = Array.isArray(roster.workflows) ? (roster.workflows.filter(isRecord) as AgentRosterWorkflow[]) : [];
  const planningWorkflow = workflows.find((workflow) => workflow.id === "planning");
  const coreChangeWorkflow = workflows.find((workflow) => workflow.id === "core-change");

  if (!planningWorkflow || asStringArray(planningWorkflow.sequence)[0] !== "planner") {
    findings.push({
      level: "fail",
      area: "agents",
      message: "Planning workflow does not start with Planner.",
      remediation: "Define a planning workflow whose first sequence item is planner."
    });
  }

  const coreSequence = asStringArray(coreChangeWorkflow?.sequence);
  const coreCouncil = asStringArray(coreChangeWorkflow?.council);
  if (!coreChangeWorkflow || !coreSequence.includes("lead-architect") || !coreCouncil.includes("lead-architect")) {
    findings.push({
      level: "fail",
      area: "agents",
      message: "Core-change workflow does not require Lead Architect council review.",
      remediation: "Define core-change with Lead Architect in both sequence and council."
    });
  } else if (!coreCouncil.includes("security-reviewer") || !coreCouncil.includes("qa-engineer")) {
    findings.push({
      level: "warn",
      area: "agents",
      message: "Core-change council is missing security or QA participation.",
      remediation: "Include Security Reviewer and QA Engineer in core-change council membership."
    });
  } else {
    findings.push({
      level: "pass",
      area: "agents",
      message: "Core-change workflow requires architect-led council handoff."
    });
  }
}

function addTemplateHashFindings(cwd: string, findings: AuditFinding[]): void {
  const manifest = readManifest(cwd);
  if (!manifest) return;
  const overrides = readOverrides(cwd);

  for (const doc of ROOT_DOCS) {
    const targetPath = join(cwd, doc);
    if (!existsSync(targetPath)) continue;

    const currentTemplate = readTemplate(manifest.stack, doc);
    if (!currentTemplate) continue;

    const targetHash = sha256(readFileSync(targetPath, "utf8"));
    const currentTemplateHash = sha256(currentTemplate);
    const installedTemplateHash = manifest.templateHashes?.[doc];
    const override = overrides[doc];

    if (!installedTemplateHash) {
      findings.push({
        level: "warn",
        area: "templates",
        message: `${doc} has no stored template hash in .agent-kit/manifest.json.`,
        remediation: "Run agent-kit update to refresh manifest metadata and review any conflicts."
      });
      continue;
    }

    if (installedTemplateHash === currentTemplateHash && targetHash === currentTemplateHash) {
      findings.push({
        level: "pass",
        area: "templates",
        message: `${doc} matches the current bundled template.`
      });
      continue;
    }

    if (installedTemplateHash !== currentTemplateHash && targetHash === installedTemplateHash) {
      findings.push({
        level: "warn",
        area: "templates",
        message: `${doc} still matches an older installed template hash.`,
        remediation: "Run agent-kit update and review the generated conflict file before adopting the new template."
      });
      continue;
    }

    if (targetHash === currentTemplateHash) {
      findings.push({
        level: "pass",
        area: "templates",
        message: `${doc} matches the current template even though manifest metadata is older.`
      });
      continue;
    }

    if (installedTemplateHash === currentTemplateHash) {
      if (override) {
        findings.push({
          level: "pass",
          area: "templates",
          message: `${doc} has a documented local override.`,
          remediation: override.reviewedAt ? `Last reviewed at ${override.reviewedAt}.` : "Add reviewedAt to the override after the next template review."
        });
        continue;
      }

      findings.push({
        level: "warn",
        area: "templates",
        message: `${doc} is locally customized or was preserved from before agent-kit install.`,
        remediation: "Compare the local file with .agent-kit/conflicts or agent-kit diff before adopting template changes."
      });
      continue;
    }

    if (override) {
      findings.push({
        level: "warn",
        area: "templates",
        message: `${doc} has a documented local override, but the bundled template changed since install.`,
        remediation: "Review the override against the current conflict template and update reviewedAt when accepted."
      });
      continue;
    }

    findings.push({
      level: "warn",
      area: "templates",
      message: `${doc} differs from both the installed template hash and current bundled template.`,
      remediation: "Review local customizations with agent-kit diff before updating."
    });
  }
}

function readLikelyLandingFiles(cwd: string): string {
  const candidates = listFilesRecursive(cwd).filter((file) => {
    const normalized = file.replace(/\\/g, "/");
    return (
      /(^|\/)(app|pages|src\/app|src\/pages)\/(page|index)\.(tsx|jsx)$/.test(normalized) ||
      /(^|\/)components\/.*(hero|landing|marketing).*\.(tsx|jsx)$/i.test(normalized)
    );
  });

  return candidates
    .slice(0, 20)
    .map((file) => readDoc(cwd, file))
    .join("\n");
}

function addFrontendFindings(cwd: string, findings: AuditFinding[]): void {
  const styleGuide = readDoc(cwd, "STYLE_GUIDE.md");

  if (!includesAny(styleGuide, ["generic AI", "gradient", "design token"])) {
    findings.push({
      level: "warn",
      area: "frontend",
      message: "STYLE_GUIDE.md does not contain anti-generic-AI-site design guidance.",
      remediation: "Add rules for task-first screens, design tokens, real states, and non-generic visual direction."
    });
  }

  if (!includesAll(styleGuide, ["design token", "color", "typography", "spacing", "radius"])) {
    findings.push({
      level: "warn",
      area: "frontend",
      message: "STYLE_GUIDE.md is missing a complete design-token inventory.",
      remediation: "Document semantic color, typography, spacing, radius, motion, and depth decisions."
    });
  }

  if (!includesAll(styleGuide, ["loading", "empty", "error", "disabled", "success", "mobile"])) {
    findings.push({
      level: "warn",
      area: "frontend",
      message: "STYLE_GUIDE.md is missing required component state coverage.",
      remediation: "Require loading, empty, error, disabled, success, focus, and mobile states for interactive UI."
    });
  }

  if (!includesAll(styleGuide, ["landing page", "working app", "task-first"])) {
    findings.push({
      level: "warn",
      area: "frontend",
      message: "STYLE_GUIDE.md does not explicitly prevent generic landing-page defaults.",
      remediation: "State when landing pages are inappropriate and require the first screen to show the real product task."
    });
  }

  const landingText = readLikelyLandingFiles(cwd);
  if (landingText && includesAny(landingText, ["bg-gradient", "from-purple", "to-blue", "ai-powered", "supercharge", "revolutionize", "10x"])) {
    findings.push({
      level: "warn",
      area: "frontend",
      message: "Likely landing or hero files contain generic AI-site visual or copy patterns.",
      remediation: "Review the first screen for domain-specific hierarchy, restrained tokens, real workflows, and useful states."
    });
  }
}

export function auditProject(cwd: string): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const manifest = readManifest(cwd);

  if (!manifest) {
    findings.push({
      level: "fail",
      area: "install",
      message: "Project has no .agent-kit/manifest.json.",
      remediation: "Run agent-kit init --stack next-supabase."
    });
  } else {
    findings.push({
      level: "pass",
      area: "install",
      message: `Agent kit installed at version ${manifest.packageVersion}.`
    });
  }

  addTemplateHashFindings(cwd, findings);
  addAgentRosterFindings(cwd, findings);

  for (const doc of ROOT_DOCS) {
    findings.push(
      existsSync(join(cwd, doc))
        ? { level: "pass", area: "docs", message: `${doc} exists.` }
        : {
            level: "fail",
            area: "docs",
            message: `${doc} is missing.`,
            remediation: `Run agent-kit init or restore ${doc} from the next-supabase template.`
          }
    );
  }

  const security = readDoc(cwd, "SECURITY.md");
  if (!includesAny(security, ["OWASP", "Top 10"])) {
    findings.push({
      level: "fail",
      area: "security",
      message: "SECURITY.md does not explicitly reference OWASP Top 10 review.",
      remediation: "Add OWASP Top 10 coverage to the security checklist."
    });
  }
  if (!includesAny(security, ["RLS", "row level security"])) {
    findings.push({
      level: "fail",
      area: "security",
      message: "SECURITY.md does not explicitly cover Supabase RLS.",
      remediation: "Require authorization to be enforced in Postgres RLS, not only in the UI."
    });
  }
  if (!includesAny(security, ["service-role", "service role"])) {
    findings.push({
      level: "warn",
      area: "security",
      message: "SECURITY.md does not mention service-role key isolation.",
      remediation: "Document that service-role keys are server-only and never exposed to client bundles."
    });
  }

  addFrontendFindings(cwd, findings);

  const testing = readDoc(cwd, "TESTING.md");
  if (!includesAny(testing, ["Playwright", "smoke"])) {
    findings.push({
      level: "warn",
      area: "testing",
      message: "TESTING.md does not require Playwright or smoke coverage.",
      remediation: "Define critical-path Playwright smoke tests for auth and primary workflows."
    });
  }

  return findings;
}

export function createAuditReport(cwd: string): AuditReport {
  const findings = auditProject(cwd);
  const summary: AuditReport["summary"] = { pass: 0, warn: 0, fail: 0 };
  for (const finding of findings) summary[finding.level] += 1;
  return { summary, findings };
}
