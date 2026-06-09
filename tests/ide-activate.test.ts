import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initProject } from "../src/install/install.js";
import { activateIdeTargets } from "../src/install/ide-activate.js";

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "agent-kit-ide-activate-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("activateIdeTargets", () => {
  it("generates Claude subagents and Copilot instructions on --activate all", () => {
    initProject({ cwd: root });
    const result = activateIdeTargets({ cwd: root, targets: ["claude", "copilot", "codex"] });

    expect(result.activated).toEqual(["claude", "copilot", "codex"]);
    expect(existsSync(join(root, ".claude/agents/planner.md"))).toBe(true);
    expect(existsSync(join(root, "CLAUDE.md"))).toBe(true);
    expect(existsSync(join(root, ".github/copilot-instructions.md"))).toBe(true);
    expect(existsSync(join(root, ".github/instructions/next-supabase.instructions.md"))).toBe(true);
    expect(existsSync(join(root, ".codex/config.toml"))).toBe(true);

    const planner = readFileSync(join(root, ".claude/agents/planner.md"), "utf8");
    expect(planner).toContain("name: planner");
    expect(planner).toContain("agent-briefs.md");

    const adapters = readFileSync(join(root, "ASSISTANT_ADAPTERS.md"), "utf8");
    expect(adapters).toContain("| Active |");
    expect(adapters).not.toContain("| TBD | TBD | Partial | TBD |");
  });

  it("installs CI template and project context on plain init", () => {
    const result = initProject({ cwd: root });
    expect(result.contextPath).toBe(".agent-kit/project-context.json");
    expect(existsSync(join(root, ".agent-kit/project-context.json"))).toBe(true);
    expect(existsSync(join(root, ".github/workflows/agent-kit-audit.yml"))).toBe(true);
    expect([...result.copied, ...result.unchanged]).toContain(".github/workflows/agent-kit-audit.yml");
  });

  it("wires init --activate through initProject", () => {
    const result = initProject({ cwd: root, activate: ["claude"] });
    expect(result.activation?.activated).toEqual(["claude"]);
    expect(existsSync(join(root, ".claude/agents/security-reviewer.md"))).toBe(true);
  });
});
