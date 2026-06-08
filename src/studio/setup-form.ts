import type { ProjectContextContractValue } from "../config/contracts.js";
import { initProjectContext, scanProjectContext, writeProjectContext, type ContextCommandResult } from "./context.js";
import { nowIso } from "./shared.js";

export interface SetupFormPayload {
  productSummary: string;
  productCategory: string;
  primaryAudience: string;
  primaryWorkflows: string;
  authModel: string;
  tenantModel: string;
  uiPreferred: string;
  uiAvoid: string;
  valueProposition: string;
  proof: string;
  objections: string;
  qualityTarget: ProjectContextContractValue["qualityTarget"];
  owner: string;
  ideSurface?: string;
  visualQaTier?: string;
  designAudience?: string;
  designContent?: string;
  designAntiReferences?: string;
  msgAudience?: string;
  msgPain?: string;
  msgOutcome?: string;
}

export interface SetupFormViewModel {
  projectName: string;
  openQuestions: string[];
  hasSupabase: boolean;
  form: SetupFormPayload;
}

/** Generic Next.js + Supabase auth baseline — downstream projects customize in the wizard. */
export const RECOMMENDED_SUPABASE_AUTH =
  "Supabase Auth with server-set session cookies via @supabase/ssr. Authorization is enforced in Postgres RLS for private tables, not only in UI code. Service-role keys stay server-only. Document how privileged admin or operator roles are granted and verified before changing auth boundaries.";

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function buildSetupFormViewModel(context: ProjectContextContractValue): SetupFormViewModel {
  return {
    projectName: context.projectName,
    openQuestions: context.openQuestions,
    hasSupabase: context.architecture.hasSupabase,
    form: {
      productSummary: context.productSummary,
      productCategory: context.productCategory,
      primaryAudience: context.primaryAudience,
      primaryWorkflows: context.primaryWorkflows.join("\n"),
      authModel: context.authModel,
      tenantModel: context.tenantModel,
      uiPreferred: context.uiDirection.preferred,
      uiAvoid: context.uiDirection.avoid,
      valueProposition: context.messaging.valueProposition,
      proof: context.messaging.proof.join("\n"),
      objections: context.messaging.objections.join("\n"),
      qualityTarget: context.qualityTarget,
      owner: context.owners[0] ?? ""
    }
  };
}

export function getSetupFormViewModel(cwd: string): SetupFormViewModel {
  const context = scanProjectContext(cwd);
  return buildSetupFormViewModel(context);
}

export function applySetupFormAnswers(cwd: string, payload: SetupFormPayload): ContextCommandResult {
  const base = scanProjectContext(cwd);
  const owners = uniqueStrings([payload.owner.trim(), ...base.owners]);
  const updated: ProjectContextContractValue = {
    ...base,
    productSummary: payload.productSummary.trim(),
    productCategory: payload.productCategory.trim() || "TBD",
    primaryAudience: payload.primaryAudience.trim(),
    primaryWorkflows: splitLines(payload.primaryWorkflows),
    authModel: payload.authModel.trim(),
    tenantModel: payload.tenantModel.trim(),
    uiDirection: {
      preferred: payload.uiPreferred.trim(),
      avoid: payload.uiAvoid.trim()
    },
    messaging: {
      valueProposition: payload.valueProposition.trim(),
      proof: splitLines(payload.proof),
      objections: splitLines(payload.objections)
    },
    qualityTarget: payload.qualityTarget,
    owners,
    lastReviewedAt: nowIso(),
    evidence: uniqueEvidence([
      ...base.evidence,
      { source: "agent-kit setup wizard", note: "Project context updated through the local web setup wizard." }
    ])
  };
  return writeProjectContext(cwd, updated);
}

export function ensureProjectContextForSetup(cwd: string): ContextCommandResult {
  return initProjectContext(cwd);
}

function uniqueEvidence(items: ProjectContextContractValue["evidence"]): ProjectContextContractValue["evidence"] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.source}:${item.note}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parseSetupFormPayload(raw: unknown): SetupFormPayload {
  if (!raw || typeof raw !== "object") {
    throw new Error("Setup form payload must be a JSON object.");
  }
  const body = raw as Record<string, unknown>;
  const qualityTarget = body.qualityTarget;
  if (
    qualityTarget !== "baseline-setup" &&
    qualityTarget !== "needs-improvement" &&
    qualityTarget !== "best-practice-candidate"
  ) {
    throw new Error("qualityTarget must be baseline-setup, needs-improvement, or best-practice-candidate.");
  }
  return {
    productSummary: String(body.productSummary ?? ""),
    productCategory: String(body.productCategory ?? ""),
    primaryAudience: String(body.primaryAudience ?? ""),
    primaryWorkflows: String(body.primaryWorkflows ?? ""),
    authModel: String(body.authModel ?? ""),
    tenantModel: String(body.tenantModel ?? ""),
    uiPreferred: String(body.uiPreferred ?? ""),
    uiAvoid: String(body.uiAvoid ?? ""),
    valueProposition: String(body.valueProposition ?? ""),
    proof: String(body.proof ?? ""),
    objections: String(body.objections ?? ""),
    qualityTarget,
    owner: String(body.owner ?? ""),
    ideSurface: body.ideSurface ? String(body.ideSurface) : undefined,
    visualQaTier: body.visualQaTier ? String(body.visualQaTier) : undefined,
    designAudience: body.designAudience ? String(body.designAudience) : undefined,
    designContent: body.designContent ? String(body.designContent) : undefined,
    designAntiReferences: body.designAntiReferences ? String(body.designAntiReferences) : undefined,
    msgAudience: body.msgAudience ? String(body.msgAudience) : undefined,
    msgPain: body.msgPain ? String(body.msgPain) : undefined,
    msgOutcome: body.msgOutcome ? String(body.msgOutcome) : undefined
  };
}

