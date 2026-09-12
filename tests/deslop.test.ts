import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadCatalog } from "../src/catalog.js";
import { listSkills } from "../src/install/add-skill.js";
import { initProject } from "../src/install/install.js";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function temp(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-deslop-"));
  roots.push(root);
  return root;
}

describe("deslop last and frontend-design install", () => {
  it("catalog lists deslop after product-copy", () => {
    const catalog = loadCatalog();
    const skills = catalog.defaultSkills;
    expect(skills).toContain("deslop");
    expect(skills.indexOf("deslop")).toBeGreaterThan(skills.indexOf("product-copy"));
    expect(skills.indexOf("deslop")).toBeLessThan(skills.indexOf("ship"));
    expect(listSkills()).toContain("deslop");
  });

  it("Copy agent ends with deslop", () => {
    const copy = readFileSync(join(process.cwd(), "agents/copy/agent.md"), "utf8");
    expect(copy).toMatch(/`deslop` last/i);
    expect(copy).toContain("If you skip step 3, the work is not done.");
    const productCopy = readFileSync(join(process.cwd(), "skills/product-copy/SKILL.md"), "utf8");
    expect(productCopy).toContain("runs `deslop` as the last pass");
  });

  it("init installs deslop and the uplifted frontend-design skill", () => {
    const root = temp();
    initProject({ cwd: root, activate: ["all"] });

    expect(existsSync(join(root, ".cursor/skills/deslop/SKILL.md"))).toBe(true);
    expect(existsSync(join(root, "skills/deslop/SKILL.md"))).toBe(true);
    expect(existsSync(join(root, ".antigravity/runtime-skills/deslop/SKILL.md"))).toBe(true);

    const copy = readFileSync(join(root, ".cursor/agents/copy.md"), "utf8");
    expect(copy).toMatch(/`deslop` last/i);

    const antigravityCopy = readFileSync(join(root, ".antigravity/agent-kit/commands/copy.toml"), "utf8");
    expect(antigravityCopy).toMatch(/deslop last/i);

    const frontend = readFileSync(join(root, ".cursor/skills/frontend-design/SKILL.md"), "utf8");
    expect(frontend).toContain("#10100e");
    expect(frontend).toContain("One field, one ink, one accent, one line");
    expect(frontend).toContain("Do not mark selection or severity with a left edge stroke");
    expect(frontend).toContain("| `setup` |");
    expect(frontend).toContain("| `build` |");
    expect(frontend).toContain("| `detect` |");
    expect(frontend).toContain("inside-design-system");
    expect(frontend).toContain("a **short** product `DESIGN.md`");
    expect(frontend).not.toContain("newsprint paper");

    const deslop = readFileSync(join(root, ".cursor/skills/deslop/SKILL.md"), "utf8");
    expect(deslop).toContain("Left accent bars");
    expect(deslop).toContain("pick-list row");
    expect(deslop).toContain("border-left");
  });
});
