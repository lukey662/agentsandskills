import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/install/install.js";
import { loadOnboardingState } from "../src/studio/onboarding-state.js";
import { startSetupServer } from "../src/studio/setup-server.js";
import { applyDesignDraft, applyDrafts, applyMessagingDraft, loadDesignDraft, saveDesignDraft, saveMessagingDraft } from "../src/studio/wizard/drafts.js";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true, maxRetries: 3 });
  roots = [];
});

function tempProject(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-setup-api-"));
  roots.push(root);
  writeFileSync(
    join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "setup-api-test",
        scripts: { test: "vitest run", build: "next build" },
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

describe("setup server API routes", () => {
  it("PATCH /api/state completes a valid section", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completeSection: "product", depth: "quick" })
      });
      expect(res.ok).toBe(true);
      const onboarding = loadOnboardingState(root);
      expect(onboarding.completedSections).toContain("product");
      expect(onboarding.depth).toBe("quick");
    } finally {
      await server.close();
    }
  });

  it("PATCH /api/state rejects invalid section id", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completeSection: "not-a-real-section" })
      });
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toContain("Invalid section id");
    } finally {
      await server.close();
    }
  });

  it("GET /api/context returns setup form view model", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/context`);
      expect(res.ok).toBe(true);
      const body = (await res.json()) as { form: Record<string, string>; projectName: string };
      expect(body.projectName).toBe("setup-api-test");
      expect(body.form).toBeDefined();
    } finally {
      await server.close();
    }
  });

  it("POST /api/context/import seeds wizard draft from context", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/context/import`, { method: "POST" });
      expect(res.ok).toBe(true);
      expect(existsSync(join(root, ".agent-kit", "onboarding", "wizard-draft.json"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  it("POST /api/checklist/visual-qa persists tier", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/checklist/visual-qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "baseline" })
      });
      expect(res.ok).toBe(true);
      const onboarding = loadOnboardingState(root);
      expect(onboarding.visualQaTier).toBe("baseline");
      expect(onboarding.completedSections).toContain("visualQa");
    } finally {
      await server.close();
    }
  });

  it("POST /api/drafts/design saves draft and returns preview", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/drafts/design`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: "Operators",
          contentInventory: "Tasks and queues",
          antiReferences: "Generic dashboards"
        })
      });
      expect(res.ok).toBe(true);
      const body = (await res.json()) as { preview: string; draft: { audience: string } };
      expect(body.preview).toContain("Operators");
      expect(body.draft.audience).toBe("Operators");
      expect(loadDesignDraft(root)?.audience).toBe("Operators");
    } finally {
      await server.close();
    }
  });

  it("POST /api/drafts/messaging saves draft and returns preview", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/drafts/messaging`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience: "Buyers", pain: "Slow workflows", outcome: "Faster delivery" })
      });
      expect(res.ok).toBe(true);
      const body = (await res.json()) as { preview: string };
      expect(body.preview).toContain("Buyers");
    } finally {
      await server.close();
    }
  });

  it("POST /api/drafts/apply appends drafts to DESIGN.md and MESSAGING.md", async () => {
    const root = tempProject();
    saveDesignDraft(root, { audience: "Ops", contentInventory: "Queues", antiReferences: "Card soup" });
    saveMessagingDraft(root, { audience: "Ops", pain: "Delay", outcome: "Speed" });
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/drafts/apply`, { method: "POST" });
      expect(res.ok).toBe(true);
      const design = readFileSync(join(root, "DESIGN.md"), "utf8");
      const messaging = readFileSync(join(root, "MESSAGING.md"), "utf8");
      expect(design).toContain("(wizard draft)");
      expect(messaging).toContain("(wizard draft)");
    } finally {
      await server.close();
    }
  });

  it("POST /api/checklist/ide activates cursor adapters", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/checklist/ide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideSurface: "cursor" })
      });
      expect(res.ok).toBe(true);
      const body = (await res.json()) as { activation?: { activated: string[] } };
      expect(body.activation?.activated).toContain("cursor");
    } finally {
      await server.close();
    }
  });

  it("POST /api/agentic-level/refresh returns recomputed level", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/agentic-level/refresh`, { method: "POST" });
      expect(res.ok).toBe(true);
      const body = (await res.json()) as { agenticLevel?: { currentLevel: number } };
      expect(body.agenticLevel?.currentLevel).toBeGreaterThanOrEqual(3);
    } finally {
      await server.close();
    }
  });

  it("POST with oversized body is rejected", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: { productSummary: "x".repeat(260_000) } })
      });
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string };
      expect(body.error).toContain("too large");
    } finally {
      await server.close();
    }
  });

  it("POST with malformed JSON returns 400", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not-json"
      });
      expect(res.status).toBe(400);
    } finally {
      await server.close();
    }
  });

  it("unknown path returns 404 JSON", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/does-not-exist`);
      expect(res.status).toBe(404);
      const body = (await res.json()) as { error: string };
      expect(body.error).toBe("Not found.");
    } finally {
      await server.close();
    }
  });
});

describe("wizard draft helpers", () => {
  it("apply with no draft returns missing", () => {
    const root = tempProject();
    expect(applyDesignDraft(root).action).toBe("missing");
    expect(applyMessagingDraft(root).action).toBe("missing");
    expect(applyDrafts(root).every((r) => r.action === "missing")).toBe(true);
  });

  it("empty draft save and re-apply idempotency", () => {
    const root = tempProject();
    saveDesignDraft(root, { audience: "", contentInventory: "", antiReferences: "" });
    const first = applyDesignDraft(root);
    expect(first.action).toBe("appended");
    const second = applyDesignDraft(root);
    expect(second.action).toBe("conflict");
    expect(readFileSync(join(root, "DESIGN.md"), "utf8").match(/\(wizard draft\)/g)?.length).toBe(2);
  });
});
