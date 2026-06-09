import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initProject } from "../src/install/install.js";
import { applySessionCheckpoint, checkpointSessionFromFile } from "../src/studio/session-checkpoint.js";
import { getActiveSessionId, startSession } from "../src/studio/session.js";

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "agent-kit-checkpoint-"));
  initProject({ cwd: root });
  startSession(root, { title: "frontend-change", workflowId: "frontend-change" });
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("session checkpoint", () => {
  it("applies a JSON checkpoint in one call", () => {
    const result = applySessionCheckpoint(root, {
      notes: [{ agent: "planner", text: "Scoped UI work." }],
      decisions: [{ agent: "frontend-design-lead", text: "Use card layout.", risk: "low" }],
      handoffs: [
        {
          fromAgentId: "planner",
          toAgentId: "frontend-design-lead",
          decision: "Route to design lead",
          risk: "medium"
        }
      ],
      outputs: [
        { name: "creative-direction rationale", status: "complete", evidence: "DESIGN.md updated" },
        { name: "visual QA evidence", status: "partial" }
      ],
      verifications: [{ command: "npm test", result: "pass" }],
      render: true
    });

    expect(result.applied.notes).toBe(1);
    expect(result.applied.handoffs).toBe(1);
    expect(result.applied.outputs).toBe(2);
    expect(result.rendered).toBe(true);
    expect(getActiveSessionId(root)).toBe(result.sessionId);
  });

  it("loads checkpoint files from disk", () => {
    const checkpointPath = join(root, ".agent-kit/checkpoint.json");
    writeFileSync(
      checkpointPath,
      JSON.stringify({
        notes: [{ agent: "qa-engineer", text: "Added smoke test." }],
        outputs: [{ name: "verification evidence", status: "complete" }]
      })
    );

    const result = checkpointSessionFromFile(root, ".agent-kit/checkpoint.json");
    expect(result.applied.notes).toBe(1);
    expect(result.applied.outputs).toBe(1);
  });
});
