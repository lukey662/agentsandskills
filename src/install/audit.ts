import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AgentRosterContract, CouncilSessionContract, ModelRoutingContract, formatContractIssues } from "../config/contracts.js";
import { DEFAULT_AGENT_ROSTER_TARGET, DEFAULT_MODEL_ROUTING_TARGET, ROOT_DOCS } from "../config/defaults.js";
import type { AuditFinding, AuditReadiness, AuditReport, StackProfile } from "../config/types.js";
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
  "visual-regression-qa",
  "accessibility-wcag",
  "testing-qa",
  "docs-maintainer",
  "deployment-observability"
];

const REQUIRED_SCHEMA_FILES = ["agent-roster.schema.json", "council-session.schema.json", "audit-report.schema.json", "model-routing.schema.json"] as const;
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
    const contractResult = AgentRosterContract.safeParse(parsed);
    if (!contractResult.success) {
      findings.push({
        level: "fail",
        area: "agents",
        message: `${DEFAULT_AGENT_ROSTER_TARGET} does not match the schema-backed roster contract.`,
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
  const frontendWorkflow = workflows.find((workflow) => workflow.id === "frontend-change");

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

  const sessionFiles = listFilesRecursive(sessionsRoot).filter((file) => file.endsWith(".json"));
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

function addSchemaFindings(cwd: string, findings: AuditFinding[]): void {
  for (const schemaFile of REQUIRED_SCHEMA_FILES) {
    const schemaPath = join(cwd, ".agent-kit", "schemas", schemaFile);
    if (!existsSync(schemaPath)) {
      findings.push({
        level: "warn",
        area: "agents",
        message: `.agent-kit/schemas/${schemaFile} is missing.`,
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
        message: `.agent-kit/schemas/${schemaFile} is present and parseable.`
      });
    } catch {
      findings.push({
        level: "fail",
        area: "agents",
        message: `.agent-kit/schemas/${schemaFile} is not valid JSON Schema.`,
        remediation: "Restore the schema from the package or rerun agent-kit update."
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

function addAssistantAdapterFindings(cwd: string, findings: AuditFinding[]): void {
  const adaptersDoc = readDoc(cwd, "ASSISTANT_ADAPTERS.md");
  const adapterRoot = join(cwd, ".agent-kit", "assistant-adapters");

  if (!existsSync(adapterRoot)) {
    findings.push({
      level: "warn",
      area: "agents",
      message: ".agent-kit/assistant-adapters is missing.",
      remediation: "Run agent-kit update so tool-specific adapter templates are available for Codex, Copilot, Cursor, and Claude Code."
    });
  } else {
    findings.push({
      level: "pass",
      area: "agents",
      message: ".agent-kit/assistant-adapters is installed."
    });
  }

  if (!adaptersDoc) return;

  if (!includesAll(adaptersDoc, ["AGENTS.md", "agent-roster.json", "copilot-instructions", ".cursor/rules", ".claude/agents", "source of truth"])) {
    findings.push({
      level: "warn",
      area: "agents",
      message: "ASSISTANT_ADAPTERS.md does not map the council roster to supported tool instruction surfaces.",
      remediation:
        "Document Codex/AGENTS.md, GitHub Copilot, Cursor rules, Claude Code subagents, and the source-of-truth rule for avoiding divergent agent instructions."
    });
  } else {
    findings.push({
      level: "pass",
      area: "agents",
      message: "ASSISTANT_ADAPTERS.md maps the council roster to tool-specific instruction surfaces."
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

function addModelRoutingFindings(cwd: string, findings: AuditFinding[]): void {
  const modelRoutingDoc = readDoc(cwd, "MODEL_ROUTING.md");
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

  const routingPath = join(cwd, DEFAULT_MODEL_ROUTING_TARGET);
  if (!existsSync(routingPath)) {
    findings.push({
      level: "warn",
      area: "models",
      message: `${DEFAULT_MODEL_ROUTING_TARGET} is missing.`,
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
      message: `${DEFAULT_MODEL_ROUTING_TARGET} is not valid JSON.`,
      remediation: "Replace it with .agent-kit/model-routing/default-model-routing.json or rerun agent-kit update."
    });
    return;
  }

  const contractResult = ModelRoutingContract.safeParse(routing);
  if (!contractResult.success) {
    findings.push({
      level: "warn",
      area: "models",
      message: `${DEFAULT_MODEL_ROUTING_TARGET} does not match the model-routing contract.`,
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
  addSchemaFindings(cwd, findings);
  addCouncilSessionRecordFindings(cwd, findings);

  for (const doc of ROOT_DOCS) {
    if (existsSync(join(cwd, doc))) {
      findings.push({ level: "pass", area: "docs", message: `${doc} exists.` });
    } else {
      findings.push({
        level: doc === "MODEL_ROUTING.md" ? "warn" : "fail",
        area: "docs",
        message: `${doc} is missing.`,
        remediation: `Run agent-kit init or restore ${doc} from the next-supabase template.`
      });
    }
  }

  addCouncilDocFindings(cwd, findings);
  addAssistantAdapterFindings(cwd, findings);
  addModelRoutingFindings(cwd, findings);
  addQualityGateFindings(cwd, findings);
  addUpgradeFindings(cwd, findings);
  addProjectEvidenceFindings(cwd, findings);

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
  if (!includesAny(testing, ["visual regression", "visual QA", "screenshot evidence", "toHaveScreenshot", "Storybook", "Chromatic", "Argos"])) {
    findings.push({
      level: "warn",
      area: "testing",
      message: "TESTING.md does not define visual QA or visual-regression evidence.",
      remediation: "Document the visual QA tier: screenshot review, Playwright screenshots, Storybook visual tests, or a visual-regression service for important UI changes."
    });
  }

  return findings;
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
