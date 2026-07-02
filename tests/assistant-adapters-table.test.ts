import { describe, expect, it } from "vitest";
import { assistantAdapterRowIsActive, extractAssistantAdapterRow } from "../src/install/assistant-adapters-table.js";

const SAMPLE_TABLE = `
| Tool | Surface | Instruction status | Model status | Enforcement | Notes | Delegation |
| --- | --- | --- | --- | --- | --- | --- |
| Cursor | \`.cursor/rules/*.mdc\` | Active on init | Advisory | Partial | verify | delegate |
| Codex / AGENTS.md-compatible tools | \`AGENTS.md\` | TBD | TBD | TBD | pending | n/a |
| Claude Code | \`.claude/agents/*.md\` | Active | Partial | Partial | ok | delegate |
`;

describe("assistant adapter table parsing", () => {
  it("extracts a full row by tool label", () => {
    const row = extractAssistantAdapterRow(SAMPLE_TABLE, "Cursor");
    expect(row).toContain("Active on init");
    expect(row).toContain("`.cursor/rules/*.mdc`");
  });

  it("detects Active instruction status across table columns", () => {
    expect(assistantAdapterRowIsActive(SAMPLE_TABLE, "Cursor")).toBe(true);
    expect(assistantAdapterRowIsActive(SAMPLE_TABLE, "Claude Code")).toBe(true);
  });

  it("does not treat TBD rows as Active", () => {
    expect(assistantAdapterRowIsActive(SAMPLE_TABLE, "Codex / AGENTS.md-compatible tools")).toBe(false);
  });

  it("returns false for missing tool rows", () => {
    expect(assistantAdapterRowIsActive(SAMPLE_TABLE, "GitHub Copilot / VS Code")).toBe(false);
  });
});
