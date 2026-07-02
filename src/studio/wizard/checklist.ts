import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadOnboardingState, saveOnboardingState } from "../onboarding-state.js";
import { nowIso, writeTextFile } from "../shared.js";

export type IdeSurface = "cursor" | "copilot" | "claude" | "codex" | "other";

const IDE_PATHS: Record<IdeSurface, string> = {
  cursor: ".cursor/agents/planner.md",
  copilot: ".github/copilot-instructions.md",
  claude: ".claude/agents/planner.md",
  codex: ".codex/agents/planner.toml",
  other: "ASSISTANT_ADAPTERS.md"
};

export function saveIdeChecklist(cwd: string, ideSurface: IdeSurface): { idePath: string; present: boolean } {
  const state = loadOnboardingState(cwd);
  saveOnboardingState(cwd, {
    ideSurface,
    ideVerifiedAt: nowIso(),
    completedSections: [...new Set([...state.completedSections, "ide"])]
  });
  const idePath = IDE_PATHS[ideSurface];
  return { idePath, present: detectIdeRulePresent(cwd, ideSurface) };
}

export function detectIdeRulePresent(cwd: string, ideSurface: IdeSurface): boolean {
  const rel = IDE_PATHS[ideSurface];
  if (ideSurface === "cursor") {
    return existsSync(join(cwd, rel)) || existsSync(join(cwd, ".cursor/rules/cursor-agent-kit.mdc"));
  }
  if (rel.endsWith("/")) {
    return existsSync(join(cwd, rel));
  }
  return existsSync(join(cwd, rel));
}

const VISUAL_QA_MARKER = "## Visual QA Tier";

const VISUAL_QA_BLOCKS: Record<"baseline" | "strong" | "mature", string> = {
  baseline: `${VISUAL_QA_MARKER}

This project uses the **Baseline** visual QA tier.

- Manual desktop/mobile screenshot review for important UI changes
- Use \`.agent-kit/prompts/screenshot-review.md\` as the review checklist
`,
  strong: `${VISUAL_QA_MARKER}

This project uses the **Strong** visual QA tier.

- Playwright screenshot checks for stable pages and states
- Manual screenshot review for high-risk UI changes using \`.agent-kit/prompts/screenshot-review.md\`
`,
  mature: `${VISUAL_QA_MARKER}

This project uses the **Mature** visual QA tier.

- Storybook or component-state coverage where practical
- Visual regression in CI through Playwright snapshots, Chromatic, Argos, Loki, or equivalent
`
};

export interface VisualQaWriteResult {
  updated: boolean;
  path: string;
  reason?: string;
}

export function writeVisualQaTier(cwd: string, tier: "baseline" | "strong" | "mature"): VisualQaWriteResult {
  const path = "TESTING.md";
  const fullPath = join(cwd, path);
  if (!existsSync(fullPath)) {
    return { updated: false, path, reason: "TESTING.md not found in project root." };
  }
  const current = readFileSync(fullPath, "utf8");
  if (current.includes(VISUAL_QA_MARKER)) {
    return {
      updated: false,
      path,
      reason: "Visual QA tier block already exists — edit TESTING.md manually to avoid overwriting custom content."
    };
  }
  writeTextFile(cwd, path, `${current.trimEnd()}\n\n${VISUAL_QA_BLOCKS[tier]}`);
  const state = loadOnboardingState(cwd);
  saveOnboardingState(cwd, {
    visualQaTier: tier,
    completedSections: [...new Set([...state.completedSections, "visualQa"])]
  });
  return { updated: true, path };
}

export function getIdeSurfaces(): { id: IdeSurface; label: string; path: string }[] {
  return [
    { id: "cursor", label: "Cursor", path: IDE_PATHS.cursor },
    { id: "copilot", label: "GitHub Copilot / VS Code", path: IDE_PATHS.copilot },
    { id: "claude", label: "Claude Code", path: IDE_PATHS.claude },
    { id: "codex", label: "Codex / AGENTS.md tools", path: IDE_PATHS.codex },
    { id: "other", label: "Other / multiple", path: IDE_PATHS.other }
  ];
}
