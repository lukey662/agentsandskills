import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { incrementVersion, parseChangeset, synchronizeWorkspaceLock } from "../scripts/version-packages.mjs";

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("root and workspace version driver", () => {
  it("parses one-package changesets and normalizes their summary", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-changeset-"));
    roots.push(root);
    const path = join(root, "release.md");
    writeFileSync(path, '---\n"@appsforgood/next-supabase-kit": minor\n---\n\nShip the leading\n  harness.\n');

    expect(parseChangeset(path)).toMatchObject({
      releases: [{ name: "@appsforgood/next-supabase-kit", type: "minor" }],
      summary: "Ship the leading harness."
    });
  });

  it("rejects mixed-package changesets", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-changeset-"));
    roots.push(root);
    const path = join(root, "mixed.md");
    writeFileSync(path, '---\n"@appsforgood/next-supabase-kit": minor\n"@appsforgood/agent-kit-runtime": patch\n---\n\nMixed release.\n');

    expect(() => parseChangeset(path)).toThrow(/exactly one package/);
  });

  it("increments stable semantic versions deterministically", () => {
    expect(incrementVersion("0.1.9", "patch")).toBe("0.1.10");
    expect(incrementVersion("0.1.9", "minor")).toBe("0.2.0");
    expect(incrementVersion("0.1.9", "major")).toBe("1.0.0");
    expect(() => incrementVersion("0.2.0-beta.1", "patch")).toThrow(/Unsupported package version/);
  });

  it("synchronizes workspace versions into package-lock records", () => {
    const lock = {
      packages: {
        "": { name: "@appsforgood/next-supabase-kit", version: "0.2.0" },
        "node_modules/@appsforgood/agent-kit-runtime": { resolved: "packages/runtime", link: true },
        "packages/runtime": { name: "@appsforgood/agent-kit-runtime", version: "0.1.0" }
      }
    };

    synchronizeWorkspaceLock(lock, {
      "packages/runtime": { name: "@appsforgood/agent-kit-runtime", version: "0.1.1" }
    });

    expect(lock.packages["packages/runtime"].version).toBe("0.1.1");
    expect(lock.packages[""].version).toBe("0.2.0");
    expect(() =>
      synchronizeWorkspaceLock(lock, {
        "packages/missing": { name: "@appsforgood/missing", version: "1.0.0" }
      })
    ).toThrow(/missing workspace record/);
  });
});
