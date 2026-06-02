import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ROOT_DOCS } from "../src/config/defaults.js";
import { createAuditReport, auditProject } from "../src/install/audit.js";
import { initProject } from "../src/install/install.js";
import { sha256 } from "../src/utils/fs.js";

let root: string;

function writeDefaultRoster(targetRoot: string): void {
  copyFileSync(join(process.cwd(), "rosters", "next-supabase-default-council.json"), join(targetRoot, ".agent-kit", "agent-roster.json"));
}

describe("auditProject", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "agent-kit-audit-"));
    mkdirSync(join(root, ".agent-kit"), { recursive: true });
    writeFileSync(
      join(root, ".agent-kit", "manifest.json"),
      JSON.stringify({
        packageName: "@agent-skills/next-supabase-kit",
        packageVersion: "0.1.0",
        stack: "next-supabase",
        installedAt: new Date().toISOString(),
        docs: ROOT_DOCS,
        libraryFolders: ["agents", "skills", "prompts", "checklists", "design-adapters", "design-briefs", "profiles", "rosters"],
        agentRoster: ".agent-kit/agent-roster.json",
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
    writeDefaultRoster(root);
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
      agentRoster?: string;
      libraryFolders?: string[];
      templateHashes?: Record<string, string>;
    };
    expect(manifest.templateHashes?.["AGENTS.md"]).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.agentRoster).toBe(".agent-kit/agent-roster.json");
    expect(manifest.libraryFolders).toContain("rosters");
    expect(readFileSync(join(target, ".agent-kit", "agent-roster.json"), "utf8")).toContain('"defaultWorkflow": "planning"');
    rmSync(target, { recursive: true, force: true });
  });

  it("fails when the default agent roster is missing", () => {
    rmSync(join(root, ".agent-kit", "agent-roster.json"), { force: true });

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "fail" && finding.message.includes(".agent-kit/agent-roster.json is missing"))).toBe(true);
  });

  it("fails when core changes can bypass architect council", () => {
    const roster = JSON.parse(readFileSync(join(root, ".agent-kit", "agent-roster.json"), "utf8")) as {
      workflows: Array<{ id: string; sequence: string[]; council: string[] }>;
    };
    const coreChange = roster.workflows.find((workflow) => workflow.id === "core-change");
    if (!coreChange) throw new Error("Expected core-change workflow in fixture.");
    coreChange.sequence = coreChange.sequence.filter((agent) => agent !== "lead-architect");
    coreChange.council = coreChange.council.filter((agent) => agent !== "lead-architect");
    writeFileSync(join(root, ".agent-kit", "agent-roster.json"), `${JSON.stringify(roster, null, 2)}\n`);

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "fail" && finding.message.includes("Lead Architect council review"))).toBe(true);
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

  it("accepts documented local template overrides", () => {
    const target = mkdtempSync(join(tmpdir(), "agent-kit-override-"));
    initProject({ cwd: target });

    writeFileSync(join(target, "AGENTS.md"), "project-specific agents\n");
    writeFileSync(
      join(target, ".agent-kit", "overrides.json"),
      JSON.stringify(
        {
          templates: {
            "AGENTS.md": {
              reason: "Project has a mature existing agent roster.",
              reviewedAt: "2026-06-02"
            }
          }
        },
        null,
        2
      )
    );

    const findings = auditProject(target);
    expect(findings.some((finding) => finding.message === "AGENTS.md has a documented local override.")).toBe(true);
    expect(findings.some((finding) => finding.message.includes("AGENTS.md is locally customized"))).toBe(false);
    rmSync(target, { recursive: true, force: true });
  });
});
