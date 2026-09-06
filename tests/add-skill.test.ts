import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { addAgent } from "../src/install/add-agent.js";
import { addSkill, listSkills } from "../src/install/add-skill.js";
import { initProject } from "../src/install/install.js";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function temp(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-add-"));
  roots.push(root);
  return root;
}

describe("add skill and agent", () => {
  it("lists catalog skills", () => {
    expect(listSkills()).toContain("browser-qa");
    expect(listSkills()).toContain("debug");
  });

  it("adds an optional skill", () => {
    const root = temp();
    initProject({ cwd: root });
    const result = addSkill(root, "debug");
    expect(result.action).toBe("created");
    expect(existsSync(join(root, ".cursor/skills/debug/SKILL.md"))).toBe(true);
  });

  it("adds an optional agent", () => {
    const root = temp();
    initProject({ cwd: root });
    const result = addAgent(root, "lead-architect");
    expect(["created", "unchanged"]).toContain(result.action);
    expect(existsSync(join(root, ".cursor/agents/lead-architect.md"))).toBe(true);
  });

  it("rejects unknown skills", () => {
    expect(() => addSkill(temp(), "not-a-skill")).toThrow(/Unknown skill/);
  });
});
