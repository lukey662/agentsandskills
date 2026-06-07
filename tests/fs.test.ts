import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { copyTextWithConflict, resolveInside } from "../src/utils/fs.js";

let tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots) rmSync(root, { recursive: true, force: true });
  tempRoots = [];
});

describe("resolveInside", () => {
  it("allows paths inside the root", () => {
    const projectRoot = resolve("/tmp/project");
    expect(resolveInside(projectRoot, "AGENTS.md")).toBe(resolve(projectRoot, "AGENTS.md"));
  });

  it("blocks traversal outside the root", () => {
    const projectRoot = resolve("/tmp/project");
    expect(() => resolveInside(projectRoot, "../secret")).toThrow(/Unsafe path/);
  });
});

describe("copyTextWithConflict", () => {
  it("writes conflicts instead of overwriting changed files", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-copy-"));
    tempRoots.push(root);
    const sourceDir = join(root, "source");
    const source = join(sourceDir, "AGENTS.md");
    mkdirSync(sourceDir, { recursive: true });
    writeFileSync(source, "template\n");
    writeFileSync(join(root, "AGENTS.md"), "local\n");

    const result = copyTextWithConflict(source, root, "AGENTS.md");

    expect(result.action).toBe("conflict");
    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toBe("local\n");
  });
});
