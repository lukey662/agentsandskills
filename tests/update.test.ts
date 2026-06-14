import { existsSync, mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createAuditReport } from "../src/install/audit.js";
import { diffProject } from "../src/install/diff.js";
import { initProject } from "../src/install/install.js";

let tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots) rmSync(root, { recursive: true, force: true });
  tempRoots = [];
});

function writeOldInstall(root: string): void {
  mkdirSync(join(root, ".agent-kit"), { recursive: true });
  writeFileSync(
    join(root, ".agent-kit", "manifest.json"),
    `${JSON.stringify(
      {
        packageName: "@appsforgood/next-supabase-kit",
        packageVersion: "0.1.1",
        stack: "next-supabase",
        installedAt: "2026-06-02T00:00:00.000Z",
        docs: ["AGENTS.md", "SKILLS.md", "SPEC.md", "DECISIONS.md", "DOCS.md", "STYLE_GUIDE.md", "SECURITY.md", "TESTING.md", "DEPLOYMENT.md"],
        libraryFolders: ["agents", "skills", "prompts", "checklists", "design-adapters"]
      },
      null,
      2
    )}\n`
  );

  writeFileSync(join(root, "AGENTS.md"), "Project-specific existing agents.\n");
  writeFileSync(join(root, "SKILLS.md"), "Project-specific existing skills.\n");
  writeFileSync(join(root, "SPEC.md"), "Product summary\nCurrent architecture\nBehavioral contracts\n");
  writeFileSync(join(root, "DECISIONS.md"), "Existing project decisions.\n");
  writeFileSync(join(root, "DOCS.md"), "Existing setup and workflow docs.\n");
  writeFileSync(
    join(root, "STYLE_GUIDE.md"),
    [
      "generic AI",
      "DESIGN.md",
      "content-first",
      "creative direction",
      "Design token",
      "Color",
      "Typography",
      "Spacing",
      "Radius",
      "Loading",
      "Empty",
      "Error",
      "Disabled",
      "Success",
      "Mobile",
      "Landing page",
      "Working app",
      "Task-first"
    ].join("\n")
  );
  writeFileSync(join(root, "SECURITY.md"), "OWASP Top 10\nRLS\nservice-role\n");
  writeFileSync(join(root, "TESTING.md"), "Playwright smoke\nVisual QA\nscreenshot evidence\n");
  writeFileSync(join(root, "DEPLOYMENT.md"), "Production deployment, logs, monitoring, and rollback notes.\n");
}

