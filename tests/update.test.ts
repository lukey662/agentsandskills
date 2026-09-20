import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/install/install.js";
import { updateProject } from "../src/install/update.js";
import { sha256 } from "../src/utils/fs.js";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

describe("update", () => {
  it("keeps customized USER_GUIDE.md as a conflict when the template would change", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-update-"));
    roots.push(root);
    initProject({ cwd: root });
    writeFileSync(join(root, "USER_GUIDE.md"), "# Local guide\nDo not review code alone.\n");
    const result = updateProject({ cwd: root });
    const guide = result.files.find((file) => file.target === "USER_GUIDE.md");
    expect(guide?.action === "conflict" || guide?.action === "kept-local" || guide?.action === "unchanged").toBe(true);
    expect(readFileSync(join(root, "USER_GUIDE.md"), "utf8")).toContain("Local guide");
  });

  it("falls back to init when no manifest exists", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-update-init-"));
    roots.push(root);
    const result = updateProject({ cwd: root });
    expect(result.files.some((file) => file.target === "AGENTS.md")).toBe(true);
  });

  it("refreshes generated IDE agents on update", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-update-refresh-"));
    roots.push(root);
    initProject({ cwd: root, activate: ["cursor"] });
    writeFileSync(join(root, ".cursor/agents/qa.md"), "# stale\n");
    updateProject({ cwd: root, force: true });
    expect(readFileSync(join(root, ".cursor/agents/qa.md"), "utf8")).toContain("Do not review");
    expect(existsSync(join(root, ".agents/skills/browser-qa/SKILL.md"))).toBe(true);
  });

  it("updates pristine generated IDE agents without --force when template changes", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-update-hash-"));
    roots.push(root);
    initProject({ cwd: root, activate: ["cursor"] });

    // Simulate an older pristine 0.4 file whose hash was recorded in manifest.assetHashes
    const olderPristineContent = "---\nname: qa\ntools: [repo, browser]\n---\n# Older QA\n";
    writeFileSync(join(root, ".cursor/agents/qa.md"), olderPristineContent);

    const manifestPath = join(root, ".agent-kit", "manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    manifest.assetHashes[".cursor/agents/qa.md"] = sha256(olderPristineContent);
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    // Run update without --force
    const result = updateProject({ cwd: root, force: false });

    // The file should be updated cleanly without conflict
    const qaResult = result.files.find((file) => file.target === ".cursor/agents/qa.md");
    expect(qaResult?.action).toBe("updated");
    expect(result.summary.conflict).toBe(0);
    expect(readFileSync(join(root, ".cursor/agents/qa.md"), "utf8")).toContain("Do not review");
  });

  it("treats customized generated agent as a conflict when hash does not match install hash", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-update-custom-"));
    roots.push(root);
    initProject({ cwd: root, activate: ["cursor"] });

    // Local customization: content doesn't match recorded hash and doesn't match package render
    writeFileSync(join(root, ".cursor/agents/qa.md"), "# Local customized QA agent\n");

    const result = updateProject({ cwd: root, force: false });
    const qaResult = result.files.find((file) => file.target === ".cursor/agents/qa.md");
    expect(qaResult?.action).toBe("conflict");
    expect(result.summary.conflict).toBeGreaterThanOrEqual(1);
    expect(readFileSync(join(root, ".cursor/agents/qa.md"), "utf8")).toBe("# Local customized QA agent\n");
    expect(qaResult?.conflictPath).toBeDefined();
    expect(existsSync(join(root, qaResult!.conflictPath!))).toBe(true);

    // Overwrites when force is true
    const forceResult = updateProject({ cwd: root, force: true });
    const forceQa = forceResult.files.find((file) => file.target === ".cursor/agents/qa.md");
    expect(forceQa?.action).toBe("overwritten");
    expect(readFileSync(join(root, ".cursor/agents/qa.md"), "utf8")).toContain("Do not review");
  });

  it("populates prunePlan even when pruneLegacy is false", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-update-prune-advisory-"));
    roots.push(root);
    initProject({ cwd: root });
    writeFileSync(join(root, "COUNCIL.md"), "# leftover\n");

    const result = updateProject({ cwd: root, pruneLegacy: false });
    expect(result.prunePlan.some((entry) => entry.path === "COUNCIL.md")).toBe(true);
    expect(result.pruned).toEqual([]);
    expect(existsSync(join(root, "COUNCIL.md"))).toBe(true);
  });
});
