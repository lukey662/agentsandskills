import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AgenticLevelContract, type AgenticLevelContractValue } from "../config/contracts.js";
import { createAuditReport } from "../install/audit.js";
import { validateAdapter, type AdapterValidationTarget } from "../install/adapter-validate.js";
import { scanProjectContext } from "./context.js";
import { loadOnboardingState, saveOnboardingState } from "./onboarding-state.js";
import { detectIdeRulePresent, type IdeSurface } from "./wizard/checklist.js";
import { nowIso } from "./shared.js";

export type AgenticLevelNumber = 3 | 4 | 5 | 6 | 7 | 8;
export type AgenticLevelSignal = AgenticLevelContractValue["signals"][number];
export type AgenticLevelReport = AgenticLevelContractValue;

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { at: number; report: AgenticLevelReport }>();

export function isMaintainerSourceRepo(cwd: string): boolean {
  return existsSync(join(cwd, "package.json")) && existsSync(join(cwd, "src")) && existsSync(join(cwd, "templates"));
}

function signal(id: string, level: 3 | 4 | 5 | 6, label: string, pass: boolean, evidence: string, remediation: string): AgenticLevelSignal {
  return { id, level, label, pass, evidence, remediation };
}

function detectIdePresent(cwd: string): { pass: boolean; evidence: string } {
  const onboarding = loadOnboardingState(cwd);
  if (onboarding.ideSurface && detectIdeRulePresent(cwd, onboarding.ideSurface)) {
    return { pass: true, evidence: `${onboarding.ideSurface} adapter configured` };
  }
  const surfaces: IdeSurface[] = ["cursor", "copilot", "claude", "codex"];
  for (const surface of surfaces) {
    if (detectIdeRulePresent(cwd, surface)) {
      return { pass: true, evidence: `${surface} adapter files detected` };
    }
  }
  if (existsSync(join(cwd, ".cursor/rules/cursor-agent-kit.mdc"))) {
    return { pass: true, evidence: "Cursor council rules from init" };
  }
  return { pass: false, evidence: "No IDE adapter rules or subagents detected" };
}

function detectTierBSubagents(cwd: string): { pass: boolean; evidence: string } {
  const paths = [".cursor/agents/planner.md", ".codex/agents/planner.toml", ".claude/agents/planner.md", ".github/copilot-instructions.md"];
  const found = paths.filter((rel) => existsSync(join(cwd, rel)));
  if (found.length > 0) {
    return { pass: true, evidence: `Specialist surface: ${found[0]}` };
  }
  return { pass: false, evidence: "No council subagents or Copilot instructions installed" };
}

function readDocSnippet(cwd: string, name: string, needles: string[]): boolean {
  const path = join(cwd, name);
  if (!existsSync(path)) return false;
  const lower = readFileSync(path, "utf8").toLowerCase();
  return needles.every((needle) => lower.includes(needle.toLowerCase()));
}

function adapterTargetForIde(ide: IdeSurface | undefined): AdapterValidationTarget | null {
  if (ide === "cursor" || ide === "codex" || ide === "claude" || ide === "copilot") return ide;
  return null;
}

