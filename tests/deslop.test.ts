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
    expect(copy).toContain("If you skip step 4, the work is not done.");
    const productCopy = readFileSync(join(process.cwd(), "skills/product-copy/SKILL.md"), "utf8");
    expect(productCopy).toContain("runs `deslop` as the last pass");
  });

  it("deslop owns words, frontend-design owns the visual fail list", () => {
    const deslop = readFileSync(join(process.cwd(), "skills/deslop/SKILL.md"), "utf8");
    const frontend = readFileSync(join(process.cwd(), "skills/frontend-design/SKILL.md"), "utf8");

    // Structural tells and the Reader test make deslop stricter than a word swap.
    expect(deslop).toContain("## Structure tells");
    expect(deslop).toContain("Fragment triads");
    expect(deslop).toContain("Reader test");
    expect(deslop).toContain("Allowance");
    expect(deslop).toContain("Claim sweep");
    // The visual list moved out. deslop only hands the screenshot to Design.
    expect(deslop).not.toContain("border-left");
    expect(deslop).not.toContain("Left accent bars");
    expect(deslop).toContain("hand the screenshot to Design");

    expect(frontend).toContain("## Fail list");
    expect(frontend).toContain("Left accent bars");
    expect(frontend).toContain("pick-list row");
    expect(frontend).toContain("border-left");
    expect(frontend).toContain("## Derive the direction");
    expect(frontend).toContain("examples of the method, not a menu");
  });

  it("init installs deslop and the product-neutral frontend-design skill", () => {
    const root = temp();
    initProject({ cwd: root, activate: ["all"] });

    expect(existsSync(join(root, ".agents/skills/deslop/SKILL.md"))).toBe(true);
    expect(existsSync(join(root, ".claude/skills/deslop/SKILL.md"))).toBe(true);

    const copy = readFileSync(join(root, ".cursor/agents/copy.md"), "utf8");
    expect(copy).toMatch(/`deslop` last/i);

    const frontend = readFileSync(join(root, ".agents/skills/frontend-design/SKILL.md"), "utf8");
    // The kit's own tokens live in this repo's DESIGN.md, not in the shipped skill.
    expect(frontend).not.toContain("#10100e");
    expect(frontend).not.toContain("kit-html");
    expect(frontend).toContain("One field, one ink, one accent, one line");
    expect(frontend).toContain("Do not mark selection or severity with a left edge stroke");
    expect(frontend).toContain("| `setup` |");
    expect(frontend).toContain("| `build` |");
    expect(frontend).toContain("| `detect` |");
    expect(frontend).toContain("inside-design-system");
    expect(frontend).toContain("a **short** product `DESIGN.md`");
    expect(frontend).not.toContain("newsprint paper");

    const productCopy = readFileSync(join(root, ".agents/skills/product-copy/SKILL.md"), "utf8");
    expect(productCopy).toContain("Reader / Job / One action / Proof");
    expect(productCopy).not.toContain("USER_GUIDE");
  });

  it("this repo's DESIGN.md carries the kit tokens the skill no longer does", () => {
    const design = readFileSync(join(process.cwd(), "DESIGN.md"), "utf8");
    expect(design).toContain("#10100e");
    expect(design).toContain("#ff5a2a");
    expect(design).toContain("## Tokens");
    expect(design).toContain("## Anti-references");
  });
});
