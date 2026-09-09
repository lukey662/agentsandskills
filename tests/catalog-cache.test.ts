import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadCatalog, resetCatalogCache } from "../src/catalog.js";

let roots: string[] = [];

afterEach(() => {
  resetCatalogCache();
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function catalogRoot(defaultAgents: string[]): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-catalog-root-"));
  roots.push(root);
  writeFileSync(
    join(root, "catalog.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      defaultAgents,
      optionalAgents: [],
      defaultSkills: ["browser-qa"],
      optionalSkills: [],
      screenshotFailClosed: "Do not review code alone."
    })}\n`
  );
  return root;
}

describe("loadCatalog cache", () => {
  it("does not return another package root's catalog", () => {
    const first = catalogRoot(["planner"]);
    const second = catalogRoot(["qa", "copy"]);
    expect(loadCatalog(first).defaultAgents).toEqual(["planner"]);
    expect(loadCatalog(second).defaultAgents).toEqual(["qa", "copy"]);
    expect(loadCatalog(first).defaultAgents).toEqual(["planner"]);
  });
});
