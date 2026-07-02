import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { addSkill, listSkills } from "../src/install/add-skill.js";

let tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots) rmSync(root, { recursive: true, force: true });
  tempRoots = [];
});

function makeTempProject(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-skill-"));
  tempRoots.push(root);
  return root;
}

describe("addSkill", () => {
  it("rejects path-like skill names", () => {
    expect(() => addSkill(process.cwd(), "../secret")).toThrow(/Skill names/);
  });

  it("rejects unknown skills and lists what is available", () => {
    expect(() => addSkill(makeTempProject(), "does-not-exist")).toThrow(/Available skills/);
  });

  it("creates a known skill and reports unchanged on repeat", () => {
    const root = makeTempProject();
    const skillName = listSkills()[0]!.replace(/\.md$/, "");

    const first = addSkill(root, skillName);
    expect(first.action).toBe("created");
    expect(existsSync(join(root, first.target))).toBe(true);

    const second = addSkill(root, skillName);
    expect(second.action).toBe("unchanged");
  });

  it("previews without writing when dryRun is set", () => {
    const root = makeTempProject();
    const skillName = listSkills()[0]!.replace(/\.md$/, "");

    const preview = addSkill(root, skillName, { dryRun: true });
    expect(preview.action).toBe("created");
    expect(preview.dryRun).toBe(true);
    expect(existsSync(join(root, preview.target))).toBe(false);
  });

  it("reports conflicts for customized skills and overwrites with force", () => {
    const root = makeTempProject();
    const skillName = listSkills()[0]!.replace(/\.md$/, "");
    const installed = addSkill(root, skillName);
    writeFileSync(join(root, installed.target), "Customized skill content.\n");

    const conflictPreview = addSkill(root, skillName, { dryRun: true });
    expect(conflictPreview.action).toBe("conflict");

    const forced = addSkill(root, skillName, { force: true });
    expect(forced.action).toBe("overwritten");
  });
});
