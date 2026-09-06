import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/install/install.js";
import { updateProject } from "../src/install/update.js";

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
});
