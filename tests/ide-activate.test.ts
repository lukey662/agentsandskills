import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initProject } from "../src/install/install.js";
import { activateIdeTargets, InvalidActivateTargetError, parseActivateTargets } from "../src/install/ide-activate.js";

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "agent-kit-ide-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("IDE activation", () => {
  it("writes Cursor agents and skills by default", () => {
    initProject({ cwd: root });
    expect(existsSync(join(root, ".cursor/agents/planner.md"))).toBe(true);
    expect(existsSync(join(root, ".cursor/skills/browser-qa/SKILL.md"))).toBe(true);
    expect(readFileSync(join(root, ".cursor/agents/qa.md"), "utf8")).toContain("Do not review user-visible work from code alone");
  });

  it("copies full agent content into Claude and Codex", () => {
    initProject({ cwd: root, activate: ["all"] });
    const cursor = readFileSync(join(root, ".cursor/agents/qa.md"), "utf8");
    const claude = readFileSync(join(root, ".claude/agents/qa.md"), "utf8");
    expect(claude).toContain("Do not review user-visible work from code alone");
    expect(cursor).toContain("requiredTools");
    expect(readFileSync(join(root, ".codex/agents/qa.toml"), "utf8")).toContain("Do not review");
    const copilot = readFileSync(join(root, ".github/copilot-instructions.md"), "utf8");
    expect(copilot).toContain("Do not review user-visible work from code alone");
    expect(copilot).toContain("Plan this change. Name the owning agent, extra reviewers, and which screenshots QA must capture. Do not write code.");
    expect(copilot).toContain("Implement the plan. Smoke the changed route in the browser before you hand off.");
    expect(copilot).toContain("Act as the security agent. Review auth, RLS, IDOR, and secrets");
    expect(copilot).toContain("Act as design. Name the mode (setup, build, review, or detect)");
    expect(copilot).toContain("Act as the copy agent. Review the rendered words in screenshots");
    expect(existsSync(join(root, ".antigravity/agent-kit/commands/browser-qa.toml"))).toBe(true);
    expect(readFileSync(join(root, ".antigravity/agent-kit/commands/browser-qa.toml"), "utf8")).toContain("accessibility-wcag");
    expect(readFileSync(join(root, ".antigravity/runtime-skills/accessibility-wcag/SKILL.md"), "utf8")).toContain("Contrast looks fine in the screenshot");
    expect(readFileSync(join(root, ".antigravity/agent-kit/commands/test.toml"), "utf8")).toContain("testing-qa");
    expect(readFileSync(join(root, ".antigravity/runtime-skills/testing-qa/SKILL.md"), "utf8")).toContain("Tests pass");
    expect(readFileSync(join(root, ".antigravity/agent-kit/commands/ship.toml"), "utf8")).toContain("LGTM, ship it");
    expect(readFileSync(join(root, ".antigravity/runtime-skills/ship/SKILL.md"), "utf8")).toContain("LGTM, ship it");
    expect(readFileSync(join(root, ".antigravity/agent-kit/commands/plan.toml"), "utf8")).toContain("fenced USER_GUIDE paste");
    expect(readFileSync(join(root, ".antigravity/agent-kit/commands/plan.toml"), "utf8")).toContain("Reject finishing without a paste");
    expect(readFileSync(join(root, ".antigravity/agent-kit/commands/plan.toml"), "utf8")).toContain("ask @qa next");
    expect(readFileSync(join(root, ".antigravity/agent-kit/commands/plan.toml"), "utf8")).not.toContain("QUALITY_GATES");
    const nativePlan = readFileSync(join(process.cwd(), "antigravity/commands/plan.toml"), "utf8");
    expect(nativePlan).toContain("skills/planning/SKILL.md");
    expect(nativePlan).toContain("finishing without a fenced paste");
    expect(nativePlan).toContain("ask @qa next");
    expect(nativePlan).not.toContain("QUALITY_GATES");
    expect(readFileSync(join(root, ".antigravity/agent-kit/commands/frontend.toml"), "utf8")).toContain("Name the mode (setup, build, review, or detect)");
    const nativePlugin = JSON.parse(readFileSync(join(process.cwd(), "antigravity/plugin.json"), "utf8")) as {
      commands: Array<{ name: string }>;
      skills: Array<{ name: string; path: string }>;
    };
    expect(nativePlugin.commands.some((item) => item.name === "ship")).toBe(true);
    expect(nativePlugin.skills.some((item) => item.name === "ship" && item.path === "../runtime-skills/ship/SKILL.md")).toBe(true);
  });

  it("activate can add Claude after a Cursor-only init", () => {
    initProject({ cwd: root });
    const result = activateIdeTargets({ cwd: root, targets: ["claude"] });
    expect(result.activated).toEqual(["claude"]);
    expect(existsSync(join(root, ".claude/agents/qa.md"))).toBe(true);
  });

  it("installs portable repo-root skills during init", () => {
    initProject({ cwd: root });
    expect(existsSync(join(root, "skills/browser-qa/SKILL.md"))).toBe(true);
  });

  it("rejects unknown activate targets", () => {
    expect(() => parseActivateTargets(["not-an-ide"])).toThrow(InvalidActivateTargetError);
  });
});
