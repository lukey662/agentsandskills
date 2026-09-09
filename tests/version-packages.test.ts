import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { applyRootChangelog, escapeRegExp, incrementVersion, parseChangeset, synchronizeWorkspaceLock } from "../scripts/version-packages.mjs";

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

  it("prepends a changelog section when the next version is not drafted", () => {
    const changelog = "# Changelog\n\n## 0.4.2\n\n- Previous.\n";
    expect(applyRootChangelog(changelog, "0.4.3", ["Ship the fix."])).toBe("# Changelog\n\n## 0.4.3\n\n- Ship the fix.\n\n## 0.4.2\n\n- Previous.\n");
  });

  it("keeps a drafted next-version section that already has bullets", () => {
    const changelog = "# Changelog\n\n## 0.4.3\n\n- Doctor fails closed.\n\n## 0.4.2\n\n- Previous.\n";
    expect(applyRootChangelog(changelog, "0.4.3", ["Fail closed on required screenshot tools."])).toBe(changelog);
  });

  it("fills an empty drafted next-version heading from changeset notes", () => {
    const changelog = "# Changelog\n\n## 0.4.3\n\n## 0.4.2\n\n- Previous.\n";
    expect(applyRootChangelog(changelog, "0.4.3", ["Ship the fix."])).toBe("# Changelog\n\n## 0.4.3\n\n- Ship the fix.\n\n## 0.4.2\n\n- Previous.\n");
  });

  it("rejects a changelog that does not start with the H1", () => {
    expect(() => applyRootChangelog("## 0.4.2\n", "0.4.3", ["Ship the fix."])).toThrow(/must start with '# Changelog'/);
  });

  it("escapes regex metacharacters including backslashes", () => {
    expect(escapeRegExp("0.4.3")).toBe("0\\.4\\.3");
    expect(escapeRegExp("a\\b")).toBe("a\\\\b");
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
