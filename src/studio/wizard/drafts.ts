import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { writeConflictProposal } from "../../utils/fs.js";
import { loadOnboardingState, saveOnboardingState } from "../onboarding-state.js";
import { ensureStudioDirs, escapeMarkdownTableCell, escapeMarkdownText, nowIso, readJsonFile, writeJsonFile, writeTextFile } from "../shared.js";

export interface DesignDraft {
  audience: string;
  contentInventory: string;
  antiReferences: string;
  updatedAt: string;
}

export interface MessagingDraft {
  audience: string;
  pain: string;
  outcome: string;
  updatedAt: string;
}

export const DESIGN_DRAFT_JSON = ".agent-kit/onboarding/design-draft.json";
export const MESSAGING_DRAFT_JSON = ".agent-kit/onboarding/messaging-draft.json";

export function loadDesignDraft(cwd: string): DesignDraft | null {
  return readJsonFile<DesignDraft>(cwd, DESIGN_DRAFT_JSON);
}

export function saveDesignDraft(cwd: string, draft: Omit<DesignDraft, "updatedAt">): DesignDraft {
  ensureStudioDirs(cwd);
  const payload: DesignDraft = { ...draft, updatedAt: nowIso() };
  writeJsonFile(cwd, DESIGN_DRAFT_JSON, payload);
  return payload;
}

export function loadMessagingDraft(cwd: string): MessagingDraft | null {
  return readJsonFile<MessagingDraft>(cwd, MESSAGING_DRAFT_JSON);
}

export function saveMessagingDraft(cwd: string, draft: Omit<MessagingDraft, "updatedAt">): MessagingDraft {
  ensureStudioDirs(cwd);
  const payload: MessagingDraft = { ...draft, updatedAt: nowIso() };
  writeJsonFile(cwd, MESSAGING_DRAFT_JSON, payload);
  return payload;
}

export function previewDesignMarkdown(draft: DesignDraft): string {
  return `## Brand And Content Inputs (wizard draft)

| Area | Wizard draft |
| --- | --- |
| Primary audience | ${escapeMarkdownTableCell(draft.audience.trim() || "TBD")} |
| Content inventory | ${escapeMarkdownTableCell(draft.contentInventory.trim() || "TBD")} |

## Anti-References (wizard draft)

${escapeMarkdownText(draft.antiReferences.trim() || "- TBD: pattern to avoid.")}
`;
}

export function previewMessagingMarkdown(draft: MessagingDraft): string {
  return `## Discovery Questions (wizard draft)

| Question | Current Answer |
| --- | --- |
| Who is the primary audience? | ${escapeMarkdownTableCell(draft.audience.trim() || "TBD")} |
| What painful problem do they need solved? | ${escapeMarkdownTableCell(draft.pain.trim() || "TBD")} |
| What outcome do they want? | ${escapeMarkdownTableCell(draft.outcome.trim() || "TBD")} |
`;
}

export interface ApplyDraftResult {
  target: string;
  action: "appended" | "conflict" | "missing";
  conflictPath?: string;
}

function appendSectionToDoc(cwd: string, doc: string, sectionMarkdown: string): ApplyDraftResult {
  const fullPath = join(cwd, doc);
  if (!existsSync(fullPath)) {
    return { target: doc, action: "missing" };
  }
  const current = readFileSync(fullPath, "utf8");
  const proposed = `${current.trimEnd()}\n\n${sectionMarkdown.trim()}\n`;
  if (current.includes("(wizard draft)")) {
    const conflict = writeConflictProposal(cwd, doc, proposed, {
      currentContent: current,
      reason: "The target already contains an applied wizard draft."
    });
    return { target: doc, action: "conflict", conflictPath: conflict.conflictPath };
  }
  writeTextFile(cwd, doc, proposed);
  return { target: doc, action: "appended" };
}

export function applyDesignDraft(cwd: string): ApplyDraftResult {
  const draft = loadDesignDraft(cwd);
  if (!draft) return { target: "DESIGN.md", action: "missing" };
  const result = appendSectionToDoc(cwd, "DESIGN.md", previewDesignMarkdown(draft));
  if (result.action === "appended") {
    const state = loadOnboardingState(cwd);
    saveOnboardingState(cwd, {
      completedSections: [...new Set([...state.completedSections, "designDoc", "applyDrafts"])]
    });
  }
  return result;
}

export function applyMessagingDraft(cwd: string): ApplyDraftResult {
  const draft = loadMessagingDraft(cwd);
  if (!draft) return { target: "MESSAGING.md", action: "missing" };
  const result = appendSectionToDoc(cwd, "MESSAGING.md", previewMessagingMarkdown(draft));
  if (result.action === "appended") {
    const state = loadOnboardingState(cwd);
    saveOnboardingState(cwd, {
      completedSections: [...new Set([...state.completedSections, "messagingDoc", "applyDrafts"])]
    });
  }
  return result;
}

export function applyDrafts(cwd: string): ApplyDraftResult[] {
  return [applyDesignDraft(cwd), applyMessagingDraft(cwd)];
}
