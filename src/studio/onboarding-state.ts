import { existsSync } from "node:fs";
import { join } from "node:path";
import { OnboardingStateContract, type OnboardingStateContractValue } from "../config/contracts.js";
import { scanProjectContext } from "./context.js";
import {
  COMPLETE_SECTIONS,
  QUICK_SECTIONS,
  SECTION_LABELS,
  STANDARD_SECTIONS,
  WIZARD_VERSION,
  type WizardDepth,
  type WizardSectionId,
  sectionsForDepth
} from "./wizard/steps.js";
import { ensureStudioDirs, nowIso, readJsonFile, writeJsonFile } from "./shared.js";

export const ONBOARDING_DIR = ".agent-kit/onboarding";
export const ONBOARDING_STATE_JSON = ".agent-kit/onboarding/state.json";

export type SectionStatus = "done" | "in_progress" | "optional" | "not_started";

export interface SetupProgressSection {
  id: WizardSectionId;
  label: string;
  status: SectionStatus;
}

export interface SetupProgress {
  percent: number;
  depth: WizardDepth;
  quickComplete: boolean;
  sections: SetupProgressSection[];
  recommendedNext: WizardSectionId | null;
  openContextQuestions: number;
}

function defaultState(): OnboardingStateContractValue {
  const now = nowIso();
  return {
    schemaVersion: 1,
    depth: "undecided",
    startedAt: now,
    lastVisitedAt: now,
    completedSections: [],
    skippedSections: [],
    currentSection: "home",
    currentStep: 0,
    wizardVersion: WIZARD_VERSION
  };
}

export function loadOnboardingState(cwd: string): OnboardingStateContractValue {
  ensureStudioDirs(cwd);
  const existing = readJsonFile<unknown>(cwd, ONBOARDING_STATE_JSON);
  if (!existing) return defaultState();
  const parsed = OnboardingStateContract.safeParse(existing);
  if (!parsed.success) return defaultState();
  return parsed.data;
}

export function saveOnboardingState(
  cwd: string,
  patch: Partial<OnboardingStateContractValue>
): OnboardingStateContractValue {
  const current = loadOnboardingState(cwd);
  const next: OnboardingStateContractValue = OnboardingStateContract.parse({
    ...current,
    ...patch,
    lastVisitedAt: nowIso()
  });
  writeJsonFile(cwd, ONBOARDING_STATE_JSON, next);
  return next;
}

function sectionStatus(state: OnboardingStateContractValue, section: WizardSectionId): SectionStatus {
  if (state.completedSections.includes(section)) return "done";
  if (state.skippedSections.includes(section)) return "optional";
  if (state.currentSection === section) return "in_progress";
  const optionalSections: WizardSectionId[] = ["visualQa", "designDoc", "messagingDoc", "applyDrafts", "ui"];
  if (optionalSections.includes(section) && state.depth === "quick") return "optional";
  if (section === "review" && state.completedSections.includes("messaging")) return "in_progress";
  return "not_started";
}

function isQuickComplete(state: OnboardingStateContractValue, openQuestions: number): boolean {
  const required = QUICK_SECTIONS.filter((s) => s !== "review");
  const done = required.every((section) => state.completedSections.includes(section));
  return done && openQuestions === 0;
}

export function getSetupProgress(cwd: string): SetupProgress {
  const state = loadOnboardingState(cwd);
  const context = scanProjectContext(cwd);
  const openContextQuestions = context.openQuestions.length;
  const activeSections =
    state.depth === "undecided" ? QUICK_SECTIONS : sectionsForDepth(state.depth);
  const sections: SetupProgressSection[] = activeSections.map((id) => ({
    id,
    label: SECTION_LABELS[id],
    status: sectionStatus(state, id)
  }));

  const doneCount = sections.filter((s) => s.status === "done").length;
  const percent = sections.length === 0 ? 0 : Math.round((doneCount / sections.length) * 100);

  let recommendedNext: WizardSectionId | null = null;
  for (const section of activeSections) {
    if (!state.completedSections.includes(section) && !state.skippedSections.includes(section)) {
      recommendedNext = section;
      break;
    }
  }

  return {
    percent,
    depth: state.depth,
    quickComplete: isQuickComplete(state, openContextQuestions),
    sections,
    recommendedNext,
    openContextQuestions
  };
}

export function markSectionComplete(cwd: string, section: WizardSectionId): OnboardingStateContractValue {
  const state = loadOnboardingState(cwd);
  const completedSections = [...new Set([...state.completedSections, section])];
  return saveOnboardingState(cwd, { completedSections });
}

export function markQuickPathComplete(cwd: string): OnboardingStateContractValue {
  const state = loadOnboardingState(cwd);
  return saveOnboardingState(cwd, {
    completedSections: [...new Set([...state.completedSections, ...QUICK_SECTIONS, "complete"])],
    completedAt: nowIso(),
    currentSection: "complete"
  });
}

export function onboardingStateExists(cwd: string): boolean {
  return existsSync(join(cwd, ONBOARDING_STATE_JSON));
}

export function depthIncludesStandard(depth: WizardDepth): boolean {
  return depth === "standard" || depth === "complete";
}

export function depthIncludesComplete(depth: WizardDepth): boolean {
  return depth === "complete";
}

export { QUICK_SECTIONS, STANDARD_SECTIONS, COMPLETE_SECTIONS };