describe("update older installs", () => {
  it("adds current baseline assets while preserving customized docs", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-old-install-"));
    tempRoots.push(root);
    writeOldInstall(root);

    const preview = diffProject(root);
    expect(preview.missing).toEqual(
      expect.arrayContaining(["AGENT_ROSTER.md", "ASSISTANT_ADAPTERS.md", "COUNCIL.md", "DESIGN.md", "MESSAGING.md", "MODEL_ROUTING.md", "QUALITY_GATES.md", "UPGRADE.md"])
    );
    expect(preview.changed).toEqual(expect.arrayContaining(["AGENTS.md", "SKILLS.md", "SPEC.md"]));
    expect(preview.agentRoster).toBe("missing");
    expect(preview.modelRouting).toBe("missing");
    expect(preview.libraryFolders.missing).toEqual(expect.arrayContaining(["assistant-adapters", "runtime-skills", "rosters", "schemas"]));
    expect(preview.preview.wouldCreate).toEqual(
      expect.arrayContaining(["DESIGN.md", "MESSAGING.md", "MODEL_ROUTING.md", "QUALITY_GATES.md", "UPGRADE.md", ".agent-kit/agent-roster.json", ".agent-kit/model-routing.json"])
    );
    expect(preview.preview.wouldWriteConflicts).toEqual(expect.arrayContaining(["AGENTS.md", "SKILLS.md", "SPEC.md"]));
    expect(preview.preview.wouldRefreshLibraryFolders).toEqual(expect.arrayContaining(["assistant-adapters", "runtime-skills", "schemas"]));
    expect(preview.preview.wouldCreateAgentRoster).toBe(true);
    expect(preview.preview.wouldWriteAgentRosterConflict).toBe(false);
    expect(preview.preview.wouldCreateModelRouting).toBe(true);
    expect(preview.preview.wouldWriteModelRoutingConflict).toBe(false);

    const result = initProject({ cwd: root });

    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toBe("Project-specific existing agents.\n");
    expect(result.conflicts.some((item) => item.replace(/\\/g, "/").startsWith("AGENTS.md -> .agent-kit/conflicts/"))).toBe(true);
    expect(readdirSync(join(root, ".agent-kit", "conflicts")).length).toBeGreaterThan(0);

    expect(result.copied).toContain("AGENT_ROSTER.md");
    expect(result.copied).toContain("ASSISTANT_ADAPTERS.md");
    expect(existsSync(join(root, ".cursor", "rules", "cursor-agent-kit.mdc"))).toBe(true);
    expect(existsSync(join(root, ".cursor", "rules", "cursor-model-selection.mdc"))).toBe(true);
    expect(result.copied).toContain("COUNCIL.md");
    expect(result.copied).toContain("DESIGN.md");
    expect(result.copied).toContain("MESSAGING.md");
    expect(result.copied).toContain("MODEL_ROUTING.md");
    expect(result.copied).toContain("QUALITY_GATES.md");
    expect(result.copied).toContain("UPGRADE.md");
    expect(result.copied).toContain(".agent-kit/agent-roster.json");
    expect(result.copied).toContain(".agent-kit/model-routing.json");

    expect(existsSync(join(root, ".agent-kit", "schemas", "agent-roster.schema.json"))).toBe(true);
    expect(existsSync(join(root, ".agent-kit", "schemas", "council-session.schema.json"))).toBe(true);
    expect(existsSync(join(root, ".agent-kit", "schemas", "audit-report.schema.json"))).toBe(true);
    expect(existsSync(join(root, ".agent-kit", "schemas", "model-routing.schema.json"))).toBe(true);
    expect(existsSync(join(root, ".agent-kit", "assistant-adapters", "README.md"))).toBe(true);
    expect(existsSync(join(root, ".agent-kit", "assistant-adapters", "model-selection", "codex-config.example.toml"))).toBe(true);
    expect(existsSync(join(root, ".agent-kit", "runtime-skills", "planning-council", "SKILL.md"))).toBe(true);
    expect(existsSync(join(root, ".agent-kit", "skills", "reference-led-design-critique.md"))).toBe(true);

    const manifest = JSON.parse(readFileSync(join(root, ".agent-kit", "manifest.json"), "utf8")) as {
      docs?: string[];
      libraryFolders?: string[];
      agentRoster?: string;
      modelRouting?: string;
      templateHashes?: Record<string, string>;
    };
    expect(manifest.docs).toContain("DESIGN.md");
    expect(manifest.docs).toContain("MESSAGING.md");
    expect(manifest.docs).toContain("MODEL_ROUTING.md");
    expect(manifest.docs).toContain("UPGRADE.md");
    expect(manifest.libraryFolders).toContain("assistant-adapters");
    expect(manifest.libraryFolders).toContain("runtime-skills");
    expect(manifest.libraryFolders).toContain("schemas");
    expect(manifest.agentRoster).toBe(".agent-kit/agent-roster.json");
    expect(manifest.modelRouting).toBe(".agent-kit/model-routing.json");
    expect(manifest.templateHashes?.["DESIGN.md"]).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.templateHashes?.["MESSAGING.md"]).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.templateHashes?.["MODEL_ROUTING.md"]).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.templateHashes?.["UPGRADE.md"]).toMatch(/^[a-f0-9]{64}$/);

    const report = createAuditReport(root);
    expect(report.summary.fail).toBe(0);
    expect(report.readiness.level).toBe("baseline-setup");
    expect(report.findings.some((finding) => finding.message.includes("Agent roster maps default agents to required skills"))).toBe(true);
    expect(report.findings.some((finding) => finding.message.includes("Frontend-change workflow requires content-first design, reference-led critique"))).toBe(true);

    const updatedPreview = diffProject(root);
    expect(updatedPreview.agentRoster).toBe("unchanged");
    expect(updatedPreview.modelRouting).toBe("unchanged");
    expect(updatedPreview.libraryFolders.missing).toEqual([]);
  });
});
