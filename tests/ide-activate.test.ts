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
    expect(readFileSync(join(root, ".github/copilot-instructions.md"), "utf8")).toContain("Do not review user-visible work from code alone");
    expect(existsSync(join(root, ".antigravity/agent-kit/commands/browser-qa.toml"))).toBe(true);
    expect(readFileSync(join(root, ".antigravity/agent-kit/commands/browser-qa.toml"), "utf8")).toContain("accessibility-wcag");
    expect(readFileSync(join(root, ".antigravity/runtime-skills/accessibility-wcag/SKILL.md"), "utf8")).toContain("Contrast looks fine in the screenshot");
    expect(readFileSync(join(root, ".antigravity/agent-kit/commands/frontend.toml"), "utf8")).toContain("Name the mode (setup, build, review, or detect)");
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
