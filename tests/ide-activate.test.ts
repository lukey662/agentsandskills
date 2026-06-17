import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { validateAdapter } from "../src/install/adapter-validate.js";
import { initProject } from "../src/install/install.js";
import { activateIdeTargets } from "../src/install/ide-activate.js";
import { buildSubagentMarkdown, quoteYamlScalar } from "../src/install/roster-adapters.js";

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "agent-kit-ide-activate-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("activateIdeTargets", () => {
  it("generates Claude, Cursor, Codex, Copilot, and Antigravity assets on --activate all", () => {
    initProject({ cwd: root });
    const result = activateIdeTargets({ cwd: root, targets: ["all"] });

    expect(result.activated).toEqual(["cursor", "claude", "codex", "copilot", "antigravity"]);
    expect(existsSync(join(root, ".claude/agents/planner.md"))).toBe(true);
    expect(existsSync(join(root, ".cursor/agents/planner.md"))).toBe(true);
    expect(existsSync(join(root, ".cursor/agents/security-reviewer.md"))).toBe(true);
    expect(existsSync(join(root, ".cursor/skills/owasp-security-review/SKILL.md"))).toBe(true);
    expect(existsSync(join(root, ".cursor/rules/cursor-security.mdc"))).toBe(true);
    expect(existsSync(join(root, "CLAUDE.md"))).toBe(true);
    expect(existsSync(join(root, ".github/copilot-instructions.md"))).toBe(true);
    expect(existsSync(join(root, ".codex/config.toml"))).toBe(true);
    expect(existsSync(join(root, ".codex/agents/planner.toml"))).toBe(true);
    expect(existsSync(join(root, ".codex/agents/security-reviewer.toml"))).toBe(true);
    expect(existsSync(join(root, ".antigravity/agent-kit/plugin.json"))).toBe(true);

    const cursorPlanner = readFileSync(join(root, ".cursor/agents/planner.md"), "utf8");
    expect(cursorPlanner).toContain("Use proactively");

    const codexSecurity = readFileSync(join(root, ".codex/agents/security-reviewer.toml"), "utf8");
    expect(codexSecurity).toContain('model_reasoning_effort = "high"');

    expect(validateAdapter(root, "cursor").summary.fail).toBe(0);
    expect(validateAdapter(root, "codex").summary.fail).toBe(0);

    const validation = validateAdapter(root, "antigravity");
    expect(validation.summary.fail).toBe(0);
  });

  it("generates Cursor subagents and skills on --activate cursor", () => {
    initProject({ cwd: root });
    activateIdeTargets({ cwd: root, targets: ["cursor"] });
    expect(existsSync(join(root, ".cursor/agents/planner.md"))).toBe(true);
    expect(existsSync(join(root, ".cursor/skills/planning-council/SKILL.md"))).toBe(true);
  });

  it("generates Codex custom agents on --activate codex", () => {
    initProject({ cwd: root });
    activateIdeTargets({ cwd: root, targets: ["codex"] });
    expect(existsSync(join(root, ".codex/agents/planner.toml"))).toBe(true);
    expect(readFileSync(join(root, ".codex/config.toml"), "utf8")).toContain(".codex/agents/");
  });

  it("quotes YAML frontmatter for descriptions with punctuation", () => {
    const markdown = buildSubagentMarkdown(
      {
        id: "security-reviewer",
        name: "Security Reviewer",
        roleSummary: 'Review auth: RLS, secrets, and "release" risk.',
        file: ".agent-kit/agents/security-reviewer.md"
      },
      { proactive: true }
    );
    expect(markdown).toContain('description: "Review auth: RLS, secrets, and \\"release\\" risk.');
    expect(quoteYamlScalar("plain")).toBe('"plain"');
  });

  it("warns when Cursor is Active but planner subagent is missing", () => {
    initProject({ cwd: root });
    const report = validateAdapter(root, "cursor");
    expect(report.findings.some((finding) => finding.message.includes("Cursor is marked Active"))).toBe(true);
  });

  it("does not mutate an existing .codex/config.toml when activation conflicts", () => {
    initProject({ cwd: root });
    const configDir = join(root, ".codex");
    mkdirSync(configDir, { recursive: true });
    const configPath = join(configDir, "config.toml");
    const customConfig = 'model = "custom-model"\n';
    writeFileSync(configPath, customConfig, "utf8");

    const result = activateIdeTargets({ cwd: root, targets: ["codex"] });
    expect(readFileSync(configPath, "utf8")).toBe(customConfig);
    expect(result.conflicts.some((entry) => entry.startsWith(".codex/config.toml ->"))).toBe(true);
    expect(existsSync(join(root, ".codex/agents/planner.toml"))).toBe(true);
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

  it("wires init --activate antigravity through initProject", () => {
    const result = initProject({ cwd: root, activate: ["antigravity"] });
    expect(result.activation?.activated).toEqual(["antigravity"]);
    expect(existsSync(join(root, ".antigravity/agent-kit/plugin.json"))).toBe(true);
    expect(existsSync(join(root, ".antigravity/agent-kit/commands/security.toml"))).toBe(true);
    expect(existsSync(join(root, ".antigravity/runtime-skills/owasp-security-review/SKILL.md"))).toBe(true);
    expect(validateAdapter(root, "antigravity").summary.fail).toBe(0);
  });
});
