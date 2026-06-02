import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ROOT_DOCS } from "../src/config/defaults.js";
import { auditProject } from "../src/install/audit.js";

let root: string;

describe("auditProject", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "agent-kit-audit-"));
    mkdirSync(join(root, ".agent-kit"), { recursive: true });
    writeFileSync(
      join(root, ".agent-kit", "manifest.json"),
      JSON.stringify({
        packageName: "@afg/next-supabase-agent-kit",
        packageVersion: "0.1.0",
        stack: "next-supabase",
        installedAt: new Date().toISOString(),
        docs: ROOT_DOCS,
        libraryFolders: []
      })
    );

    for (const doc of ROOT_DOCS) {
      writeFileSync(join(root, doc), `${doc}\n`);
    }
    writeFileSync(join(root, "SECURITY.md"), "OWASP Top 10\nRLS\nservice-role\n");
    writeFileSync(join(root, "STYLE_GUIDE.md"), "generic AI\nDesign token\n");
    writeFileSync(join(root, "TESTING.md"), "Playwright smoke\n");
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("passes a project with required docs and security language", () => {
    const findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "fail")).toBe(false);
  });
});
