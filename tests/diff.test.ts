import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { diffProject } from "../src/install/diff.js";
import { initProject } from "../src/install/install.js";

let tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots) rmSync(root, { recursive: true, force: true });
  tempRoots = [];
});

describe("diffProject", () => {
  it("reports everything as missing for an empty project", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-diff-empty-"));
    tempRoots.push(root);

    const result = diffProject(root);
    expect(result.unchanged).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.missing.length).toBeGreaterThan(0);
    expect(result.agentRoster).toBe("missing");
    expect(result.modelRouting).toBe("missing");
    expect(result.preview.wouldCreateAgentRoster).toBe(true);
    expect(result.preview.wouldCreateModelRouting).toBe(true);
  });

  it("keeps customized roster and model routing when the package assets are unchanged", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-diff-changed-"));
    tempRoots.push(root);
    initProject({ cwd: root });

    writeFileSync(join(root, ".agent-kit", "agent-roster.json"), `${JSON.stringify({ schemaVersion: 1, custom: true }, null, 2)}\n`);
    writeFileSync(join(root, ".agent-kit", "model-routing.json"), `${JSON.stringify({ schemaVersion: 1, custom: true }, null, 2)}\n`);

    const result = diffProject(root);
    expect(result.agentRoster).toBe("changed");
    expect(result.modelRouting).toBe("changed");
    expect(result.preview.wouldWriteAgentRosterConflict).toBe(false);
    expect(result.preview.wouldWriteModelRoutingConflict).toBe(false);
    expect(result.preview.wouldWriteConflicts).toEqual([]);
    expect(result.libraryFolders.missing).toEqual([]);
  });
});
