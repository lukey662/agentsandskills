import { execFileSync } from "node:child_process";
import { copyFileSync, cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AuditReportContract } from "../src/config/contracts.js";
import { ROOT_DOCS } from "../src/config/defaults.js";
import { auditProject, createAuditReport, isAuditReadinessLevel, meetsMinimumReadiness } from "../src/install/audit.js";
import { auditReportToSarif, createAuditReportV2 } from "../src/install/audit-v2.js";
import { initProject } from "../src/install/install.js";
import { sha256 } from "../src/utils/fs.js";

let root: string;

function writeDefaultRoster(targetRoot: string): void {
  copyFileSync(join(process.cwd(), "rosters", "next-supabase-default-council.json"), join(targetRoot, ".agent-kit", "agent-roster.json"));
}

function writeDefaultModelRouting(targetRoot: string): void {
  copyFileSync(join(process.cwd(), "model-routing", "default-model-routing.json"), join(targetRoot, ".agent-kit", "model-routing.json"));
}

function writeDefaultOrchestrator(targetRoot: string): void {
  copyFileSync(join(process.cwd(), "templates", "next-supabase", ".agent-kit", "orchestrator.json"), join(targetRoot, ".agent-kit", "orchestrator.json"));
}

function writeDefaultSchemas(targetRoot: string): void {
  mkdirSync(join(targetRoot, ".agent-kit", "schemas"), { recursive: true });
  copyFileSync(join(process.cwd(), "schemas", "agent-roster.schema.json"), join(targetRoot, ".agent-kit", "schemas", "agent-roster.schema.json"));
  copyFileSync(join(process.cwd(), "schemas", "council-session.schema.json"), join(targetRoot, ".agent-kit", "schemas", "council-session.schema.json"));
  copyFileSync(join(process.cwd(), "schemas", "audit-report.schema.json"), join(targetRoot, ".agent-kit", "schemas", "audit-report.schema.json"));
  copyFileSync(join(process.cwd(), "schemas", "model-routing.schema.json"), join(targetRoot, ".agent-kit", "schemas", "model-routing.schema.json"));
  copyFileSync(join(process.cwd(), "schemas", "project-context.schema.json"), join(targetRoot, ".agent-kit", "schemas", "project-context.schema.json"));
  copyFileSync(join(process.cwd(), "schemas", "correction-rules.schema.json"), join(targetRoot, ".agent-kit", "schemas", "correction-rules.schema.json"));
  copyFileSync(join(process.cwd(), "schemas", "session-event.schema.json"), join(targetRoot, ".agent-kit", "schemas", "session-event.schema.json"));
  copyFileSync(join(process.cwd(), "schemas", "studio-session.schema.json"), join(targetRoot, ".agent-kit", "schemas", "studio-session.schema.json"));
}

