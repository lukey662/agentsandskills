import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { validateAdapter, validatePackage } from "../src/install/adapter-validate.js";
import { activateIdeTargets } from "../src/install/ide-activate.js";
import { initProject } from "../src/install/install.js";

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "agent-kit-adapter-validate-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("adapter validation", () => {
  it("validates source Antigravity assets", () => {
    const report = validateAdapter(process.cwd(), "antigravity");
    expect(report.summary.fail).toBe(0);
    expect(report.findings.some((finding) => finding.message.includes("native command set is complete"))).toBe(true);
    expect(report.findings.some((finding) => finding.message.includes("Runtime SKILL.md wrappers exist"))).toBe(true);
  });

  it("validates Antigravity assets in an initialized project", () => {
    initProject({ cwd: root, activate: ["antigravity"] });
    const report = validateAdapter(root, "antigravity");
    expect(report.summary.fail).toBe(0);
    expect(report.findings.some((finding) => finding.message.includes("plugin.json lists the required native commands"))).toBe(true);
  });

  it("validates source package runtime assets and package audit behavior", () => {
    const report = validatePackage(process.cwd());
    expect(report.summary.fail).toBe(0);
    expect(report.findings.some((finding) => finding.area === "audit" && finding.level === "pass")).toBe(true);
  });

  it("passes cursor validation after activation generates specialist assets", () => {
    initProject({ cwd: root });
    activateIdeTargets({ cwd: root, targets: ["cursor"] });
    const report = validateAdapter(root, "cursor");
    expect(report.summary.fail).toBe(0);
    expect(
      report.findings.some((finding) => finding.message.includes(".cursor/agents/planner.md is installed"))
    ).toBe(true);
    expect(report.findings.some((finding) => finding.message.includes("Cursor is marked Active but"))).toBe(false);
  });
});
