import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  AgentRosterContract,
  CorrectionRulesContract,
  CouncilSessionContract,
  ModelRoutingContract,
  ProjectContextContract,
  SessionEventContract,
  StudioSessionContract,
  formatContractIssues
} from "../config/contracts.js";
import { DEFAULT_AGENT_ROSTER_TARGET, DEFAULT_MODEL_ROUTING_TARGET, ROOT_DOCS } from "../config/defaults.js";
import type { AuditFinding, AuditReadiness, AuditReport, StackProfile } from "../config/types.js";
import { listFilesRecursive, sha256 } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";
import { AGENT_RULES_JSON, CONTEXT_JSON, CONTEXT_MD, PROJECT_RULES_JSON, STUDIO_EXPORT_HTML, containsLikelySecret } from "../studio/shared.js";
import { getSetupProgress, onboardingStateExists } from "../studio/onboarding-state.js";
import { readManifest } from "./install.js";
import { assistantAdapterRowIsActive } from "./assistant-adapters-table.js";

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
  requiredOutputs?: unknown;
}

interface AgentRoster {
  schemaVersion?: unknown;
  defaultWorkflow?: unknown;
  required?: unknown;
  agents?: unknown;
  workflows?: unknown;
  handoffRules?: unknown;
}

const REQUIRED_AGENT_IDS = [
  "planner",
  "lead-architect",
  "nextjs-engineer",
  "supabase-postgres-engineer",
  "security-reviewer",
  "frontend-design-lead",
  "marketing-copy-lead",
  "qa-engineer",
  "docs-maintainer",
  "deployment-observability-engineer"
];

const REQUIRED_SKILL_IDS = [
  "planning-council",
  "best-practice-maturity-review",
  "upgrade-maintenance",
  "nextjs-app-router",
  "supabase-auth-rls",
  "postgres-migrations",
  "owasp-security-review",
  "agent-handoff-tracing",
  "content-first-design",
  "reference-led-design-critique",
  "frontend-distinctiveness-benchmark",
  "frontend-product-quality-rubric",
  "frontend-design-system",
  "ui-improvement-harness",
  "visual-regression-qa",
  "positioning-messaging",
  "conversion-copywriting",
  "landing-page-copy",
  "product-voice-tone",
  "onboarding-empty-state-copy",
  "accessibility-wcag",
  "testing-qa",
  "docs-maintainer",
  "deployment-observability"
];

const REQUIRED_SCHEMA_FILES = [
  "agent-roster.schema.json",
  "council-session.schema.json",
  "audit-report.schema.json",
  "model-routing.schema.json",
  "project-context.schema.json",
  "correction-rules.schema.json",
  "session-event.schema.json",
  "studio-session.schema.json",
  "onboarding-state.schema.json",
  "agentic-level.schema.json"
] as const;
const COUNCIL_SESSION_DIR = ".agent-kit/council-sessions";

export const READINESS_ORDER = ["needs-setup", "baseline-setup", "needs-improvement", "best-practice-candidate"] as const;

export function isAuditReadinessLevel(value: string): value is AuditReadiness["level"] {
  return (READINESS_ORDER as readonly string[]).includes(value);
}

export function meetsMinimumReadiness(actual: AuditReadiness["level"], minimum: AuditReadiness["level"]): boolean {
  return READINESS_ORDER.indexOf(actual) >= READINESS_ORDER.indexOf(minimum);
}

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

