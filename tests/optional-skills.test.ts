import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { addAgent } from "../src/install/add-agent.js";
import { addSkill } from "../src/install/add-skill.js";
import { initProject } from "../src/install/install.js";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function temp(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-optional-"));
  roots.push(root);
  return root;
}

function readOptionalSkill(id: string): string {
  return readFileSync(join(process.cwd(), "skills", "optional", id, "SKILL.md"), "utf8");
}

describe("optional skill playbooks", () => {
  it("debug requires repro, rejects stack-trace-only guesses, and stays off init", () => {
    const skill = readOptionalSkill("debug");
    expect(skill).toContain("## Use when");
    expect(skill).toContain("## Reject");
    expect(skill).toContain("## Done when");
    expect(skill).toContain("stack trace");
    expect(skill).toContain("browser-qa");
    expect(skill).toContain("agent-kit add skill debug");
    expect(skill).toContain("not installed by `init`");
    expect(skill).toContain("Fixed in code");

    const root = temp();
    initProject({ cwd: root, activate: ["cursor"] });
    expect(existsSync(join(root, ".cursor/skills/debug/SKILL.md"))).toBe(false);

    const result = addSkill(root, "debug");
    expect(result.action).toBe("created");
    const installed = readFileSync(join(root, ".cursor/skills/debug/SKILL.md"), "utf8");
    expect(installed).toContain("Guessing from the stack trace alone");
    expect(installed).toContain("## Done when");
  });

  it("docs updates only moved files, rejects the 17-doc OS, and stays off init", () => {
    const skill = readOptionalSkill("docs");
    expect(skill).toContain("## Use when");
    expect(skill).toContain("## Reject");
    expect(skill).toContain("## Done when");
    expect(skill).toContain("USER_GUIDE");
    expect(skill).toContain("CHANGELOG");
    expect(skill).toContain("17-doc OS");
    expect(skill).toContain("QUALITY_GATES.md");
    expect(skill).toContain("COUNCIL.md");
    expect(skill).toContain("agent-kit add skill docs");

    const agent = readFileSync(join(process.cwd(), "agents/optional/docs/agent.md"), "utf8");
    expect(agent).toContain("`docs` (optional)");
    expect(agent).toContain("17-doc OS");

    const root = temp();
    initProject({ cwd: root, activate: ["cursor"] });
    expect(existsSync(join(root, ".cursor/skills/docs/SKILL.md"))).toBe(false);
    expect(existsSync(join(root, ".cursor/agents/docs.md"))).toBe(false);

    const skillResult = addSkill(root, "docs");
    expect(skillResult.action).toBe("created");
    const installed = readFileSync(join(root, ".cursor/skills/docs/SKILL.md"), "utf8");
    expect(installed).toContain("Restoring `QUALITY_GATES.md`");
    expect(installed).toContain("## Done when");

    const agentResult = addAgent(root, "docs");
    expect(["created", "unchanged"]).toContain(agentResult.action);
    expect(readFileSync(join(root, ".cursor/agents/docs.md"), "utf8")).toContain("17-doc OS");
  });

  it("upgrade requires agent-kit update, rejects init --force, and stays off init", () => {
    const skill = readOptionalSkill("upgrade");
    expect(skill).toContain("## Use when");
    expect(skill).toContain("## Reject");
    expect(skill).toContain("## Done when");
    expect(skill).toContain("UPGRADE.md");
    expect(skill).toContain("agent-kit update");
    expect(skill).toContain("init --force");
    expect(skill).toContain("agent-kit add skill upgrade");
    expect(skill).toContain("Never delete user files");

    const root = temp();
    initProject({ cwd: root, activate: ["cursor"] });
    expect(existsSync(join(root, ".cursor/skills/upgrade/SKILL.md"))).toBe(false);

    const result = addSkill(root, "upgrade");
    expect(result.action).toBe("created");
    const installed = readFileSync(join(root, ".cursor/skills/upgrade/SKILL.md"), "utf8");
    expect(installed).toContain("`init --force` (or re-init) as the upgrade path");
    expect(installed).toContain("## Done when");
  });

  it("ui-polish runs after frontend-design, rejects a second design system, and stays off init", () => {
    const skill = readOptionalSkill("ui-polish");
    expect(skill).toContain("## Use when");
    expect(skill).toContain("## Reject");
    expect(skill).toContain("## Done when");
    expect(skill).toContain("frontend-design");
    expect(skill).toContain("DESIGN.md");
    expect(skill).toContain("setup");
    expect(skill).toContain("browser-qa");
    expect(skill).toContain("inside-design-system");
    expect(skill).toContain("agent-kit add skill ui-polish");
    expect(skill).toContain("second design system");

    const design = readFileSync(join(process.cwd(), "agents/design/agent.md"), "utf8");
    expect(design).toContain("Optional `ui-polish`");
    expect(design).not.toMatch(/^`frontend-design`, `accessibility-wcag`, `browser-qa`, `ui-polish`/m);

    const root = temp();
    initProject({ cwd: root, activate: ["cursor"] });
    expect(existsSync(join(root, ".cursor/skills/ui-polish/SKILL.md"))).toBe(false);

    const result = addSkill(root, "ui-polish");
    expect(result.action).toBe("created");
    const installed = readFileSync(join(root, ".cursor/skills/ui-polish/SKILL.md"), "utf8");
    expect(installed).toContain("Using polish as a second design system");
    expect(installed).toContain("One viewport only");
    expect(installed).toContain("## Done when");
  });
});
