import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDoctorReport, listLegacyLeftovers } from "../src/install/doctor.js";
import { initProject } from "../src/install/install.js";
import { updateProject } from "../src/install/update.js";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function temp(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-legacy-"));
  roots.push(root);
  return root;
}

describe("legacy 0.3 leftovers", () => {
  it("doctor passes a fresh 0.4 init without a leftover warning", () => {
    const root = temp();
    initProject({ cwd: root });
    const report = createDoctorReport(root);
    expect(report.ok).toBe(true);
    expect(report.findings.some((finding) => finding.area === "legacy" && finding.level === "pass")).toBe(true);
    expect(listLegacyLeftovers(root)).toEqual([]);
  });

  it("doctor warns when 0.3 council files remain and still reports ok", () => {
    const root = temp();
    initProject({ cwd: root });
    writeFileSync(join(root, "QUALITY_GATES.md"), "# leftover\n");
    writeFileSync(join(root, "COUNCIL.md"), "# leftover\n");
    mkdirSync(join(root, ".agent-kit"), { recursive: true });
    writeFileSync(join(root, ".agent-kit/agent-roster.json"), "{}\n");

    const report = createDoctorReport(root);
    expect(report.ok).toBe(true);
    const warning = report.findings.find((finding) => finding.area === "legacy" && finding.level === "warn");
    expect(warning?.message).toContain("QUALITY_GATES.md");
    expect(warning?.message).toContain("COUNCIL.md");
    expect(warning?.message).toContain("update never deletes");
    expect(existsSync(join(root, "QUALITY_GATES.md"))).toBe(true);
  });

  it("update lists leftover docs and does not delete them", () => {
    const root = temp();
    initProject({ cwd: root });
    writeFileSync(join(root, "QUALITY_GATES.md"), "# leftover\n");
    const result = updateProject({ cwd: root });
    expect(result.leftoverDocs).toContain("QUALITY_GATES.md");
    expect(existsSync(join(root, "QUALITY_GATES.md"))).toBe(true);
  });
});
