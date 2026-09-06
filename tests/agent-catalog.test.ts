import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadCatalog } from "../src/catalog.js";
import { initProject } from "../src/install/install.js";

const catalogPointer =
  "Available skills: `catalog.json` and the skill table in `USER_GUIDE.md`. Start with the skills named above. Use another listed skill when this job needs it.";

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
  it("Planner names planning and does not run other agents", () => {
    const planner = readFileSync(join(process.cwd(), "agents/planner/agent.md"), "utf8");
    expect(planner).toMatch(/`planning`/);
    expect(planner).toContain("You do not run the other agents.");
    expect(planner).toContain(catalogPointer);
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
    expect(readFileSync(join(root, ".cursor/agents/planner.md"), "utf8")).toMatch(/`planning`/);
  });
});
