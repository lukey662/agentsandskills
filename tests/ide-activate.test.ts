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
  it("writes Cursor agents, the rule, and .agents/skills by default", () => {
    initProject({ cwd: root });
    expect(existsSync(join(root, ".cursor/agents/planner.md"))).toBe(true);
    expect(existsSync(join(root, ".cursor/rules/cursor-agent-kit.mdc"))).toBe(true);
    expect(existsSync(join(root, ".agents/skills/browser-qa/SKILL.md"))).toBe(true);
    expect(readFileSync(join(root, ".cursor/agents/qa.md"), "utf8")).toContain("Do not review user-visible work from code alone");
    // 0.4 locations are gone.
    expect(existsSync(join(root, ".cursor/skills"))).toBe(false);
    expect(existsSync(join(root, "skills"))).toBe(false);
    expect(existsSync(join(root, ".antigravity"))).toBe(false);
  });

  it("activate all writes every host's native files", () => {
    initProject({ cwd: root, activate: ["all"] });
    expect(readFileSync(join(root, ".claude/agents/qa.md"), "utf8")).toContain("Do not review user-visible work from code alone");
    expect(existsSync(join(root, ".claude/skills/browser-qa/SKILL.md"))).toBe(true);
    expect(existsSync(join(root, "CLAUDE.md"))).toBe(true);
    expect(readFileSync(join(root, ".codex/agents/qa.toml"), "utf8")).toContain("Do not review");
    expect(existsSync(join(root, ".github/agents/qa.agent.md"))).toBe(true);
    expect(existsSync(join(root, ".agents/agents/qa/agent.md"))).toBe(true);
    expect(existsSync(join(root, ".agents/rules/agent-kit.md"))).toBe(true);

    const copilot = readFileSync(join(root, ".github/copilot-instructions.md"), "utf8");
    expect(copilot).toContain("Do not review user-visible work from code alone");
    expect(copilot).toContain("/agent <id>");
    expect(copilot).toContain("now Planner");
    expect(copilot).toContain("Plan this change. Name the owning agent, extra reviewers, and which screenshots QA must capture. Do not write code.");
    expect(copilot).toContain("Act as the security agent. Review auth, RLS, IDOR, and secrets");
    expect(copilot).toContain("Act as design. Name the mode (setup, build, review, or detect)");
    expect(copilot).toContain("Act as the copy agent. Review the rendered words in screenshots");
  });

  it("activate can add Claude after a Cursor-only init", () => {
    initProject({ cwd: root });
    const result = activateIdeTargets({ cwd: root, targets: ["claude"] });
    expect(result.activated).toEqual(["claude"]);
    expect(existsSync(join(root, ".claude/agents/qa.md"))).toBe(true);
    expect(existsSync(join(root, ".claude/skills/browser-qa/SKILL.md"))).toBe(true);
  });

  it("rejects unknown activate targets", () => {
    expect(() => parseActivateTargets(["not-an-ide"])).toThrow(InvalidActivateTargetError);
  });
});