function isPackageRepository(cwd: string): boolean {
  const packagePath = join(cwd, "package.json");
  if (!existsSync(packagePath)) return false;
  try {
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as { name?: string };
    return (
      packageJson.name === "@appsforgood/next-supabase-kit" &&
      existsSync(join(cwd, "src", "cli", "index.ts")) &&
      existsSync(join(cwd, "templates", "next-supabase")) &&
      existsSync(join(cwd, "rosters", "next-supabase-default-council.json"))
    );
  } catch {
    return false;
  }
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

function addAgentRosterFindings(cwd: string, findings: AuditFinding[], rosterRelativePath = DEFAULT_AGENT_ROSTER_TARGET): void {
  const rosterPath = join(cwd, rosterRelativePath);
  if (!existsSync(rosterPath)) {
    findings.push({
      level: "fail",
      area: "agents",
      message: `${rosterRelativePath} is missing.`,
      remediation: "Run agent-kit update to install the default council roster and agent-to-skill routing."
    });
    return;
  }

  let roster: AgentRoster;
  try {
    const parsed = JSON.parse(readFileSync(rosterPath, "utf8")) as unknown;
    if (!isRecord(parsed)) throw new Error("Roster must be a JSON object.");
    const contractResult = AgentRosterContract.safeParse(parsed);
    if (!contractResult.success) {
      findings.push({
        level: "fail",
        area: "agents",
        message: `${rosterRelativePath} does not match the schema-backed roster contract.`,
        remediation: `Fix roster shape before relying on council routing. First issue: ${formatContractIssues(contractResult.error)[0]}`
      });
      return;
    }
    roster = contractResult.data;
    findings.push({
      level: "pass",
      area: "agents",
      message: "Agent roster matches the schema-backed runtime contract."
    });
  } catch {
    findings.push({
      level: "fail",
      area: "agents",
      message: `${rosterRelativePath} is not valid roster JSON.`,
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
  const frontendWorkflow = workflows.find((workflow) => workflow.id === "frontend-change");
  const marketingCopyWorkflow = workflows.find((workflow) => workflow.id === "marketing-copy");

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

  const frontendSequence = asStringArray(frontendWorkflow?.sequence);
  const frontendOutputs = asStringArray(frontendWorkflow?.requiredOutputs).join(" ").toLowerCase();
  if (!frontendWorkflow || !frontendSequence.includes("frontend-design-lead")) {
    findings.push({
      level: "fail",
      area: "agents",
      message: "Frontend-change workflow does not require Frontend Design Lead review.",
      remediation: "Define frontend-change with Frontend Design Lead in the sequence before implementation is accepted."
    });
  } else if (
    !frontendOutputs.includes("brand") ||
    !frontendOutputs.includes("creative") ||
    !frontendOutputs.includes("reference") ||
    !frontendOutputs.includes("distinctiveness") ||
    !frontendOutputs.includes("critique") ||
    !frontendOutputs.includes("scorecard") ||
    !frontendOutputs.includes("visual")
  ) {
    findings.push({
      level: "warn",
      area: "agents",
      message: "Frontend-change workflow is missing brand/content intake, creative-direction, reference-led critique, or visual QA outputs.",
      remediation:
        "Require brand/content intake, creative-direction rationale, reference-set evidence, distinctiveness benchmark, design critique verdict, frontend product-quality scorecard, visual QA evidence, state coverage, accessibility checks, and screenshot evidence."
    });
  } else {
    findings.push({
      level: "pass",
      area: "agents",
      message: "Frontend-change workflow requires content-first design, reference-led critique, distinctiveness benchmarking, product-quality scoring, and creative-direction evidence."
    });
  }

  const marketingCopyLead = agents.find((agent) => agent.id === "marketing-copy-lead");
  const marketingDefaultFor = asStringArray(marketingCopyLead?.defaultFor);
  const marketingSkills = asStringArray(marketingCopyLead?.skills);
  if (
    !marketingCopyLead ||
    !marketingDefaultFor.includes("copywriting") ||
    !marketingDefaultFor.includes("value-proposition") ||
    !marketingSkills.includes("positioning-messaging") ||
    !marketingSkills.includes("conversion-copywriting")
  ) {
    findings.push({
      level: "fail",
      area: "agents",
      message: "Marketing Copy Lead is missing question-led positioning or conversion-copy skill routing.",
      remediation:
        "Restore Marketing Copy Lead with copywriting, positioning, value-proposition, conversion, voice/tone, landing-page, onboarding, and empty-state routing."
    });
  }

  const marketingSequence = asStringArray(marketingCopyWorkflow?.sequence);
  const marketingOutputs = asStringArray(marketingCopyWorkflow?.requiredOutputs).join(" ").toLowerCase();
  if (!marketingCopyWorkflow || !marketingSequence.includes("marketing-copy-lead")) {
    findings.push({
      level: "fail",
      area: "agents",
      message: "Marketing-copy workflow does not require Marketing Copy Lead review.",
      remediation: "Define marketing-copy with Marketing Copy Lead in the sequence before public-facing copy is accepted."
    });
  } else if (
    !marketingOutputs.includes("questions") ||
    !marketingOutputs.includes("audience") ||
    !marketingOutputs.includes("value proposition") ||
    !marketingOutputs.includes("proof") ||
    !marketingOutputs.includes("objections") ||
    !marketingOutputs.includes("voice") ||
    !marketingOutputs.includes("conversion")
  ) {
    findings.push({
      level: "warn",
      area: "agents",
      message: "Marketing-copy workflow is missing discovery questions, audience, value proposition, proof, objections, voice, or conversion outputs.",
      remediation:
        "Require discovery questions, audience and segment assumptions, problem/pain/outcome, value proposition, differentiators, proof, objections, voice/tone, conversion goal, and design handoff notes."
    });
  } else {
    findings.push({
      level: "pass",
      area: "agents",
      message: "Marketing-copy workflow requires question-led positioning, value proposition, proof, objections, voice, and conversion evidence."
    });
  }

  const handoffRules = asStringArray(roster.handoffRules).join(" ").toLowerCase();
  if (!includesAll(handoffRules, ["decision", "risk", "handoff", "evidence"])) {
    findings.push({
      level: "warn",
      area: "agents",
      message: "Agent roster handoff rules do not require decision, risk, handoff, and evidence capture.",
      remediation: "Add handoff rules that require each meaningful council step to record decision, risk, next handoff, and evidence."
    });
  } else {
    findings.push({
      level: "pass",
      area: "agents",
      message: "Agent roster requires auditable handoff evidence."
    });
  }
}

function addCouncilSessionRecordFindings(cwd: string, findings: AuditFinding[]): void {
  const sessionsRoot = join(cwd, COUNCIL_SESSION_DIR);
  if (!existsSync(sessionsRoot)) return;

  const sessionFiles = listFilesRecursive(sessionsRoot).filter((file) => file.endsWith(".json") && !/[\\/]/.test(file));
  if (sessionFiles.length === 0) return;

  let invalidCount = 0;
  for (const sessionFile of sessionFiles) {
    const displayPath = `${COUNCIL_SESSION_DIR}/${sessionFile}`;
    try {
      const parsed = JSON.parse(readFileSync(join(sessionsRoot, sessionFile), "utf8")) as unknown;
      const contractResult = CouncilSessionContract.safeParse(parsed);
      if (!contractResult.success) {
        invalidCount += 1;
        findings.push({
          level: "fail",
          area: "agents",
          message: `${displayPath} does not match the council-session contract.`,
          remediation: `Fix the structured council record. First issue: ${formatContractIssues(contractResult.error)[0]}`
        });
      }
    } catch {
      invalidCount += 1;
      findings.push({
        level: "fail",
        area: "agents",
        message: `${displayPath} is not valid council-session JSON.`,
        remediation: "Replace it with a valid JSON record matching .agent-kit/schemas/council-session.schema.json."
      });
    }
  }

  if (invalidCount === 0) {
    findings.push({
      level: "pass",
      area: "agents",
      message: `Structured council-session records match the runtime contract (${sessionFiles.length} checked).`
    });
  }
}

function addSchemaFindings(cwd: string, findings: AuditFinding[], schemaRootRelativePath = ".agent-kit/schemas"): void {
  for (const schemaFile of REQUIRED_SCHEMA_FILES) {
    const schemaPath = join(cwd, schemaRootRelativePath, schemaFile);
    if (!existsSync(schemaPath)) {
      findings.push({
        level: "warn",
        area: "agents",
        message: `${schemaRootRelativePath}/${schemaFile} is missing.`,
        remediation: "Run agent-kit update to install the schema-backed council and roster contracts."
      });
      continue;
    }

    try {
      const parsed = JSON.parse(readFileSync(schemaPath, "utf8")) as unknown;
      if (!isRecord(parsed) || typeof parsed.$schema !== "string" || !isRecord(parsed.properties)) {
        throw new Error("Schema file is missing JSON Schema metadata.");
      }

      findings.push({
        level: "pass",
        area: "agents",
        message: `${schemaRootRelativePath}/${schemaFile} is present and parseable.`
      });
    } catch {
      findings.push({
        level: "fail",
        area: "agents",
        message: `${schemaRootRelativePath}/${schemaFile} is not valid JSON Schema.`,
        remediation: "Restore the schema from the package or rerun agent-kit update."
      });
    }
  }
}

function addAgentStudioFindings(cwd: string, findings: AuditFinding[]): void {
  const contextPath = join(cwd, CONTEXT_JSON);
  if (!existsSync(contextPath)) {
    findings.push({
      level: "warn",
      area: "studio",
      message: `${CONTEXT_JSON} is missing.`,
      remediation: "Run agent-kit setup, agent-kit onboard, or agent-kit init --guided so agents can start with project-specific context."
    });
  } else {
    try {
      const parsed = JSON.parse(readFileSync(contextPath, "utf8")) as unknown;
      const result = ProjectContextContract.safeParse(parsed);
      if (!result.success) {
        findings.push({
          level: "fail",
          area: "studio",
          message: `${CONTEXT_JSON} does not match the project-context contract.`,
          remediation: `Fix project context before relying on guided agent behavior. First issue: ${formatContractIssues(result.error)[0]}`
        });
      } else {
        const missingHighValue = [
          ["product summary", result.data.productSummary],
          ["primary audience", result.data.primaryAudience],
          ["auth model", result.data.authModel],
          ["tenant model", result.data.tenantModel]
        ].filter(([, value]) => typeof value === "string" && !value.trim());
        if (missingHighValue.length > 0 || result.data.primaryWorkflows.length === 0) {
          findings.push({
            level: "warn",
            area: "studio",
            message: `${CONTEXT_JSON} is valid but still missing high-value project context.`,
            remediation: "Answer product summary, audience, workflows, auth/tenant model, UI direction, value proposition, and quality target with agent-kit setup or by editing .agent-kit/project-context.json."
          });
        } else {
          findings.push({
            level: "pass",
            area: "studio",
            message: "Project context is valid and contains high-value onboarding context."
          });
        }
        if (onboardingStateExists(cwd)) {
          const progress = getSetupProgress(cwd);
          if (!progress.quickComplete) {
            findings.push({
              level: "warn",
              area: "studio",
              message: `Setup wizard progress is ${progress.percent}% complete (depth: ${progress.depth}).`,
              remediation: "Run agent-kit setup --open to finish project context onboarding, or agent-kit setup --status to inspect progress."
            });
          } else {
            findings.push({
              level: "pass",
              area: "studio",
              message: "Setup wizard quick path is complete."
            });
          }
        } else if (missingHighValue.length === 0 && result.data.primaryWorkflows.length > 0) {
          findings.push({
            level: "warn",
            area: "studio",
            message: "Project context exists but setup wizard state has not been recorded.",
            remediation: "Run agent-kit setup --open once so onboarding progress and depth are tracked locally."
          });
        }
      }
    } catch {
      findings.push({
        level: "fail",
        area: "studio",
        message: `${CONTEXT_JSON} is not valid JSON.`,
        remediation: "Regenerate project context with agent-kit context init or fix the JSON syntax."
      });
    }
  }

  const contextMdPath = join(cwd, CONTEXT_MD);
  if (existsSync(contextPath) && !existsSync(contextMdPath)) {
    findings.push({
      level: "warn",
      area: "studio",
      message: `${CONTEXT_MD} is missing while project context JSON exists.`,
      remediation: "Run agent-kit context render so humans can review the context agents will load."
    });
  }

  for (const relativePath of [PROJECT_RULES_JSON, AGENT_RULES_JSON]) {
    const path = join(cwd, relativePath);
    if (!existsSync(path)) continue;
    try {
      const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
      const result = CorrectionRulesContract.safeParse(parsed);
      if (!result.success) {
        findings.push({
          level: "fail",
          area: "studio",
          message: `${relativePath} does not match the correction-rules contract.`,
          remediation: `Fix correction rules before relying on persistent human feedback. First issue: ${formatContractIssues(result.error)[0]}`
        });
      } else if (result.data.rules.some((rule) => rule.status === "active")) {
        findings.push({
          level: "pass",
          area: "studio",
          message: `${relativePath} contains valid active correction rules.`
        });
      }
    } catch {
      findings.push({
        level: "fail",
        area: "studio",
        message: `${relativePath} is not valid JSON.`,
        remediation: "Fix the JSON syntax or regenerate correction files with agent-kit correction commands."
      });
    }
  }

  const studioExportPath = join(cwd, STUDIO_EXPORT_HTML);
  if (existsSync(studioExportPath)) {
    const exportHtml = readFileSync(studioExportPath, "utf8");
    if (containsLikelySecret(exportHtml)) {
      findings.push({
        level: "fail",
        area: "studio",
        message: `${STUDIO_EXPORT_HTML} appears to contain a secret-like value.`,
        remediation: "Regenerate the static studio export after redacting sensitive context, session, correction, and artifact data."
      });
    } else if (!exportHtml.includes("agent-studio-data") || !exportHtml.includes("Agent Studio")) {
      findings.push({
        level: "warn",
        area: "studio",
        message: `${STUDIO_EXPORT_HTML} does not look like a complete Agent Studio export.`,
        remediation: "Regenerate it with agent-kit studio export."
      });
    } else {
      findings.push({
        level: "pass",
        area: "studio",
        message: `${STUDIO_EXPORT_HTML} is present and does not contain known secret patterns.`
      });
    }
  }

  const sessionsRoot = join(cwd, COUNCIL_SESSION_DIR);
  if (!existsSync(sessionsRoot)) return;

  const files = listFilesRecursive(sessionsRoot);
  const studioSessionFiles = files.filter((file) => /[\\/]session\.json$/.test(file));
  for (const sessionFile of studioSessionFiles) {
    const normalizedSessionFile = sessionFile.replace(/\\/g, "/");
    const sessionRelative = `${COUNCIL_SESSION_DIR}/${normalizedSessionFile}`;
    const sessionDir = sessionFile.replace(/[\\/]session\.json$/, "");
    const normalizedSessionDir = sessionDir.replace(/\\/g, "/");
    const eventsRelative = `${COUNCIL_SESSION_DIR}/${normalizedSessionDir}/events.jsonl`;
    const indexRelative = `${COUNCIL_SESSION_DIR}/${normalizedSessionDir}/index.md`;
    const transcriptRelative = `${COUNCIL_SESSION_DIR}/${normalizedSessionDir}/transcript.md`;
    const sessionDirPath = join(sessionsRoot, sessionDir);

    let sessionResult: ReturnType<typeof StudioSessionContract.safeParse> | null = null;
    try {
      sessionResult = StudioSessionContract.safeParse(JSON.parse(readFileSync(join(sessionDirPath, "session.json"), "utf8")) as unknown);
      if (!sessionResult.success) {
        findings.push({
          level: "fail",
          area: "studio",
          message: `${sessionRelative} does not match the studio-session contract.`,
          remediation: `Fix session metadata. First issue: ${formatContractIssues(sessionResult.error)[0]}`
        });
        continue;
      }
    } catch {
      findings.push({
        level: "fail",
        area: "studio",
        message: `${sessionRelative} is not valid JSON.`,
        remediation: "Fix session metadata JSON before relying on rendered session evidence."
      });
      continue;
    }

    const eventsPath = join(sessionDirPath, "events.jsonl");
    if (!existsSync(eventsPath)) {
      findings.push({
        level: "fail",
        area: "studio",
        message: `${eventsRelative} is missing.`,
        remediation: "Record session events or remove the incomplete studio session folder."
      });
      continue;
    }

    const eventText = readFileSync(eventsPath, "utf8");
    if (containsLikelySecret(eventText)) {
      findings.push({
        level: "fail",
        area: "studio",
        message: `${eventsRelative} appears to contain a secret-like value.`,
        remediation: "Redact tokens, database URLs, env values, and private customer data from session logs."
      });
    }

    const eventLines = eventText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    let validEvents = 0;
    let verificationCount = 0;
    for (const [index, line] of eventLines.entries()) {
      try {
        const result = SessionEventContract.safeParse(JSON.parse(line) as unknown);
        if (!result.success) {
          findings.push({
            level: "fail",
            area: "studio",
            message: `${eventsRelative} line ${index + 1} does not match the session-event contract.`,
            remediation: `Fix the event row. First issue: ${formatContractIssues(result.error)[0]}`
          });
        } else {
          validEvents += 1;
          if (result.data.type === "verification_recorded") verificationCount += 1;
        }
      } catch {
        findings.push({
          level: "fail",
          area: "studio",
          message: `${eventsRelative} line ${index + 1} is not valid JSON.`,
          remediation: "Fix malformed JSONL before rendering or auditing session history."
        });
      }
    }

    if (!existsSync(join(sessionDirPath, "index.md")) || !existsSync(join(sessionDirPath, "transcript.md"))) {
      findings.push({
        level: "warn",
        area: "studio",
        message: `${sessionDir} has unrendered session Markdown.`,
        remediation: "Run agent-kit session render so humans can inspect the current agent transcript and handoffs."
      });
    } else {
      const indexText = readFileSync(join(sessionDirPath, "index.md"), "utf8");
      const transcriptText = readFileSync(join(sessionDirPath, "transcript.md"), "utf8");
      if (containsLikelySecret(indexText) || containsLikelySecret(transcriptText)) {
        findings.push({
          level: "fail",
          area: "studio",
          message: `${sessionDir} rendered Markdown appears to contain a secret-like value.`,
          remediation: "Regenerate Markdown after redacting sensitive values from the event log."
        });
      }
      if (statSync(eventsPath).mtimeMs > statSync(join(sessionDirPath, "index.md")).mtimeMs) {
        findings.push({
          level: "warn",
          area: "studio",
          message: `${sessionDir} has events newer than rendered Markdown.`,
          remediation: "Run agent-kit session render after recording new events."
        });
      }
    }

    const session = sessionResult.data;
    if (session.status === "complete") {
      const missingOutputs = session.requiredOutputs.filter((output) => output.status === "missing" || output.status === "partial");
      if (missingOutputs.length > 0 || verificationCount === 0) {
        findings.push({
          level: "fail",
          area: "studio",
          message: `${sessionRelative} is complete but lacks required outputs or verification evidence.`,
          remediation: "Do not mark sessions complete until required outputs are complete or not-applicable and verification evidence is recorded."
        });
      }
    }

    if (validEvents > 0) {
      findings.push({
        level: "pass",
        area: "studio",
        message: `${sessionDir} has ${validEvents} valid Agent Studio events.`
      });
    }
  }
}

function addCouncilDocFindings(cwd: string, findings: AuditFinding[]): void {
  const councilDoc = readDoc(cwd, "COUNCIL.md");
  if (!councilDoc) return;

  if (!includesAll(councilDoc, ["council session", "handoff", "decision", "risk", "evidence"])) {
    findings.push({
      level: "warn",
      area: "agents",
      message: "COUNCIL.md does not define a complete council-session handoff record.",
      remediation: "Require workflow, decision, risk, next handoff, evidence, required outputs, and verification status in council sessions."
    });
  } else {
    findings.push({
      level: "pass",
      area: "agents",
      message: "COUNCIL.md defines council-session handoff evidence."
    });
  }
}

function addAssistantAdapterFindings(
  cwd: string,
  findings: AuditFinding[],
  adapterRootRelativePath = ".agent-kit/assistant-adapters",
  docsCwd = cwd
): void {
  const adaptersDoc = readDoc(docsCwd, "ASSISTANT_ADAPTERS.md");
  const adapterRoot = join(cwd, adapterRootRelativePath);

  if (!existsSync(adapterRoot)) {
    findings.push({
      level: "warn",
      area: "agents",
      message: `${adapterRootRelativePath} is missing.`,
      remediation: "Run agent-kit update so tool-specific adapter templates are available for Codex, Copilot, Cursor, and Claude Code."
    });
  } else {
    findings.push({
      level: "pass",
      area: "agents",
      message: `${adapterRootRelativePath} is installed.`
    });
  }

  if (!adaptersDoc) return;

  if (!includesAll(adaptersDoc, ["AGENTS.md", "agent-roster.json", "copilot-instructions", ".cursor/rules", ".claude/agents", "source of truth"])) {
    findings.push({
      level: "warn",
      area: "agents",
      message: "ASSISTANT_ADAPTERS.md does not map the council roster to supported tool instruction surfaces.",
      remediation:
        "Document Codex/AGENTS.md, GitHub Copilot, Cursor rules and subagents, Claude Code subagents, and the source-of-truth rule for avoiding divergent agent instructions."
    });
  } else {
    findings.push({
      level: "pass",
      area: "agents",
      message: "ASSISTANT_ADAPTERS.md maps the council roster to tool-specific instruction surfaces."
    });
  }

  if (assistantAdapterRowIsActive(adaptersDoc, "Cursor") && !existsSync(join(cwd, ".cursor/agents/planner.md"))) {
    findings.push({
      level: "warn",
      area: "agents",
      message: "Cursor is marked Active but .cursor/agents/planner.md is missing.",
      remediation: "Run agent-kit init --activate cursor to generate council subagents from the roster."
    });
  }

  if (
    assistantAdapterRowIsActive(adaptersDoc, "Codex / AGENTS.md-compatible tools") &&
    !existsSync(join(cwd, ".codex/agents/planner.toml"))
  ) {
    findings.push({
      level: "warn",
      area: "agents",
      message: "Codex is marked Active but .codex/agents/planner.toml is missing.",
      remediation: "Run agent-kit init --activate codex to generate council custom agents from the roster."
    });
  }

  if (!includesAll(adaptersDoc, ["model selection", "enforcement", "MODEL_ROUTING.md", "model-routing.json"])) {
    findings.push({
      level: "warn",
      area: "models",
      message: "ASSISTANT_ADAPTERS.md does not record model-selection and enforcement status for active tools.",
      remediation: "Document which IDEs can enforce, partially apply, advise, or require manual model selection from MODEL_ROUTING.md."
    });
  }

  if (/\bTBD\b/i.test(adaptersDoc)) {
    findings.push({
      level: "warn",
      area: "models",
      message: "ASSISTANT_ADAPTERS.md still has unverified tool-surface rows.",
      remediation: "Replace TBD adapter rows with date, owner, evidence, model-selection status, and known limitations for each active IDE."
    });
  }
}

function addModelRoutingFindings(cwd: string, findings: AuditFinding[], routingRelativePath = DEFAULT_MODEL_ROUTING_TARGET, docsCwd = cwd): void {
  const modelRoutingDoc = readDoc(docsCwd, "MODEL_ROUTING.md");
  if (!modelRoutingDoc) {
    findings.push({
      level: "warn",
      area: "models",
      message: "MODEL_ROUTING.md is missing.",
      remediation: "Run agent-kit update to install the model-routing guidance and document the active IDE model-selection setup."
    });
  } else if (!includesAll(modelRoutingDoc, ["model routing", "agent", "profile", "codex", "claude code", "cursor", "github copilot", "enforcement"])) {
    findings.push({
      level: "warn",
      area: "models",
      message: "MODEL_ROUTING.md does not explain agent profiles and IDE enforcement limits.",
      remediation: "Restore model-routing guidance that maps agents to profiles and records Codex, Claude Code, Cursor, and GitHub Copilot setup status."
    });
  } else {
    findings.push({
      level: "pass",
      area: "models",
      message: "MODEL_ROUTING.md documents agent model profiles and IDE enforcement limits."
    });
  }

  const routingPath = join(cwd, routingRelativePath);
  if (!existsSync(routingPath)) {
    findings.push({
      level: "warn",
      area: "models",
      message: `${routingRelativePath} is missing.`,
      remediation: "Run agent-kit update to install the provider-neutral model-routing contract."
    });
    return;
  }

  let routing: unknown;
  try {
    routing = JSON.parse(readFileSync(routingPath, "utf8")) as unknown;
  } catch {
    findings.push({
      level: "warn",
      area: "models",
      message: `${routingRelativePath} is not valid JSON.`,
      remediation: "Replace it with .agent-kit/model-routing/default-model-routing.json or rerun agent-kit update."
    });
    return;
  }

  const contractResult = ModelRoutingContract.safeParse(routing);
  if (!contractResult.success) {
    findings.push({
      level: "warn",
      area: "models",
      message: `${routingRelativePath} does not match the model-routing contract.`,
      remediation: `Fix model-routing shape before relying on model recommendations. First issue: ${formatContractIssues(contractResult.error)[0]}`
    });
    return;
  }

  findings.push({
    level: "pass",
    area: "models",
    message: "Model routing matches the schema-backed runtime contract."
  });

  const profileIds = new Set(contractResult.data.profiles.map((profile) => profile.id));
  const missingAgents = REQUIRED_AGENT_IDS.filter((agentId) => !contractResult.data.agentRoutes.some((route) => route.agentId === agentId));
  const danglingRoutes = contractResult.data.agentRoutes.filter(
    (route) => !profileIds.has(route.profileId) || (route.escalationProfileId ? !profileIds.has(route.escalationProfileId) : false)
  );

  if (missingAgents.length > 0) {
    findings.push({
      level: "warn",
      area: "models",
      message: `Model routing is missing default agent routes: ${missingAgents.join(", ")}.`,
      remediation: "Map every default council agent to a model profile so model selection does not collapse into one generic default."
    });
  } else {
    findings.push({
      level: "pass",
      area: "models",
      message: "Model routing maps every default council agent to a profile."
    });
  }

  if (danglingRoutes.length > 0) {
    findings.push({
      level: "warn",
      area: "models",
      message: "Model routing references profile ids that are not defined.",
      remediation: "Ensure every profileId and escalationProfileId exists in model-routing profiles."
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
  const designDoc = readDoc(cwd, "DESIGN.md");

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

  if (!includesAll(designDoc, ["brand", "content", "user needs", "creative direction", "design tokens"])) {
    findings.push({
      level: "warn",
      area: "frontend",
      message: "DESIGN.md is missing brand, content, user-need, creative-direction, or token guidance.",
      remediation: "Use the DESIGN.md template to capture product category, audience, content inventory, brand traits, creative directions, and token decisions."
    });
  }

  if (!includesAll(designDoc, ["reference set", "anti-reference", "distinctiveness", "critique"])) {
    findings.push({
      level: "warn",
      area: "frontend",
      message: "DESIGN.md is missing reference-set, anti-reference, distinctiveness, or critique-gate guidance.",
      remediation:
        "Add category references, anti-references, source-safety notes, distinctiveness criteria, and a design critique verdict before accepting frontend work as best-practice ready."
    });
  }

  if (!includesAll(designDoc, ["distinctiveness benchmark", "first-screen proof", "content fingerprint", "asset provenance", "state proof", "visual QA proof"])) {
    findings.push({
      level: "warn",
      area: "frontend",
      message: "DESIGN.md is missing frontend distinctiveness benchmark evidence.",
      remediation:
        "Add first-screen proof, content fingerprint, reference benchmark, creative divergence, asset provenance, state proof, visual QA proof, generic-risk, and source-safety fields before accepting significant frontend work."
    });
  }

  if (!includesAll(designDoc, ["product quality scorecard", "user/task fit", "content specificity", "source safety", "total score"])) {
    findings.push({
      level: "warn",
      area: "frontend",
      message: "DESIGN.md is missing a frontend product-quality scorecard.",
      remediation:
        "Add scorecard fields for user/task fit, content specificity, visual identity, information architecture, component states, accessibility and interaction, source safety, total score, and acceptance verdict."
    });
  }

  if (!includesAll(styleGuide, ["DESIGN.md", "content-first", "creative direction"])) {
    findings.push({
      level: "warn",
      area: "frontend",
      message: "STYLE_GUIDE.md does not require content-first creative direction before frontend implementation.",
      remediation: "Reference DESIGN.md, brand/content intake, and creative-direction selection before visual implementation starts."
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

function addQualityGateFindings(cwd: string, findings: AuditFinding[]): void {
  const qualityGates = readDoc(cwd, "QUALITY_GATES.md");
  if (!qualityGates) return;

  if (!includesAll(qualityGates, ["baseline", "strong", "best-practice", "evidence"])) {
    findings.push({
      level: "warn",
      area: "quality",
      message: "QUALITY_GATES.md does not define baseline, strong, best-practice, and evidence expectations.",
      remediation: "Restore the maturity model so project quality is evaluated by evidence, not only by file presence."
    });
  }

  if (
    !includesAll(qualityGates, [
      "council",
      "architecture",
      "security",
      "supabase",
      "messaging",
      "frontend",
      "accessibility",
      "testing",
      "release",
      "repo health"
    ])
  ) {
    findings.push({
      level: "warn",
      area: "quality",
      message: "QUALITY_GATES.md is missing one or more best-practice coverage areas.",
      remediation:
        "Cover council routing, architecture, security, Supabase/RLS, frontend, accessibility, testing, release, and repo-health evidence."
    });
  } else {
    findings.push({
      level: "pass",
      area: "quality",
      message: "QUALITY_GATES.md defines a multi-area best-practice maturity model."
    });
  }
}

function addUpgradeFindings(cwd: string, findings: AuditFinding[]): void {
  const upgradeDoc = readDoc(cwd, "UPGRADE.md");
  if (!upgradeDoc) return;

  if (!includesAll(upgradeDoc, ["agent-kit diff", "agent-kit update", "audit --min-readiness", "rollback", "release notes"])) {
    findings.push({
      level: "warn",
      area: "upgrade",
      message: "UPGRADE.md does not define the full agent-kit diff, update, audit, release-notes, and rollback flow.",
      remediation:
        "Document branch creation, agent-kit diff, agent-kit update, conflict review, audit readiness threshold, release notes, and rollback evidence."
    });
  } else if (!includesAll(upgradeDoc, ["next.js", "codemod", "supabase", "migration", "generated"])) {
    findings.push({
      level: "warn",
      area: "upgrade",
      message: "UPGRADE.md does not cover framework codemods, Supabase migrations, or generated type review.",
      remediation:
        "Include Next.js upgrade/codemod review and Supabase migration history, RLS impact, rollback, and generated type checks."
    });
  } else {
    findings.push({
      level: "pass",
      area: "upgrade",
      message: "UPGRADE.md defines a reviewable upgrade, migration, audit, and rollback lifecycle."
    });
  }
}

const STARTER_EVIDENCE_PATTERNS = [
  /\bTBD\b/i,
  /replace with real/i,
  /example_table/i,
  /describe the product/i,
  /document required/i,
  /pass\/fail\/skipped/i
];

const EVIDENCE_DOCS = [
  "COUNCIL.md",
  "SPEC.md",
  "DESIGN.md",
  "MESSAGING.md",
  "SECURITY.md",
  "TESTING.md",
  "DEPLOYMENT.md",
  "ASSISTANT_ADAPTERS.md",
  "MODEL_ROUTING.md",
  "UPGRADE.md"
] as const;

function addProjectEvidenceFindings(cwd: string, findings: AuditFinding[]): void {
  const placeholderDocs = EVIDENCE_DOCS.filter((doc) => {
    const text = readDoc(cwd, doc);
    return text && STARTER_EVIDENCE_PATTERNS.some((pattern) => pattern.test(text));
  });

  if (placeholderDocs.length > 0) {
    findings.push({
      level: "warn",
      area: "evidence",
      message: `Project evidence docs still contain starter placeholders: ${placeholderDocs.join(", ")}.`,
      remediation:
        "Replace TBD/example rows with real project evidence, or document why an item is not applicable before claiming strong or best-practice maturity."
    });
  } else {
    findings.push({
      level: "pass",
      area: "evidence",
      message: "Project evidence docs do not contain starter placeholders."
    });
  }
}

function addMessagingFindings(cwd: string, findings: AuditFinding[]): void {
  const messagingDoc = readDoc(cwd, "MESSAGING.md");
  if (!messagingDoc) return;

  if (!includesAll(messagingDoc, ["discovery questions", "audience", "pain", "outcome", "differentiator", "proof", "objections", "voice", "conversion"])) {
    findings.push({
      level: "warn",
      area: "messaging",
      message: "MESSAGING.md does not capture the required discovery questions and value-proposition inputs.",
      remediation:
        "Document audience, pain, outcome, differentiator, proof, objections, voice, conversion goal, and unanswered discovery questions before accepting final copy."
    });
  } else {
    findings.push({
      level: "pass",
      area: "messaging",
      message: "MESSAGING.md captures question-led positioning and value-proposition inputs."
    });
  }

  if (!includesAll(messagingDoc, ["claim", "proof required", "current proof", "objection", "cta"])) {
    findings.push({
      level: "warn",
      area: "messaging",
      message: "MESSAGING.md does not connect claims, proof, objections, and CTA hierarchy.",
      remediation: "Track claims against proof, objection handling, primary CTA, secondary CTA, and risky claims before release."
    });
  } else {
    findings.push({
      level: "pass",
      area: "messaging",
      message: "MESSAGING.md connects claims, proof, objections, and CTA hierarchy."
    });
  }
}

export function auditProject(cwd: string): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const manifest = readManifest(cwd);
  const packageRepository = isPackageRepository(cwd);
  const packageSourceMode = packageRepository && !manifest;
  const docsCwd = packageSourceMode ? join(cwd, "templates", "next-supabase") : cwd;

  if (!manifest) {
    if (packageRepository) {
      findings.push({
        level: "pass",
        area: "install",
        message: "Package source repository mode detected; installed-project manifest is not required."
      });
    } else {
      findings.push({
        level: "fail",
        area: "install",
        message: "Project has no .agent-kit/manifest.json.",
        remediation: "Run agent-kit init --stack next-supabase."
      });
    }
  } else {
    findings.push({
      level: "pass",
      area: "install",
      message: `Agent kit installed at version ${manifest.packageVersion}.`
    });
  }

  addTemplateHashFindings(cwd, findings);
  addAgentRosterFindings(cwd, findings, packageSourceMode ? "rosters/next-supabase-default-council.json" : DEFAULT_AGENT_ROSTER_TARGET);
  addSchemaFindings(cwd, findings, packageSourceMode ? "schemas" : ".agent-kit/schemas");
  addCouncilSessionRecordFindings(cwd, findings);
  if (!packageRepository || existsSync(join(cwd, CONTEXT_JSON)) || existsSync(join(cwd, COUNCIL_SESSION_DIR))) {
    addAgentStudioFindings(cwd, findings);
  }

  for (const doc of ROOT_DOCS) {
    const docPath = join(docsCwd, doc);
    const displayPath = packageSourceMode ? `templates/next-supabase/${doc}` : doc;
    if (existsSync(docPath)) {
      findings.push({ level: "pass", area: "docs", message: `${displayPath} exists.` });
    } else {
      findings.push({
        level: doc === "MODEL_ROUTING.md" ? "warn" : "fail",
        area: "docs",
        message: `${displayPath} is missing.`,
        remediation: packageSourceMode
          ? `Restore ${displayPath}; package source audits validate shipped templates instead of installed-project root docs.`
          : `Run agent-kit init or restore ${doc} from the next-supabase template.`
      });
    }
  }

  addCouncilDocFindings(docsCwd, findings);
  addAssistantAdapterFindings(cwd, findings, packageSourceMode ? "assistant-adapters" : ".agent-kit/assistant-adapters", docsCwd);
  addModelRoutingFindings(cwd, findings, packageSourceMode ? "model-routing/default-model-routing.json" : DEFAULT_MODEL_ROUTING_TARGET, docsCwd);
  addMessagingFindings(docsCwd, findings);
  addQualityGateFindings(docsCwd, findings);
  addUpgradeFindings(docsCwd, findings);
  addProjectEvidenceFindings(docsCwd, findings);
  addProjectRealityFindings(cwd, findings, { packageRepository });

  const security = readDoc(docsCwd, "SECURITY.md");
  if (!includesAny(security, ["OWASP", "Top 10"])) {
    findings.push({
      level: "fail",
      area: "docs-hygiene",
      message: "SECURITY.md does not explicitly reference OWASP Top 10 review (docs hygiene check).",
      remediation: "Add OWASP Top 10 coverage to the security checklist."
    });
  }
  if (!includesAny(security, ["RLS", "row level security"])) {
    findings.push({
      level: "fail",
      area: "docs-hygiene",
      message: "SECURITY.md does not explicitly cover Supabase RLS (docs hygiene check).",
      remediation: "Require authorization to be enforced in Postgres RLS, not only in the UI."
    });
  }
  if (!includesAny(security, ["service-role", "service role"])) {
    findings.push({
      level: "warn",
      area: "docs-hygiene",
      message: "SECURITY.md does not mention service-role key isolation (docs hygiene check).",
      remediation: "Document that service-role keys are server-only and never exposed to client bundles."
    });
  }

  addFrontendFindings(docsCwd, findings);

  const testing = readDoc(docsCwd, "TESTING.md");
  if (!includesAny(testing, ["Playwright", "smoke"])) {
    findings.push({
      level: "warn",
      area: "docs-hygiene",
      message: "TESTING.md does not require Playwright or smoke coverage (docs hygiene check).",
      remediation: "Define critical-path Playwright smoke tests for auth and primary workflows."
    });
  }
  if (!includesAny(testing, ["visual regression", "visual QA", "screenshot evidence", "toHaveScreenshot", "Storybook", "Chromatic", "Argos"])) {
    findings.push({
      level: "warn",
      area: "docs-hygiene",
      message: "TESTING.md does not define visual QA or visual-regression evidence (docs hygiene check).",
      remediation: "Document the visual QA tier: screenshot review, Playwright screenshots, Storybook visual tests, or a visual-regression service for important UI changes."
    });
  }

  return findings;
}

function readPackageJson(cwd: string): { scripts?: Record<string, string> } | null {
  const path = join(cwd, "package.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as { scripts?: Record<string, string> };
  } catch {
    return null;
  }
}

function containsLikelySecretForAudit(relativeFile: string, content: string): boolean {
  const normalized = relativeFile.replace(/\\/g, "/");
  const testSecretFixture = ["sk", "test", "fake", "secret", "value"].join("_");
  if (
    normalized.startsWith("tests/") &&
    content.includes(`const fakeSecret = "${testSecretFixture}"`) &&
    content.includes("not.toContain(fakeSecret)")
  ) {
    return containsLikelySecret(content.split(testSecretFixture).join("[TEST_SECRET_FIXTURE]"));
  }
  return containsLikelySecret(content);
}

function addProjectRealityFindings(cwd: string, findings: AuditFinding[], options: { packageRepository?: boolean } = {}): void {
  const migrationsDir = join(cwd, "supabase", "migrations");
  if (existsSync(migrationsDir)) {
    const sqlFiles = listFilesRecursive(migrationsDir).filter((file) => file.endsWith(".sql"));
    if (sqlFiles.length === 0) {
      findings.push({
        level: "warn",
        area: "project-reality",
        message: "supabase/migrations exists but contains no SQL migration files.",
        remediation: "Add versioned SQL migrations or remove the empty migrations directory if Supabase is not in use."
      });
    } else {
      const rlsFiles = sqlFiles.filter((file) => {
        const content = readFileSync(join(migrationsDir, file), "utf8");
        return /enable\s+row\s+level\s+security/i.test(content);
      });
      if (rlsFiles.length === 0) {
        findings.push({
          level: "fail",
          area: "project-reality",
          message: "No Supabase migration enables row level security.",
          remediation: "Add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` (or equivalent) in supabase/migrations before shipping user data."
        });
      } else {
        findings.push({
          level: "pass",
          area: "project-reality",
          message: `Supabase migrations enable RLS in ${rlsFiles.length} file(s).`
        });
      }
    }
  }

  const packageJson = readPackageJson(cwd);
  if (!packageJson) {
    findings.push({
      level: "warn",
      area: "project-reality",
      message: "No package.json found to verify test scripts.",
      remediation: "Add package.json with test, lint, and build scripts appropriate to the stack."
    });
  } else {
    const scripts = packageJson.scripts ?? {};
    const testScript = scripts.test ?? scripts["test:unit"] ?? scripts["test:ci"];
    if (!testScript) {
      findings.push({
        level: "warn",
        area: "project-reality",
        message: "package.json has no test script (test, test:unit, or test:ci).",
        remediation: "Add a test script and document it in TESTING.md."
      });
    } else {
      findings.push({
        level: "pass",
        area: "project-reality",
        message: "package.json defines a test script."
      });
    }
  }

  const trackedSourceFiles = listFilesRecursive(cwd).filter((file) => {
    if (file.includes("node_modules/") || file.includes(".agent-kit/")) return false;
    return /\.(ts|tsx|js|jsx|env|json)$/.test(file);
  });
  const secretHits = trackedSourceFiles
    .map((file) => {
      const content = readFileSync(join(cwd, file), "utf8");
      return containsLikelySecretForAudit(file, content) ? file : null;
    })
    .filter((file): file is string => file !== null)
    .slice(0, 5);
  if (secretHits.length > 0) {
    findings.push({
      level: "fail",
      area: "project-reality",
      message: `Possible committed secret patterns detected in: ${secretHits.join(", ")}.`,
      remediation: "Remove secrets from tracked files, rotate exposed credentials, and use environment variables."
    });
  } else if (trackedSourceFiles.length > 0) {
    findings.push({
      level: "pass",
      area: "project-reality",
      message: "No obvious committed secret patterns detected in tracked source files."
    });
  }

  if (options.packageRepository) {
    findings.push({
      level: "pass",
      area: "project-reality",
      message: "Package source repository mode does not require installed-project context files."
    });
  } else if (!existsSync(join(cwd, CONTEXT_JSON))) {
    findings.push({
      level: "warn",
      area: "project-reality",
      message: ".agent-kit/project-context.json is missing.",
      remediation: "Run agent-kit init or agent-kit context init to create project context."
    });
  } else {
    findings.push({
      level: "pass",
      area: "project-reality",
      message: ".agent-kit/project-context.json exists."
    });
  }
}

function createReadiness(findings: AuditFinding[], summary: AuditReport["summary"]): AuditReadiness {
  const nextActions = findings
    .filter((finding) => finding.level === "fail" || finding.level === "warn")
    .map((finding) => finding.remediation ?? finding.message)
    .filter((value, index, values) => values.indexOf(value) === index)
    .slice(0, 5);

  if (summary.fail > 0) {
    return {
      level: "needs-setup",
      summary: "Required setup or contract checks are failing.",
      nextActions
    };
  }

  if (findings.some((finding) => finding.level === "warn" && finding.area === "evidence")) {
    return {
      level: "baseline-setup",
      summary: "Agent kit setup is valid, but project-specific evidence still needs to replace starter placeholders.",
      nextActions
    };
  }

  if (summary.warn > 0) {
    return {
      level: "needs-improvement",
      summary: "No blocking failures, but warnings remain before this can be treated as best-practice ready.",
      nextActions
    };
  }

  return {
    level: "best-practice-candidate",
    summary: "Static audit found no setup, evidence, security, frontend, testing, or council warnings.",
    nextActions
  };
}

export function createAuditReport(cwd: string): AuditReport {
  const findings = auditProject(cwd);
  const summary: AuditReport["summary"] = { pass: 0, warn: 0, fail: 0 };
  for (const finding of findings) summary[finding.level] += 1;
  return { summary, readiness: createReadiness(findings, summary), findings };
}