function buildSignals(cwd: string, maintainerProfile: boolean): AgenticLevelSignal[] {
  const signals: AgenticLevelSignal[] = [];
  const ide = detectIdePresent(cwd);
  signals.push(
    signal(
      "l3-ide",
      3,
      "AI-native IDE or adapter rules",
      ide.pass,
      ide.evidence,
      "Run agent-kit init and complete the IDE station, or agent-kit init --activate cursor|codex"
    )
  );

  const context = scanProjectContext(cwd);
  const openQuestions = context.openQuestions.length;
  const contextReady =
    Boolean(context.productSummary.trim()) &&
    Boolean(context.primaryAudience.trim()) &&
    Boolean(context.authModel.trim()) &&
    context.primaryWorkflows.length > 0 &&
    openQuestions === 0;

  signals.push(
    signal(
      "l4-agents-md",
      4,
      "Council contract (AGENTS.md)",
      existsSync(join(cwd, "AGENTS.md")),
      existsSync(join(cwd, "AGENTS.md")) ? "AGENTS.md installed" : "AGENTS.md missing",
      "Run agent-kit init --stack next-supabase"
    )
  );
  signals.push(
    signal(
      "l4-adapters-doc",
      4,
      "Assistant activation doc",
      existsSync(join(cwd, "ASSISTANT_ADAPTERS.md")),
      existsSync(join(cwd, "ASSISTANT_ADAPTERS.md")) ? "ASSISTANT_ADAPTERS.md installed" : "ASSISTANT_ADAPTERS.md missing",
      "Run agent-kit init or agent-kit update"
    )
  );
  signals.push(
    signal(
      "l4-roster",
      4,
      "Machine-readable council roster",
      existsSync(join(cwd, ".agent-kit/agent-roster.json")),
      existsSync(join(cwd, ".agent-kit/agent-roster.json")) ? ".agent-kit/agent-roster.json present" : "Roster missing",
      "Run agent-kit init or agent-kit update"
    )
  );
  signals.push(
    signal(
      "l4-project-context",
      4,
      "Project context without open questions",
      contextReady,
      contextReady
        ? "Core project context fields complete"
        : openQuestions > 0
          ? `${openQuestions} open question(s) remain`
          : "Fill product, audience, auth, and workflows in setup",
      "Complete setup wizard or edit .agent-kit/project-context.json"
    )
  );

  const tierB = detectTierBSubagents(cwd);
  signals.push(
    signal("l5-subagents", 5, "Tier-B specialist activation", tierB.pass, tierB.evidence, "Run agent-kit init --activate cursor|codex|claude|copilot")
  );

  const loopCoding = existsSync(join(cwd, "LOOP_CODING.md"));
  signals.push(
    signal(
      "l6-loop-coding",
      6,
      "Loop coding playbook",
      loopCoding,
      loopCoding ? "LOOP_CODING.md installed" : "LOOP_CODING.md missing",
      "Run agent-kit update or agent-kit init on a current kit version"
    )
  );

  let auditPass = false;
  let auditEvidence = "Audit not run";
  try {
    const audit = createAuditReport(cwd);
    auditPass = audit.summary.fail === 0 && audit.readiness.level !== "needs-setup";
    auditEvidence = `${audit.summary.pass} pass / ${audit.summary.warn} warn / ${audit.summary.fail} fail · ${audit.readiness.level}`;
  } catch (error) {
    auditEvidence = error instanceof Error ? error.message : String(error);
  }
  signals.push(
    signal(
      "l6-audit-gate",
      6,
      "Audit gate at baseline-setup or better",
      auditPass,
      auditEvidence,
      "Run agent-kit audit --min-readiness baseline-setup and fix failures"
    )
  );

  if (maintainerProfile) {
    const pkgPath = join(cwd, "package.json");
    let releaseCheck = false;
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { scripts?: Record<string, string> };
        releaseCheck = Boolean(pkg.scripts?.["release:check"]) && existsSync(join(cwd, "scripts/release-check.mjs"));
      } catch {
        releaseCheck = false;
      }
    }
    signals.push(
      signal(
        "l6-maintainer-release-check",
        6,
        "Maintainer release-check gate",
        releaseCheck,
        releaseCheck ? "npm run release:check wired in package.json" : "release:check script missing",
        "Use npm run release:check before merge; see MAINTAINER_RELEASE.md"
      )
    );
    const maintainerDocs = existsSync(join(cwd, "MAINTAINER_RELEASE.md")) || readDocSnippet(cwd, "DOCS.md", ["maintainer dogfood", "dogfood:init"]);
    signals.push(
      signal(
        "l6-maintainer-docs",
        6,
        "Maintainer dogfood and release evidence docs",
        maintainerDocs,
        maintainerDocs ? "Maintainer climb docs present" : "Add MAINTAINER_RELEASE.md / DOCS maintainer section",
        "Read MAINTAINER_RELEASE.md and run npm run dogfood:init locally"
      )
    );
  } else {
    const onboarding = loadOnboardingState(cwd);
    const adapterTarget = adapterTargetForIde(onboarding.ideSurface);
    let adapterPass = false;
    let adapterEvidence = "No IDE surface selected for validation";
    if (adapterTarget) {
      const report = validateAdapter(cwd, adapterTarget);
      adapterPass = report.summary.fail === 0;
      adapterEvidence = `${adapterTarget}: ${report.summary.pass} pass / ${report.summary.warn} warn / ${report.summary.fail} fail`;
    } else if (tierB.pass) {
      const report = validateAdapter(cwd, "cursor");
      adapterPass = report.summary.fail === 0;
      adapterEvidence = `cursor (detected): ${report.summary.pass} pass / ${report.summary.fail} fail`;
    }
    signals.push(
      signal("l6-adapter-validate", 6, "Adapter validate for active IDE", adapterPass, adapterEvidence, "Run agent-kit adapter validate cursor|codex|all")
    );

    const ciWorkflow = existsSync(join(cwd, ".github/workflows/agent-kit-audit.yml"));
    const testingEval = existsSync(join(cwd, "TESTING.md")) && readDocSnippet(cwd, "TESTING.md", ["agent-kit audit", "eval"]);
    const evalLoop = ciWorkflow || testingEval;
    signals.push(
      signal(
        "l6-eval-loop",
        6,
        "Eval-driven loop documented in CI or TESTING.md",
        evalLoop,
        ciWorkflow
          ? ".github/workflows/agent-kit-audit.yml present"
          : testingEval
            ? "TESTING.md documents eval/audit loop"
            : "No CI audit workflow or TESTING eval section",
        "Enable agent-kit-audit.yml or add eval loop section to TESTING.md (see LOOP_CODING.md)"
      )
    );
  }

  return signals;
}