describe("auditProject", () => {
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "agent-kit-audit-"));
    mkdirSync(join(root, ".agent-kit"), { recursive: true });
    writeFileSync(
      join(root, ".agent-kit", "manifest.json"),
      JSON.stringify({
        packageName: "@appsforgood/next-supabase-kit",
        packageVersion: "0.1.1",
        stack: "next-supabase",
        installedAt: new Date().toISOString(),
        docs: ROOT_DOCS,
        libraryFolders: [
          "agents",
          "skills",
          "prompts",
          "checklists",
          "runtime-skills",
          "design-adapters",
          "assistant-adapters",
          "design-briefs",
          "profiles",
          "rosters",
          "schemas"
        ],
        agentRoster: ".agent-kit/agent-roster.json",
        modelRouting: ".agent-kit/model-routing.json",
        templateHashes: Object.fromEntries(ROOT_DOCS.map((doc) => [doc, sha256(`${doc}\n`)]))
      })
    );

    for (const doc of ROOT_DOCS) {
      writeFileSync(join(root, doc), `${doc}\n`);
    }
    writeFileSync(join(root, "SECURITY.md"), "OWASP Top 10\nRLS\nservice-role\n");
    writeFileSync(
      join(root, "ASSISTANT_ADAPTERS.md"),
      "AGENTS.md\nagent-roster.json\nMODEL_ROUTING.md\nmodel-routing.json\nmodel selection\nenforcement\ncopilot-instructions\n.cursor/rules\n.claude/agents\nsource of truth\n"
    );
    writeFileSync(join(root, "MODEL_ROUTING.md"), "Model Routing\nAgent\nProfile\nCodex\nClaude Code\nCursor\nGitHub Copilot\nEnforcement\n");
    writeFileSync(join(root, "COUNCIL.md"), "Council session\nhandoff\ndecision\nrisk\nevidence\n");
    writeFileSync(
      join(root, "QUALITY_GATES.md"),
      "Baseline\nStrong\nBest-practice\nEvidence\nCouncil\nArchitecture\nSecurity\nSupabase\nMessaging\nFrontend\nAccessibility\nTesting\nRelease\nRepo health\n"
    );
    writeFileSync(
      join(root, "MESSAGING.md"),
      "Discovery questions\nAudience\nPain\nOutcome\nDifferentiator\nProof\nObjections\nVoice\nConversion\nClaim\nProof Required\nCurrent Proof\nObjection\nCTA\n"
    );
    writeFileSync(
      join(root, "DESIGN.md"),
      "Brand\nContent\nUser needs\nCreative direction\nDesign tokens\nReference set\nAnti-reference\nDistinctiveness\nCritique\nDistinctiveness benchmark\nFirst-screen proof\nContent fingerprint\nReference benchmark\nCreative divergence\nAsset provenance\nState proof\nVisual QA proof\nProduct quality scorecard\nUser/task fit\nContent specificity\nSource safety\nTotal score\n"
    );
    writeFileSync(
      join(root, "STYLE_GUIDE.md"),
      "generic AI\nDESIGN.md\ncontent-first\ncreative direction\nDesign token\nColor\nTypography\nSpacing\nRadius\nLoading\nEmpty\nError\nDisabled\nSuccess\nMobile\nLanding page\nWorking app\nTask-first\n"
    );
    writeFileSync(join(root, "TESTING.md"), "Playwright smoke\nVisual QA\nscreenshot evidence\n");
    writeFileSync(
      join(root, "UPGRADE.md"),
      "agent-kit diff\nagent-kit update\naudit --min-readiness\nrollback\nrelease notes\nNext.js\ncodemod\nSupabase\nmigration\ngenerated types\n"
    );
    writeDefaultRoster(root);
    writeDefaultModelRouting(root);
    writeDefaultOrchestrator(root);
    writeDefaultSchemas(root);
    mkdirSync(join(root, ".agent-kit", "assistant-adapters"), { recursive: true });

    const manifest = JSON.parse(readFileSync(join(root, ".agent-kit", "manifest.json"), "utf8")) as {
      templateHashes: Record<string, string>;
    };
    manifest.templateHashes = Object.fromEntries(ROOT_DOCS.map((doc) => [doc, sha256(readFileSync(join(root, doc), "utf8"))]));
    writeFileSync(join(root, ".agent-kit", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
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
    expect(report.readiness.level).toBe("needs-improvement");
    expect(AuditReportContract.safeParse(report).success).toBe(true);
    expect(report.findings.length).toBeGreaterThan(0);
  });

  it("emits versioned rule evidence, suppressions, and SARIF without changing v1", () => {
    const v1 = createAuditReport(root);
    const v2Before = createAuditReportV2(root);
    expect(Object.keys(v1).sort()).toEqual(["findings", "readiness", "summary"]);
    expect(v2Before.schemaVersion).toBe(2);
    expect(v2Before.findings.every((finding) => finding.ruleId && finding.ruleVersion && finding.confidence)).toBe(true);
    const suppressible = v2Before.findings.find((finding) => finding.level === "warn" || finding.level === "fail");
    expect(suppressible).toBeDefined();

    writeFileSync(
      join(root, ".agent-kit", "overrides.json"),
      `${JSON.stringify(
        {
          templates: {},
          auditRules: {
            [suppressible!.ruleId]: {
              reason: "Accepted for this fixture only.",
              owner: "qa",
              reviewedAt: "2026-07-11",
              expiresAt: "2099-01-01"
            }
          }
        },
        null,
        2
      )}\n`
    );
    const v2After = createAuditReportV2(root);
    expect(v2After.findings.find((finding) => finding.ruleId === suppressible!.ruleId)?.suppressed).toBe(true);
    expect(v2After.summary.suppressed).toBeGreaterThan(0);
    const sarif = auditReportToSarif(v2After);
    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0]?.tool.driver.rules.length).toBeGreaterThan(0);
  });

  it("does not require installed-project root docs when auditing the package source repository", () => {
    const packageRoot = mkdtempSync(join(tmpdir(), "agent-kit-package-source-audit-"));
    try {
      mkdirSync(join(packageRoot, "src", "cli"), { recursive: true });
      writeFileSync(
        join(packageRoot, "package.json"),
        JSON.stringify(
          {
            name: "@appsforgood/next-supabase-kit",
            scripts: { test: "vitest run" }
          },
          null,
          2
        )
      );
      writeFileSync(join(packageRoot, "src", "cli", "index.ts"), "export {};\n");
      cpSync(join(process.cwd(), "templates", "next-supabase"), join(packageRoot, "templates", "next-supabase"), { recursive: true });
      cpSync(join(process.cwd(), "rosters"), join(packageRoot, "rosters"), { recursive: true });
      cpSync(join(process.cwd(), "schemas"), join(packageRoot, "schemas"), { recursive: true });
      cpSync(join(process.cwd(), "model-routing"), join(packageRoot, "model-routing"), { recursive: true });
      cpSync(join(process.cwd(), "assistant-adapters"), join(packageRoot, "assistant-adapters"), { recursive: true });

      const report = createAuditReport(packageRoot);
      expect(report.summary.fail).toBe(0);
      expect(
        report.findings.some((finding) => finding.message === "Package source repository mode detected; installed-project manifest is not required.")
      ).toBe(true);
      expect(report.findings.some((finding) => finding.level === "fail" && finding.message === "AGENTS.md is missing.")).toBe(false);
      expect(report.findings.some((finding) => finding.message === "templates/next-supabase/AGENTS.md exists.")).toBe(true);
    } finally {
      rmSync(packageRoot, { recursive: true, force: true });
    }
  });

  it("keeps the committed example audit output contract-valid", () => {
    const example = JSON.parse(readFileSync(join(process.cwd(), "examples", "next-supabase-installed", "audit-output.json"), "utf8"));
    expect(AuditReportContract.safeParse(example).success).toBe(true);
  });

  it("reports needs-setup readiness when required contracts fail", () => {
    rmSync(join(root, ".agent-kit", "agent-roster.json"), { force: true });

    const report = createAuditReport(root);
    expect(report.readiness.level).toBe("needs-setup");
    expect(report.readiness.nextActions.length).toBeGreaterThan(0);
  });

  it("compares readiness levels for CI gates", () => {
    expect(isAuditReadinessLevel("baseline-setup")).toBe(true);
    expect(isAuditReadinessLevel("unknown")).toBe(false);
    expect(meetsMinimumReadiness("baseline-setup", "needs-setup")).toBe(true);
    expect(meetsMinimumReadiness("baseline-setup", "baseline-setup")).toBe(true);
    expect(meetsMinimumReadiness("baseline-setup", "needs-improvement")).toBe(false);
    expect(meetsMinimumReadiness("best-practice-candidate", "needs-improvement")).toBe(true);
  });

  it("records template hashes during install", () => {
    const target = mkdtempSync(join(tmpdir(), "agent-kit-init-"));
    initProject({ cwd: target });
    const manifest = JSON.parse(readFileSync(join(target, ".agent-kit", "manifest.json"), "utf8")) as {
      agentRoster?: string;
      modelRouting?: string;
      libraryFolders?: string[];
      templateHashes?: Record<string, string>;
    };
    expect(manifest.templateHashes?.["AGENTS.md"]).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.templateHashes?.["COUNCIL.md"]).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.templateHashes?.["UPGRADE.md"]).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.agentRoster).toBe(".agent-kit/agent-roster.json");
    expect(manifest.modelRouting).toBe(".agent-kit/model-routing.json");
    expect(manifest.libraryFolders).toContain("rosters");
    expect(manifest.libraryFolders).toContain("schemas");
    expect(manifest.libraryFolders).toContain("assistant-adapters");
    expect(manifest.libraryFolders).toContain("runtime-skills");
    expect(readFileSync(join(target, ".agent-kit", "agent-roster.json"), "utf8")).toContain('"defaultWorkflow": "planning"');
    expect(readFileSync(join(target, ".agent-kit", "model-routing.json"), "utf8")).toContain('"id": "next-supabase-default-model-routing"');
    expect(readFileSync(join(target, ".agent-kit", "assistant-adapters", "README.md"), "utf8")).toContain("Assistant Adapters");
    expect(readFileSync(join(target, ".agent-kit", "schemas", "agent-roster.schema.json"), "utf8")).toContain('"title": "Agent Kit Agent Roster"');
    expect(readFileSync(join(target, ".agent-kit", "schemas", "audit-report.schema.json"), "utf8")).toContain('"title": "Agent Kit Audit Report"');
    expect(readFileSync(join(target, ".agent-kit", "schemas", "model-routing.schema.json"), "utf8")).toContain('"title": "Agent Kit Model Routing"');
    expect(readFileSync(join(target, ".agent-kit", "schemas", "project-context.schema.json"), "utf8")).toContain('"title": "Agent Kit Project Context"');
    expect(readFileSync(join(target, ".agent-kit", "schemas", "session-event.schema.json"), "utf8")).toContain('"title": "Agent Kit Session Event"');
    rmSync(target, { recursive: true, force: true });
  });

  it("warns when schema-backed council contracts are missing", () => {
    rmSync(join(root, ".agent-kit", "schemas"), { recursive: true, force: true });

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "warn" && finding.message.includes(".agent-kit/schemas/agent-roster.schema.json is missing"))).toBe(
      true
    );
    expect(findings.some((finding) => finding.level === "warn" && finding.message.includes(".agent-kit/schemas/council-session.schema.json is missing"))).toBe(
      true
    );
    expect(findings.some((finding) => finding.level === "warn" && finding.message.includes(".agent-kit/schemas/model-routing.schema.json is missing"))).toBe(
      true
    );
  });

  it("warns when assistant adapter templates are missing", () => {
    rmSync(join(root, ".agent-kit", "assistant-adapters"), { recursive: true, force: true });

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "warn" && finding.message.includes(".agent-kit/assistant-adapters is missing"))).toBe(true);
  });

  it("warns when assistant adapter docs do not map tool-specific surfaces", () => {
    writeFileSync(join(root, "ASSISTANT_ADAPTERS.md"), "AGENTS.md only\n");

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "warn" && finding.message.includes("ASSISTANT_ADAPTERS.md does not map"))).toBe(true);
  });

  it("warns when model routing is missing or malformed", () => {
    rmSync(join(root, ".agent-kit", "model-routing.json"), { force: true });

    let findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "warn" && finding.message.includes(".agent-kit/model-routing.json is missing"))).toBe(true);

    writeFileSync(join(root, ".agent-kit", "model-routing.json"), JSON.stringify({ schemaVersion: 1 }, null, 2));
    findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "warn" && finding.message.includes("does not match the model-routing contract"))).toBe(true);
  });

  it("fails secret-bearing or unusable enabled orchestrator config", () => {
    writeFileSync(
      join(root, ".agent-kit", "orchestrator.json"),
      JSON.stringify({
        schemaVersion: 1,
        enabled: true,
        defaultAlias: "balanced",
        providers: { primary: { kind: "openai", credentialRef: "sk-proj-this-is-a-resolved-secret-value" } },
        modelAliases: {}
      })
    );
    let finding = auditProject(root).find((item) => item.area === "orchestrator" && item.level === "fail");
    expect(finding?.message).toContain("resolved credential");

    writeFileSync(
      join(root, ".agent-kit", "orchestrator.json"),
      JSON.stringify({ schemaVersion: 1, enabled: true, defaultAlias: "balanced", providers: {}, modelAliases: {} })
    );
    finding = auditProject(root).find((item) => item.area === "orchestrator" && item.level === "fail");
    expect(finding?.message).toContain("defaultAlias is not configured");
  });

  it("fails when the roster does not match the runtime contract", () => {
    const roster = JSON.parse(readFileSync(join(root, ".agent-kit", "agent-roster.json"), "utf8")) as {
      workflows: Array<{ id: string; requiredOutputs?: string[] }>;
    };
    const planning = roster.workflows.find((workflow) => workflow.id === "planning");
    if (!planning) throw new Error("Expected planning workflow in fixture.");
    delete planning.requiredOutputs;
    writeFileSync(join(root, ".agent-kit", "agent-roster.json"), `${JSON.stringify(roster, null, 2)}\n`);

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "fail" && finding.message.includes("schema-backed roster contract"))).toBe(true);
  });

  it("validates structured council-session records when present", () => {
    mkdirSync(join(root, ".agent-kit", "council-sessions"), { recursive: true });
    writeFileSync(
      join(root, ".agent-kit", "council-sessions", "2026-06-03-runtime-contract.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          sessionId: "2026-06-03-runtime-contract",
          createdAt: "2026-06-03T00:00:00.000Z",
          workflowId: "core-change",
          status: "complete",
          request: "Validate runtime contracts",
          affectedLayers: ["docs", "business logic"],
          handoffs: [
            {
              agentId: "planner",
              decision: "Use schema-backed runtime validation.",
              risk: "Invalid records could bypass council expectations.",
              nextHandoff: "lead-architect",
              evidence: ["tests/audit.test.ts"]
            }
          ],
          requiredOutputs: [{ name: "test evidence", status: "complete", evidence: "npm test" }],
          verification: [{ command: "npm test", result: "pass", notes: "Fixture validation." }]
        },
        null,
        2
      )
    );

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "pass" && finding.message.includes("Structured council-session records match"))).toBe(true);
  });

  it("fails malformed structured council-session records", () => {
    mkdirSync(join(root, ".agent-kit", "council-sessions"), { recursive: true });
    writeFileSync(
      join(root, ".agent-kit", "council-sessions", "invalid.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          sessionId: "invalid",
          createdAt: "2026-06-03T00:00:00.000Z",
          workflowId: "core-change",
          status: "complete",
          request: "Invalid fixture",
          handoffs: [],
          requiredOutputs: [],
          verification: []
        },
        null,
        2
      )
    );

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "fail" && finding.message.includes("does not match the council-session contract"))).toBe(true);
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

  it("warns when frontend workflow lacks creative-direction outputs", () => {
    const roster = JSON.parse(readFileSync(join(root, ".agent-kit", "agent-roster.json"), "utf8")) as {
      workflows: Array<{ id: string; requiredOutputs?: string[] }>;
    };
    const frontendChange = roster.workflows.find((workflow) => workflow.id === "frontend-change");
    if (!frontendChange) throw new Error("Expected frontend-change workflow in fixture.");
    frontendChange.requiredOutputs = ["state coverage", "accessibility checks", "desktop/mobile verification"];
    writeFileSync(join(root, ".agent-kit", "agent-roster.json"), `${JSON.stringify(roster, null, 2)}\n`);

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "warn" && finding.message.includes("brand/content intake"))).toBe(true);
  });

  it("fails when marketing-copy workflow can bypass Marketing Copy Lead", () => {
    const roster = JSON.parse(readFileSync(join(root, ".agent-kit", "agent-roster.json"), "utf8")) as {
      workflows: Array<{ id: string; sequence: string[] }>;
    };
    const marketingCopy = roster.workflows.find((workflow) => workflow.id === "marketing-copy");
    if (!marketingCopy) throw new Error("Expected marketing-copy workflow in fixture.");
    marketingCopy.sequence = marketingCopy.sequence.filter((agent) => agent !== "marketing-copy-lead");
    writeFileSync(join(root, ".agent-kit", "agent-roster.json"), `${JSON.stringify(roster, null, 2)}\n`);

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.level === "fail" && finding.message.includes("Marketing-copy workflow"))).toBe(true);
  });

  it("warns when MESSAGING.md lacks claim proof and CTA evidence", () => {
    writeFileSync(join(root, "MESSAGING.md"), "Discovery questions\nAudience\nPain\nOutcome\nDifferentiator\nProof\nObjections\nVoice\nConversion\n");

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "messaging" && finding.message.includes("claims, proof, objections, and CTA"))).toBe(true);
  });

  it("warns when testing docs omit visual QA evidence", () => {
    writeFileSync(join(root, "TESTING.md"), "Playwright smoke\n");

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "docs-hygiene" && finding.message.includes("visual QA"))).toBe(true);
  });

  it("warns when DESIGN.md lacks content-first design direction", () => {
    writeFileSync(join(root, "DESIGN.md"), "Colors only\n");

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "frontend" && finding.message.includes("DESIGN.md is missing"))).toBe(true);
  });

  it("warns when DESIGN.md lacks reference-led critique guidance", () => {
    writeFileSync(join(root, "DESIGN.md"), "Brand\nContent\nUser needs\nCreative direction\nDesign tokens\n");

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "frontend" && finding.message.includes("reference-set"))).toBe(true);
  });

  it("warns when DESIGN.md lacks frontend product-quality scorecard guidance", () => {
    writeFileSync(
      join(root, "DESIGN.md"),
      "Brand\nContent\nUser needs\nCreative direction\nDesign tokens\nReference set\nAnti-reference\nDistinctiveness\nCritique\n"
    );

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "frontend" && finding.message.includes("product-quality scorecard"))).toBe(true);
  });

  it("warns when DESIGN.md lacks frontend distinctiveness benchmark evidence", () => {
    writeFileSync(
      join(root, "DESIGN.md"),
      "Brand\nContent\nUser needs\nCreative direction\nDesign tokens\nReference set\nAnti-reference\nDistinctiveness\nCritique\nProduct quality scorecard\nUser/task fit\nContent specificity\nSource safety\nTotal score\n"
    );

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "frontend" && finding.message.includes("distinctiveness benchmark"))).toBe(true);
  });

  it("warns when QUALITY_GATES.md lacks the best-practice maturity model", () => {
    writeFileSync(join(root, "QUALITY_GATES.md"), "A tiny checklist\n");

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "quality" && finding.message.includes("baseline, strong, best-practice"))).toBe(true);
    expect(findings.some((finding) => finding.area === "quality" && finding.message.includes("best-practice coverage areas"))).toBe(true);
  });

  it("warns when UPGRADE.md lacks upgrade lifecycle evidence", () => {
    writeFileSync(join(root, "UPGRADE.md"), "upgrade notes only\n");

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "upgrade" && finding.message.includes("does not define the full"))).toBe(true);
  });

  it("warns when UPGRADE.md omits framework and migration review", () => {
    writeFileSync(join(root, "UPGRADE.md"), "agent-kit diff\nagent-kit update\naudit --min-readiness\nrollback\nrelease notes\n");

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "upgrade" && finding.message.includes("does not cover framework codemods"))).toBe(true);
  });

  it("passes when project evidence docs have no starter placeholders", () => {
    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "evidence" && finding.level === "pass")).toBe(true);
  });

  it("warns when project evidence docs still contain starter placeholders", () => {
    writeFileSync(join(root, "SPEC.md"), "Product summary\nTBD\n");
    writeFileSync(join(root, "DESIGN.md"), "Direction A\nTBD\n");

    const report = createAuditReport(root);
    const findings = report.findings;
    expect(report.readiness.level).toBe("baseline-setup");
    expect(findings.some((finding) => finding.area === "evidence" && finding.message.includes("SPEC.md, DESIGN.md"))).toBe(true);
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

  it("detects missing RLS in Supabase migrations", () => {
    mkdirSync(join(root, "supabase", "migrations"), { recursive: true });
    writeFileSync(join(root, "supabase", "migrations", "001_init.sql"), "create table profiles (id uuid primary key);\n");
    writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { test: "vitest run" } }, null, 2));

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "project-reality" && finding.level === "fail" && finding.message.includes("row level security"))).toBe(
      true
    );
  });

  it("reports each migration-created table that lacks RLS", () => {
    mkdirSync(join(root, "supabase", "migrations"), { recursive: true });
    writeFileSync(
      join(root, "supabase", "migrations", "001_tables.sql"),
      "create table public.accounts (id uuid primary key);\ncreate table public.events (id uuid primary key);\nalter table public.accounts enable row level security;\n"
    );
    const finding = auditProject(root).find((item) => item.ruleId === "project-reality.supabase.rls-per-table" && item.level === "fail");
    expect(finding?.message).toContain("public.events");
    expect(finding?.message).not.toContain("public.accounts, public.events");
  });

  it("does not treat placeholder test scripts as executable evidence", () => {
    writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { test: "echo no tests yet" } }, null, 2));
    const finding = auditProject(root).find((item) => item.ruleId === "project-reality.tests.executable-script");
    expect(finding?.level).toBe("warn");
    expect(finding?.message).toContain("credible executable test evidence");
  });

  it("scans Git-tracked files and omits detected secret values from evidence", () => {
    const secret = `sk-proj-${"z".repeat(32)}`;
    writeFileSync(join(root, "leaked.ts"), `export const token = "${secret}";\n`);
    execFileSync("git", ["init"], { cwd: root, stdio: "ignore" });
    execFileSync("git", ["add", "leaked.ts"], { cwd: root, stdio: "ignore" });
    const finding = auditProject(root).find((item) => item.ruleId === "project-reality.secrets.git-tracked");
    expect(finding?.level).toBe("fail");
    expect(finding?.message).toContain("leaked.ts");
    expect(JSON.stringify(finding)).not.toContain(secret);
  });

  it("does not report documented placeholders or lower-case source variables as secrets", () => {
    writeFileSync(join(root, ".env.example"), "GITHUB_TOKEN=ghp_replace_with_a_fine_grained_token\n");
    writeFileSync(join(root, "client.ts"), "const token = options.token ?? process.env.GITHUB_TOKEN;\n");
    writeFileSync(join(root, "fixture.test.ts"), 'writeFileSync(".env", "API_KEY=secret\\n");\n');
    execFileSync("git", ["init"], { cwd: root, stdio: "ignore" });
    execFileSync("git", ["add", ".env.example", "client.ts", "fixture.test.ts"], { cwd: root, stdio: "ignore" });

    const finding = auditProject(root).find((item) => item.ruleId === "project-reality.secrets.git-tracked");
    expect(finding?.level).toBe("pass");
  });

  it("passes project-reality RLS when migrations enable RLS", () => {
    mkdirSync(join(root, "supabase", "migrations"), { recursive: true });
    writeFileSync(join(root, "supabase", "migrations", "001_profiles.sql"), "alter table profiles enable row level security;\n");
    writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { test: "vitest run" } }, null, 2));

    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "project-reality" && finding.level === "pass" && finding.message.includes("enable RLS"))).toBe(true);
  });

  it("labels SECURITY.md keyword checks as docs-hygiene", () => {
    writeFileSync(join(root, "SECURITY.md"), "General security notes only.\n");
    const findings = auditProject(root);
    expect(findings.some((finding) => finding.area === "docs-hygiene" && finding.message.includes("OWASP"))).toBe(true);
  });
});
