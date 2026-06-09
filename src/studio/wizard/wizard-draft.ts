import type { SetupFormPayload } from "../setup-form.js";
import { loadOnboardingState } from "../onboarding-state.js";
import { ensureStudioDirs, nowIso, readJsonFile, writeJsonFile } from "../shared.js";
import { loadAgentBriefs } from "./agent-briefs.js";
import { agentBriefFieldName } from "./roster.js";

export const WIZARD_DRAFT_JSON = ".agent-kit/onboarding/wizard-draft.json";

export interface WizardDraftFile {
  schemaVersion: 1;
  updatedAt: string;
  form: Partial<SetupFormPayload>;
  agentBriefs: Record<string, string>;
}

function emptyDraft(): WizardDraftFile {
  return { schemaVersion: 1, updatedAt: nowIso(), form: {}, agentBriefs: {} };
}

export function loadWizardDraft(cwd: string): WizardDraftFile {
  ensureStudioDirs(cwd);
  const existing = readJsonFile<WizardDraftFile>(cwd, WIZARD_DRAFT_JSON);
  if (!existing || existing.schemaVersion !== 1) return emptyDraft();
  return {
    schemaVersion: 1,
    updatedAt: existing.updatedAt ?? nowIso(),
    form: existing.form ?? {},
    agentBriefs: existing.agentBriefs ?? {}
  };
}

export function saveWizardDraft(
  cwd: string,
  patch: { form?: Partial<SetupFormPayload>; agentBriefs?: Record<string, string> }
): WizardDraftFile {
  const current = loadWizardDraft(cwd);
  const next: WizardDraftFile = {
    schemaVersion: 1,
    updatedAt: nowIso(),
    form: { ...current.form, ...(patch.form ?? {}) },
    agentBriefs: { ...current.agentBriefs, ...(patch.agentBriefs ?? {}) }
  };
  writeJsonFile(cwd, WIZARD_DRAFT_JSON, next);
  return next;
}

/** Empty interview fields for a fresh wizard; resume from draft + onboarding IDE choice only. */
export function buildWizardFormState(cwd: string): Record<string, string> {
  const draft = loadWizardDraft(cwd);
  const onboarding = loadOnboardingState(cwd);
  const briefs = loadAgentBriefs(cwd);
  const form: Record<string, string> = {
    productSummary: "",
    productCategory: "TBD",
    primaryAudience: "",
    primaryWorkflows: "",
    authModel: "",
    tenantModel: "single-user",
    uiPreferred: "",
    uiAvoid: "",
    valueProposition: "",
    proof: "",
    objections: "",
    qualityTarget: "baseline-setup",
    owner: "",
    ideSurface: onboarding.ideSurface ?? draft.form.ideSurface ?? "",
    visualQaTier: onboarding.visualQaTier ?? draft.form.visualQaTier ?? "baseline",
    designAudience: "",
    designContent: "",
    designAntiReferences: "",
    msgAudience: "",
    msgPain: "",
    msgOutcome: ""
  };
  for (const [key, value] of Object.entries(draft.form)) {
    if (value !== undefined && value !== null && String(value).trim()) {
      form[key] = String(value);
    }
  }
  const mergedBriefs = { ...briefs.briefs, ...draft.agentBriefs };
  for (const [agentId, text] of Object.entries(mergedBriefs)) {
    if (text.trim()) form[agentBriefFieldName(agentId)] = text.trim();
  }
  return form;
}

export function extractAgentBriefsFromForm(form: Record<string, string>): Record<string, string> {
  const briefs: Record<string, string> = {};
  for (const [key, value] of Object.entries(form)) {
    if (!key.startsWith("agentBrief_")) continue;
    const agentId = key.slice("agentBrief_".length);
    const text = String(value).trim();
    if (text) briefs[agentId] = text;
  }
  return briefs;
}

export function extractSetupFormFromWizardForm(form: Record<string, string>): SetupFormPayload {
  return {
    productSummary: form.productSummary ?? "",
    productCategory: form.productCategory ?? "TBD",
    primaryAudience: form.primaryAudience ?? "",
    primaryWorkflows: form.primaryWorkflows ?? "",
    authModel: form.authModel ?? "",
    tenantModel: form.tenantModel ?? "single-user",
    uiPreferred: form.uiPreferred ?? "",
    uiAvoid: form.uiAvoid ?? "",
    valueProposition: form.valueProposition ?? "",
    proof: form.proof ?? "",
    objections: form.objections ?? "",
    qualityTarget: (form.qualityTarget as SetupFormPayload["qualityTarget"]) ?? "baseline-setup",
    owner: form.owner ?? "",
    ...(form.ideSurface ? { ideSurface: form.ideSurface } : {}),
    ...(form.visualQaTier ? { visualQaTier: form.visualQaTier } : {}),
    ...(form.designAudience ? { designAudience: form.designAudience } : {}),
    ...(form.designContent ? { designContent: form.designContent } : {}),
    ...(form.designAntiReferences ? { designAntiReferences: form.designAntiReferences } : {}),
    ...(form.msgAudience ? { msgAudience: form.msgAudience } : {}),
    ...(form.msgPain ? { msgPain: form.msgPain } : {}),
    ...(form.msgOutcome ? { msgOutcome: form.msgOutcome } : {})
  };
}
