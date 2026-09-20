import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadCatalog } from "../src/catalog.js";
import { initProject } from "../src/install/install.js";

/**
 * catalog.json is the only source for the handoff prompts and the ask policy. Every human
 * or generated copy must match it exactly so agents never launch each other with drifted text.
 */

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function temp(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-payloads-"));
  roots.push(root);
  return root;
}

const here = process.cwd();

describe("spawn payloads and ask policy have one source", () => {
  const catalog = loadCatalog();
  const payloads = catalog.spawnPayloads;

  it("catalog defines every payload and the policy", () => {
    for (const id of ["planner", "app-engineer", "security", "design", "design-setup", "qa", "copy", "ship"] as const) {
      expect(payloads[id]).toBeTruthy();
    }
    expect(catalog.askPolicy).toContain("Bundle up to three");
    expect(catalog.askPolicy).toContain("Never ask what the repo can answer");
    expect(catalog.askPolicy).not.toMatch(/explicit yes|sounds good/i);
  });

  it("both AGENTS.md files carry every payload and the policy verbatim", () => {
    for (const path of ["AGENTS.md", "templates/next-supabase/AGENTS.md"]) {
      const text = readFileSync(join(here, path), "utf8");
      expect(text).toContain("## Ask before acting");
      expect(text).toContain(catalog.askPolicy);
      expect(text).toContain("## Spawn payloads");
      for (const payload of Object.values(payloads)) expect(text).toContain(payload);
    }
  });

  it("USER_GUIDE.md human copies match the catalog", () => {
    const guide = readFileSync(join(here, "USER_GUIDE.md"), "utf8");
    for (const payload of Object.values(payloads)) expect(guide).toContain(payload);
  });

  it("every default agent keeps the QA payload inline and points elsewhere for the rest", () => {
    for (const id of catalog.defaultAgents) {
      const agent = readFileSync(join(here, "agents", id, "agent.md"), "utf8");
      expect(agent).toContain("## Ask before acting");
      expect(agent).toContain("AGENTS.md");
      // Every specialist that hands to QA carries the gate prompt itself. Planner names the
      // owner and the conductor launches QA; QA does not launch QA.
      if (id !== "qa" && id !== "planner") expect(agent).toContain(payloads.qa);
      // No agent invents a second prompt set or gates on the wording of a yes.
      expect(agent).not.toMatch(/explicit yes|sounds good/i);
      expect(agent).not.toContain("nextjs-engineer");
      expect(agent).not.toContain("frontend-design-lead");
    }
  });

  it("planning and product-copy follow the shared ask policy", () => {
    for (const id of ["planning", "product-copy"]) {
      const skill = readFileSync(join(here, "skills", id, "SKILL.md"), "utf8");
      expect(skill).toContain("Ask before acting");
      expect(skill).not.toMatch(/explicit yes|sounds good/i);
    }
  });

  it("generated Copilot instructions and Antigravity agents use the catalog payloads", () => {
    const root = temp();
    initProject({ cwd: root, activate: ["copilot", "antigravity"] });

    const copilot = readFileSync(join(root, ".github/copilot-instructions.md"), "utf8");
    for (const payload of Object.values(payloads)) expect(copilot).toContain(payload);
    expect(copilot).toContain(catalog.askPolicy);

    // Antigravity agents carry the canonical body, which inlines the QA payload for every specialist.
    for (const id of ["app-engineer", "design", "copy", "security"]) {
      expect(readFileSync(join(root, ".agents/agents", id, "agent.md"), "utf8")).toContain(payloads.qa);
    }
  });
});
