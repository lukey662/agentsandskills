import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/install/install.js";
import { buildOfficeStations } from "../src/studio/office/map.js";
import { renderSetupOfficeHtml, renderSetupOfficeHtmlWithContext } from "../src/studio/office/render.js";
import { loadProjectRosterAgents } from "../src/studio/wizard/roster.js";
import { startSetupServer } from "../src/studio/setup-server.js";
import { writeFileSync } from "node:fs";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function tempProject(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-office-test-"));
  roots.push(root);
  writeFileSync(
    join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "office-test-project",
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

describe("Agent Office setup view", () => {
  it("renders office html with canvas and accessibility landmarks", () => {
    const html = renderSetupOfficeHtml();
    expect(html).toContain("Agent Office");
    expect(html).toContain("office-floor");
    expect(html).toContain("station-list");
    expect(html).toContain("Form view");
    expect(html).toContain("aria-live");
  });

  it("builds agent desk stations from roster", () => {
    const root = tempProject();
    const agents = loadProjectRosterAgents(root);
    const stations = buildOfficeStations(agents);
    expect(stations.some((s) => s.id === "ide")).toBe(true);
    expect(stations.filter((s) => s.kind === "agent").length).toBe(agents.length);
  });

  it("serves office at /, /setup, and wizard at /wizard", async () => {
    const root = tempProject();
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      for (const path of ["/", "/setup", "/office"]) {
        const res = await fetch(`${server.url}${path}`);
        expect(res.ok).toBe(true);
        const html = await res.text();
        expect(html).toContain("Agent Office");
        expect(html).toContain('data-view="office-v1"');
      }

      const redirectRes = await fetch(`${server.url}/setup/wizard`, { redirect: "manual" });
      expect(redirectRes.status).toBe(302);
      expect(redirectRes.headers.get("location")).toBe("/wizard");

      const wizardRes = await fetch(`${server.url}/wizard`);
      expect(wizardRes.ok).toBe(true);
      const wizardHtml = await wizardRes.text();
      expect(wizardHtml).toContain("Setup Wizard");
      expect(wizardHtml).toContain("Open Agent Office");
      expect(wizardHtml).toContain('data-view="wizard-v1"');
    } finally {
      await server.close();
    }
  });

  it("saves draft from office API flow", async () => {
    const root = tempProject();
    renderSetupOfficeHtmlWithContext(root);
    const server = await startSetupServer({ cwd: root, port: 0 });
    try {
      await fetch(`${server.url}/api/state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depth: "quick" })
      });

      const draftRes = await fetch(`${server.url}/api/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: {
            ideSurface: "cursor",
            productSummary: "Office smoke product.",
            productCategory: "saas",
            primaryAudience: "Operators",
            primaryWorkflows: "One\nTwo",
            authModel: "Supabase Auth.",
            tenantModel: "single-user",
            uiPreferred: "Clear.",
            uiAvoid: "",
            valueProposition: "Faster ops.",
            proof: "",
            objections: "",
            qualityTarget: "baseline-setup",
            owner: "test",
            agentBrief_planner: "Route editorial work carefully."
          }
        })
      });
      expect(draftRes.ok).toBe(true);

      const saveRes = await fetch(`${server.url}/api/context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideSurface: "cursor",
          productSummary: "Office smoke product.",
          productCategory: "saas",
          primaryAudience: "Operators",
          primaryWorkflows: "One\nTwo",
          authModel: "Supabase Auth.",
          tenantModel: "single-user",
          uiPreferred: "Clear.",
          uiAvoid: "",
          valueProposition: "Faster ops.",
          proof: "",
          objections: "",
          qualityTarget: "baseline-setup",
          owner: "test",
          agentBrief_planner: "Route editorial work carefully."
        })
      });
      expect(saveRes.ok).toBe(true);
      const saved = (await saveRes.json()) as { openQuestions: string[] };
      expect(saved.openQuestions).toHaveLength(0);
    } finally {
      await server.close();
    }
  });
});
