import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadCatalog } from "../src/catalog.js";
import { initProject } from "../src/install/install.js";

const catalogPointer = "Other skills: `catalog.json` and the skill table in `USER_GUIDE.md`.";
const payloadPointer = "payload from `AGENTS.md` → Spawn payloads";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function agentFiles(): string[] {
  const root = join(process.cwd(), "agents");
  const defaults = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "optional")
    .map((entry) => join(root, entry.name, "agent.md"));
  const optionalRoot = join(root, "optional");
  const optionals = readdirSync(optionalRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(optionalRoot, entry.name, "agent.md"));
  return [...defaults, ...optionals];
}

describe("agent skill catalog pointer", () => {
  it("Planner names planning and the session launches the owner", () => {
    const planner = readFileSync(join(process.cwd(), "agents/planner/agent.md"), "utf8");
    expect(planner).toMatch(/`planning`/);
    expect(planner).toContain("Launch the owner");
    expect(planner).toContain(payloadPointer);
    expect(planner).not.toContain("You do not run the other agents.");
    expect(planner).toContain(catalogPointer);
  });

  it("default specialists hand off through AGENTS.md payloads and keep the QA gate inline", () => {
    const catalog = loadCatalog();
    const qaPrompt = catalog.spawnPayloads.qa;
    for (const id of ["app-engineer", "design", "copy", "security"]) {
      const agent = readFileSync(join(process.cwd(), "agents", id, "agent.md"), "utf8");
      expect(agent, id).toContain("## Handoff");
      expect(agent, id).toContain(payloadPointer);
      expect(agent, id).toContain("```text");
      expect(agent, id).toContain(qaPrompt);
      expect(agent, id).toContain("Launch the next specialist");
      expect(agent, id).not.toContain("ask @qa next");
      // Only the gate prompt is inlined; the rest are referenced so they cannot drift.
      expect(agent, id).not.toContain(catalog.spawnPayloads.security);
      expect(agent, id).not.toContain(catalog.spawnPayloads.design);
    }
    const qa = readFileSync(join(process.cwd(), "agents/qa/agent.md"), "utf8");
    expect(qa).toContain("## Handoff");
    expect(qa).toContain(payloadPointer);
    expect(qa).toContain("On **reject**");
    expect(qa).toContain("On **accept**, stop.");
  });

  it("every agent file points at the full catalog", () => {
    const files = agentFiles();
    expect(files.length).toBeGreaterThanOrEqual(10);
    for (const file of files) {
      const body = readFileSync(file, "utf8");
      expect(body, file).toContain(catalogPointer);
    }
  });

  it("init copies the catalog pointer onto Cursor agents", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-catalog-"));
    roots.push(root);
    initProject({ cwd: root });
    const catalog = loadCatalog();
    for (const id of catalog.defaultAgents) {
      const body = readFileSync(join(root, `.cursor/agents/${id}.md`), "utf8");
      expect(body, id).toContain(catalogPointer);
    }
    const planner = readFileSync(join(root, ".cursor/agents/planner.md"), "utf8");
    expect(planner).toMatch(/`planning`/);
    expect(planner).toContain("Launch the owner");
    expect(planner).not.toContain("You do not run the other agents.");
    for (const id of ["app-engineer", "design", "copy", "security"]) {
      expect(readFileSync(join(root, `.cursor/agents/${id}.md`), "utf8"), id).toContain(catalog.spawnPayloads.qa);
    }
    expect(readFileSync(join(root, ".cursor/agents/qa.md"), "utf8")).toContain(payloadPointer);
  });
});
