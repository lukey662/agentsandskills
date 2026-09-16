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
  it("Planner names planning and the session launches the owner", () => {
    const planner = readFileSync(join(process.cwd(), "agents/planner/agent.md"), "utf8");
    expect(planner).toMatch(/`planning`/);
    expect(planner).toContain("launch the owner");
    expect(planner).not.toContain("You do not run the other agents.");
    expect(planner).toContain(catalogPointer);
  });

  it("default specialists launch the next specialist with a USER_GUIDE spawn payload", () => {
    const qaPrompt =
      "Do not review code alone. Open the app, capture desktop and mobile screenshots, read the images, then give accept / accept-with-nits / reject.";
    const app = readFileSync(join(process.cwd(), "agents/app-engineer/agent.md"), "utf8");
    expect(app).toContain("## Handoff");
    expect(app).toContain("```text");
    expect(app).toContain("Act as the security agent. Review auth, RLS, IDOR, and secrets");
    expect(app).toContain(qaPrompt);
    expect(app).toContain("Launch the next specialist");
    expect(app).not.toContain("ask @qa next");
    const design = readFileSync(join(process.cwd(), "agents/design/agent.md"), "utf8");
    expect(design).toContain("## Handoff");
    expect(design).toContain("```text");
    expect(design).toContain("Act as the copy agent. Review the rendered words in screenshots");
    expect(design).toContain(qaPrompt);
    const copy = readFileSync(join(process.cwd(), "agents/copy/agent.md"), "utf8");
    expect(copy).toContain("## Handoff");
    expect(copy).toContain("```text");
    expect(copy).toContain("Act as design. Name the mode (setup, build, review, or detect)");
    expect(copy).toContain(qaPrompt);
    const security = readFileSync(join(process.cwd(), "agents/security/agent.md"), "utf8");
    expect(security).toContain("## Handoff");
    expect(security).toContain("```text");
    expect(security).toContain(qaPrompt);
    const qa = readFileSync(join(process.cwd(), "agents/qa/agent.md"), "utf8");
    expect(qa).toContain("## Handoff");
    expect(qa).toContain("```text");
    expect(qa).toContain("Implement the plan. Smoke the changed route in the browser before you hand off.");
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
    expect(readFileSync(join(root, ".cursor/agents/planner.md"), "utf8")).toContain("launch the owner");
    expect(readFileSync(join(root, ".cursor/agents/planner.md"), "utf8")).not.toContain("You do not run the other agents.");
    expect(readFileSync(join(root, ".cursor/agents/app-engineer.md"), "utf8")).toContain("Act as the security agent. Review auth, RLS, IDOR, and secrets");
    expect(readFileSync(join(root, ".cursor/agents/app-engineer.md"), "utf8")).toContain(
      "Do not review code alone. Open the app, capture desktop and mobile screenshots"
    );
    expect(readFileSync(join(root, ".cursor/agents/design.md"), "utf8")).toContain("Act as the copy agent. Review the rendered words in screenshots");
    expect(readFileSync(join(root, ".cursor/agents/copy.md"), "utf8")).toContain("Act as design. Name the mode (setup, build, review, or detect)");
    expect(readFileSync(join(root, ".cursor/agents/security.md"), "utf8")).toContain(
      "Do not review code alone. Open the app, capture desktop and mobile screenshots"
    );
    expect(readFileSync(join(root, ".cursor/agents/qa.md"), "utf8")).toContain(
      "Implement the plan. Smoke the changed route in the browser before you hand off."
    );
  });
});