function computeCurrentLevel(signals: AgenticLevelSignal[]): 3 | 4 | 5 | 6 {
  let current: 3 | 4 | 5 | 6 = 3;
  for (const level of [3, 4, 5, 6] as const) {
    const tier = signals.filter((item) => item.level === level);
    if (tier.length === 0) continue;
    if (tier.every((item) => item.pass)) {
      current = level;
    } else {
      break;
    }
  }
  return current;
}

function defaultTargetLevel(maintainerProfile: boolean): AgenticLevelNumber {
  return maintainerProfile ? 6 : 5;
}

export function resolveTargetLevel(cwd: string, maintainerProfile: boolean): AgenticLevelNumber {
  const onboarding = loadOnboardingState(cwd);
  const raw = onboarding.targetAgenticLevel;
  if (raw && raw >= 3 && raw <= 8) return raw;
  return defaultTargetLevel(maintainerProfile);
}

export function computeAgenticLevel(cwd: string, options: { forceRefresh?: boolean } = {}): AgenticLevelReport {
  const cacheKey = cwd;
  const cached = cache.get(cacheKey);
  if (!options.forceRefresh && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.report;
  }

  const maintainerProfile = isMaintainerSourceRepo(cwd);
  const signals = buildSignals(cwd, maintainerProfile);
  const currentLevel = computeCurrentLevel(signals);
  const targetLevel = resolveTargetLevel(cwd, maintainerProfile);
  const climbSteps = signals.filter((item) => !item.pass && item.level <= Math.min(targetLevel, 6)).slice(0, 5);

  const report: AgenticLevelReport = AgenticLevelContract.parse({
    currentLevel,
    targetLevel,
    maintainerProfile,
    computedAt: nowIso(),
    maintainerNote: maintainerProfile ? "Kit source repo — run npm run dogfood:init locally; overlay is gitignored." : undefined,
    signals,
    climbSteps
  });

  cache.set(cacheKey, { at: Date.now(), report });
  saveOnboardingState(cwd, {
    lastAgenticLevel: currentLevel,
    lastAgenticComputedAt: report.computedAt
  });

  return report;
}

export function summarizeAdapterValidation(
  cwd: string,
  ideSurface: IdeSurface | undefined
): { pass: number; warn: number; fail: number; target: string | null } {
  const target = adapterTargetForIde(ideSurface);
  if (!target) {
    return { pass: 0, warn: 0, fail: 0, target: null };
  }
  const report = validateAdapter(cwd, target);
  return {
    pass: report.summary.pass,
    warn: report.summary.warn,
    fail: report.summary.fail,
    target
  };
}

export function invalidateAgenticLevelCache(cwd: string): void {
  cache.delete(cwd);
}
