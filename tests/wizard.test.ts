import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/install/install.js";
import {
  getSetupProgress,
  loadOnboardingState,
  markSectionComplete,
  saveOnboardingState
} from "../src/studio/onboarding-state.js";
import { applySetupFormAnswers } from "../src/studio/setup-form.js";
import { startSetupServer } from "../src/studio/setup-server.js";
import { saveIdeChecklist, writeVisualQaTier } from "../src/studio/wizard/checklist.js";
import { applyDesignDraft, saveDesignDraft } from "../src/studio/wizard/drafts.js";
import { renderSetupWizardHtml } from "../src/studio/wizard/render.js";
import { buildWizardFormState } from "../src/studio/wizard/wizard-draft.js";
import { writeFileSync } from "node:fs";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function tempProject(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-wizard-test-"));
  roots.push(root);
  writeFileSync(
    join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "wizard-test-project",
        scripts: { test: "vitest run" },
        dependencies: { next: "15.0.0", react: "19.0.0", "@supabase/supabase-js": "2.0.0" }
      },
      null,
      2
    )}\n`
  );
  writeFileSync(join(root, "TESTING.md"), "# Testing\n\nSmoke tests.\n");
  initProject({ cwd: root });
  return root;
}

describe("Startup setup wizard", () => {
  it("tracks onboarding state and progress", () => {
    const root = tempProject();
    saveOnboardingState(root, { depth: "quick", currentSection: "product" });
    markSectionComplete(root, "product");
    const progress = getSetupProgress(root);
    expect(progress.depth).toBe("quick");
    expect(progress.sections.some((s) => s.id === "product" && s.status === "done")).toBe(true);
  });

  it("renders wizard html with accessibility and generic copy", () => {
    const html = renderSetupWizardHtml();
    expect(html).toContain("Agent Kit");
    expect(html).toContain("section-nav");
    expect(html).toContain("aria-live");
    expect(html).not.toContain("ADMIN_EMAILS");
    expect(html).not.toContain("Ingest source content");
  });

  it("keeps wizard form empty even when project context is already filled", () => {
    const root = tempProject();
    applySetupFormAnswers(root, {
      productSummary: "Pre-filled executive newsletter.",
      productCategory: "content-app",
      primaryAudience: "Executives",
      primaryWorkflows: "Ingest\nReview\nPublish",
      authModel: "Supabase Auth.",
      tenantModel: "single-user",
      uiPreferred: "Scannable.",
      uiAvoid: "Clutter.",
      valueProposition: "Actionable briefings.",
      proof: "Human review",
      objections: "Trust?",
      qualityTarget: "needs-improvement",
      owner: "owner"
    });
    const form = buildWizardFormState(root);
    expect(form.productSummary).toBe("");
    expect(form.primaryAudience).toBe("");
    expect(form.valueProposition).toBe("");
  });

  it("serves state and saves context through the wizard API", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const stateRes = await fetch(`${server.url}/api/state`);
      expect(stateRes.ok).toBe(true);
      const state = (await stateRes.json()) as { projectName: string; progress: { depth: string } };
      expect(state.projectName).toBe("wizard-test-project");

      await fetch(`${server.url}/api/state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depth: "standard" })
      });

      const saveRes = await fetch(`${server.url}/api/context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideSurface: "cursor",
          productSummary: "A task-first SaaS app for operators.",
          productCategory: "saas",
          primaryAudience: "Operations managers",
          primaryWorkflows: "Configure workspace\nRun primary workflow\nExport results",
          authModel: "Supabase Auth with RLS.",
          tenantModel: "team",
          uiPreferred: "Clear and task-first.",
          uiAvoid: "Generic dashboards.",
          valueProposition: "Operators finish work faster.",
          proof: "Shipped workflow automation",
          objections: "Too complex? — Three-step primary flow.",
          qualityTarget: "needs-improvement",
          owner: "owner"
        })
      });
      expect(saveRes.ok).toBe(true);
      const saved = (await saveRes.json()) as { openQuestions: string[]; progress: { quickComplete: boolean } };
      expect(saved.openQuestions).toHaveLength(0);
      expect(saved.progress.quickComplete).toBe(true);
    } finally {
      await server.close();
    }
  });

  it("writes visual QA tier and design draft helpers", () => {
    const root = tempProject();
    const ide = saveIdeChecklist(root, "cursor");
    expect(ide.idePath).toContain(".cursor/rules");
    const qa = writeVisualQaTier(root, "strong");
    expect(qa.updated).toBe(true);
    saveDesignDraft(root, {
      audience: "Operators",
      contentInventory: "Tasks, queues, exports",
      antiReferences: "Generic card dashboards"
    });
    const apply = applyDesignDraft(root);
    expect(apply.action).toBe("appended");
    const onboarding = loadOnboardingState(root);
    expect(onboarding.ideSurface).toBe("cursor");
    expect(onboarding.visualQaTier).toBe("strong");
  });
});
