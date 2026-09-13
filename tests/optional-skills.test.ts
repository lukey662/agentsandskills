import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
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
});
