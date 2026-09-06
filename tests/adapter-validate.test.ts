import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validateAdapter, validatePackage } from "../src/install/adapter-validate.js";
import { initProject } from "../src/install/install.js";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

describe("adapter validate", () => {
  it("passes after init --activate all", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-adapter-"));
    roots.push(root);
    initProject({ cwd: root, activate: ["all"] });
    const report = validateAdapter(root, "all");
    expect(report.summary.fail).toBe(0);
  });

  it("validates the source package", () => {
    const report = validatePackage();
    expect(report.summary.fail).toBe(0);
  });
});
