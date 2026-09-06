import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDoctorReport } from "../src/install/doctor.js";
import { initProject } from "../src/install/install.js";
import { validateAdapter } from "../src/install/adapter-validate.js";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function temp(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-qa-"));
  roots.push(root);
  return root;
}

describe("QA screenshot fail-closed rule", () => {
  it("browser-qa and QA agents reject code-only review after init", () => {
    const root = temp();
    initProject({ cwd: root, activate: ["all"] });

    const skill = readFileSync(join(root, ".cursor/skills/browser-qa/SKILL.md"), "utf8");
    expect(skill).toContain("Do not review code alone");
    expect(skill).toContain("desktop");
    expect(skill).toContain("mobile");
    expect(skill).toContain("qa-evidence/");

    for (const path of [".cursor/agents/qa.md", ".claude/agents/qa.md"]) {
      const agent = readFileSync(join(root, path), "utf8");
      expect(agent).toMatch(/Do not review/);
    }

    const report = validateAdapter(root, "all");
    expect(report.summary.fail).toBe(0);
    expect(createDoctorReport(root).ok).toBe(true);
    expect(existsSync(join(root, "USER_GUIDE.html"))).toBe(true);
    expect(readFileSync(join(root, "USER_GUIDE.html"), "utf8")).toContain("Ask one specialist");
  });

  it("doctor fails if USER_GUIDE loses the screenshot rule", () => {
    const root = temp();
    initProject({ cwd: root });
    writeFileSync(join(root, "USER_GUIDE.md"), "# Empty guide\n");
    const report = createDoctorReport(root);
    expect(report.ok).toBe(false);
    expect(report.findings.some((finding) => finding.message.includes("screenshot"))).toBe(true);
  });

  it("records a sample UI evidence folder the way the user guide describes", () => {
    const root = temp();
    initProject({ cwd: root });
    const evidence = join(root, "qa-evidence", "2026-09-06-settings");
    mkdirSync(evidence, { recursive: true });
    writeFileSync(join(evidence, "desktop.png"), "fake-desktop");
    writeFileSync(join(evidence, "mobile.png"), "fake-mobile");
    writeFileSync(
      join(evidence, "notes.md"),
      ["route: /settings", "auth: signed-in member", "verdict: reject", "reason: reviewed pixels; CTA clipped on mobile."].join("\n")
    );
    const notes = readFileSync(join(evidence, "notes.md"), "utf8");
    expect(notes).toContain("verdict:");
    expect(notes).not.toMatch(/reviewed page\.tsx/i);
  });
});
