import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ROOT_DOCS } from "../src/config/defaults.js";
import { createAuditReport, auditProject } from "../src/install/audit.js";
import { initProject } from "../src/install/install.js";
import { sha256 } from "../src/utils/fs.js";

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
        libraryFolders: [],
        templateHashes: Object.fromEntries(ROOT_DOCS.map((doc) => [doc, sha256(`${doc}\n`)]))
      })
    );

    for (const doc of ROOT_DOCS) {
      writeFileSync(join(root, doc), `${doc}\n`);
    }
    writeFileSync(join(root, "SECURITY.md"), "OWASP Top 10\nRLS\nservice-role\n");
    writeFileSync(
      join(root, "STYLE_GUIDE.md"),
      "generic AI\nDesign token\nColor\nTypography\nSpacing\nRadius\nLoading\nEmpty\nError\nDisabled\nSuccess\nMobile\nLanding page\nWorking app\nTask-first\n"
    );
    writeFileSync(join(root, "TESTING.md"), "Playwright smoke\n");
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("passes a project with required docs and security language", () => {
    const findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "fail")).toBe(false);
  });

  it("returns machine-readable report summaries", () => {
    const report = createAuditReport(root);
    expect(report.summary.fail).toBe(0);
    expect(report.findings.length).toBeGreaterThan(0);
  });

  it("records template hashes during install", () => {
    const target = mkdtempSync(join(tmpdir(), "agent-kit-init-"));
    initProject({ cwd: target });
    const manifest = JSON.parse(readFileSync(join(target, ".agent-kit", "manifest.json"), "utf8")) as {
      templateHashes?: Record<string, string>;
    };
    expect(manifest.templateHashes?.["AGENTS.md"]).toMatch(/^[a-f0-9]{64}$/);
    rmSync(target, { recursive: true, force: true });
  });

  it("warns when a doc still matches an older installed template hash", () => {
    const target = mkdtempSync(join(tmpdir(), "agent-kit-stale-"));
    initProject({ cwd: target });

    const manifestPath = join(target, ".agent-kit", "manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      templateHashes: Record<string, string>;
    };
    writeFileSync(join(target, "AGENTS.md"), "old template\n");
    manifest.templateHashes["AGENTS.md"] = sha256("old template\n");
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const findings = auditProject(target);
    expect(findings.some((finding) => finding.area === "templates" && finding.message.includes("older installed template"))).toBe(true);
    rmSync(target, { recursive: true, force: true });
  });
});
