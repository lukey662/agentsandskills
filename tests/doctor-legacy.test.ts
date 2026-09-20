import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDoctorReport, listLegacyLeftovers } from "../src/install/doctor.js";
import { initProject } from "../src/install/install.js";
import { isCouncilAgentFile, isKitSource, planLegacyPrune, pruneLegacy } from "../src/install/prune-legacy.js";
import { renderAgent } from "../src/install/roster-adapters.js";
import { updateProject } from "../src/install/update.js";

const COUNCIL_STUB = `---
name: "planner"
description: "Own planning, scope breakdown, sequencing, and council routing before implementation starts."
---

Read AGENTS.md, AGENT_ROSTER.md, .agent-kit/agent-roster.json, MODEL_ROUTING.md, COUNCIL.md, and QUALITY_GATES.md before making routing decisions.

Record handoffs through agent-kit session checkpoint when available.
`;

const COUNCIL_RULE = `---
description: Use Agent Kit council routing, quality gates, and Next.js/Supabase rules.
---

# Agent Kit Cursor Rule

Use AGENTS.md, AGENT_ROSTER.md, COUNCIL.md, and QUALITY_GATES.md as the source of truth.

- Core changes require Lead Architect.
- Frontend changes require Frontend Design Lead.
`;

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function temp(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-legacy-"));
  roots.push(root);
  return root;
}

describe("legacy 0.3 leftovers", () => {
  it("doctor passes a fresh 0.4 init without a leftover warning", () => {
    const root = temp();
    initProject({ cwd: root });
    const report = createDoctorReport(root);
    expect(report.ok).toBe(true);
    expect(report.findings.some((finding) => finding.area === "legacy" && finding.level === "pass")).toBe(true);
    expect(listLegacyLeftovers(root)).toEqual([]);
  });

  it("doctor warns when 0.3 council files remain and still reports ok", () => {
    const root = temp();
    initProject({ cwd: root });
    writeFileSync(join(root, "QUALITY_GATES.md"), "# leftover\n");
    writeFileSync(join(root, "COUNCIL.md"), "# leftover\n");
    mkdirSync(join(root, ".agent-kit"), { recursive: true });
    writeFileSync(join(root, ".agent-kit/agent-roster.json"), "{}\n");

    const report = createDoctorReport(root);
    expect(report.ok).toBe(true);
    const warning = report.findings.find((finding) => finding.area === "legacy" && finding.level === "warn");
    expect(warning?.message).toContain("QUALITY_GATES.md");
    expect(warning?.message).toContain("COUNCIL.md");
    expect(warning?.message).toContain("update never deletes");
    expect(existsSync(join(root, "QUALITY_GATES.md"))).toBe(true);
  });

  it("update lists leftover docs and does not delete them", () => {
    const root = temp();
    initProject({ cwd: root });
    writeFileSync(join(root, "QUALITY_GATES.md"), "# leftover\n");
    const result = updateProject({ cwd: root });
    expect(result.leftoverDocs).toContain("QUALITY_GATES.md");
    expect(existsSync(join(root, "QUALITY_GATES.md"))).toBe(true);
    expect(result.pruned).toEqual([]);
  });
});

describe("0.3 council stubs that shadow 0.4 files", () => {
  it("recognizes a council stub by missing tools frontmatter or council prose", () => {
    expect(isCouncilAgentFile(COUNCIL_STUB)).toBe(true);
    const real = readFileSync(join(process.cwd(), "agents/planner/agent.md"), "utf8");
    expect(isCouncilAgentFile(real)).toBe(false);
    for (const host of ["cursor", "claude", "copilot", "antigravity"] as const) expect(isCouncilAgentFile(renderAgent(host, "planner")), host).toBe(false);
  });

  it("doctor fails when a council planner sits at the 0.4 path", () => {
    const root = temp();
    initProject({ cwd: root });
    writeFileSync(join(root, ".cursor/agents/planner.md"), COUNCIL_STUB);
    const report = createDoctorReport(root);
    expect(report.ok).toBe(false);
    const finding = report.findings.find((item) => item.area === "agents" && item.message.includes("planner"));
    expect(finding?.level).toBe("fail");
    expect(finding?.message).toContain("--prune-legacy");
  });

  it("doctor fails when the always-on Cursor rule is the council version", () => {
    const root = temp();
    initProject({ cwd: root });
    writeFileSync(join(root, ".cursor/rules/cursor-agent-kit.mdc"), COUNCIL_RULE);
    const report = createDoctorReport(root);
    expect(report.ok).toBe(false);
    expect(report.findings.some((item) => item.area === "legacy" && item.level === "fail" && item.message.includes("cursor-agent-kit.mdc"))).toBe(true);
  });

  it("doctor warns when council skills still sit in .cursor/skills", () => {
    const root = temp();
    initProject({ cwd: root });
    mkdirSync(join(root, ".cursor/skills/frontend-design-system"), { recursive: true });
    writeFileSync(join(root, ".cursor/skills/frontend-design-system/SKILL.md"), "# old\n");
    const report = createDoctorReport(root);
    expect(report.ok).toBe(true);
    expect(report.findings.some((item) => item.area === "legacy" && item.level === "warn" && item.message.includes("frontend-design-system"))).toBe(true);
  });
});

describe("update --prune-legacy", () => {
  function seedLeftovers(root: string): void {
    writeFileSync(join(root, "COUNCIL.md"), "# leftover\n");
    writeFileSync(join(root, "MODEL_ROUTING.md"), "# leftover\n");
    mkdirSync(join(root, ".agent-kit/agents"), { recursive: true });
    writeFileSync(join(root, ".agent-kit/agents/lead-architect.md"), "# council\n");
    writeFileSync(join(root, ".cursor/agents/planner.md"), COUNCIL_STUB);
    writeFileSync(join(root, ".cursor/agents/frontend-design-lead.md"), COUNCIL_STUB.replace(/planner/g, "frontend-design-lead"));
    writeFileSync(join(root, ".cursor/rules/cursor-agent-kit.mdc"), COUNCIL_RULE);
    mkdirSync(join(root, ".cursor/skills/content-first-design"), { recursive: true });
    writeFileSync(join(root, ".cursor/skills/content-first-design/SKILL.md"), "# old\n");
    // Things prune must never touch.
    writeFileSync(join(root, "SPEC.md"), "# product spec\n");
    writeFileSync(join(root, "DESIGN.md"), "# product design\n");
    mkdirSync(join(root, "app"), { recursive: true });
    writeFileSync(join(root, "app/page.tsx"), "export default function Page() { return null; }\n");
  }

  it("plans only allowlisted paths and keeps an optional 0.4 lead-architect", () => {
    const root = temp();
    initProject({ cwd: root });
    seedLeftovers(root);
    const optional = readFileSync(join(process.cwd(), "agents/optional/lead-architect/agent.md"), "utf8");
    writeFileSync(join(root, ".cursor/agents/lead-architect.md"), optional);

    const paths = planLegacyPrune(root).map((entry) => entry.path);
    expect(paths).toContain("COUNCIL.md");
    expect(paths).toContain("MODEL_ROUTING.md");
    expect(paths).toContain(".agent-kit/agents");
    expect(paths).toContain(".cursor/agents/planner.md");
    expect(paths).toContain(".cursor/agents/frontend-design-lead.md");
    expect(paths).toContain(".cursor/rules/cursor-agent-kit.mdc");
    expect(paths).toContain(".cursor/skills/content-first-design");
    expect(paths).not.toContain(".cursor/agents/lead-architect.md");
    expect(paths).not.toContain("SPEC.md");
    expect(paths).not.toContain("DESIGN.md");
    expect(paths.some((path) => path.startsWith("app/"))).toBe(false);
  });

  it("dry-run plans without deleting", () => {
    const root = temp();
    initProject({ cwd: root });
    seedLeftovers(root);
    const result = pruneLegacy(root, { dryRun: true });
    expect(result.planned.length).toBeGreaterThan(0);
    expect(result.removed).toEqual([]);
    expect(existsSync(join(root, "COUNCIL.md"))).toBe(true);
  });

  it("deletes the plan, then update regenerates the 0.4 planner and rule", () => {
    const root = temp();
    initProject({ cwd: root });
    seedLeftovers(root);

    const result = updateProject({ cwd: root, pruneLegacy: true });
    expect(result.pruned).toContain("COUNCIL.md");
    expect(result.pruned).toContain(".cursor/agents/planner.md");
    expect(existsSync(join(root, "COUNCIL.md"))).toBe(false);
    expect(existsSync(join(root, ".agent-kit/agents"))).toBe(false);
    expect(existsSync(join(root, ".cursor/agents/frontend-design-lead.md"))).toBe(false);
    expect(existsSync(join(root, ".cursor/skills/content-first-design"))).toBe(false);

    // Untouched.
    expect(readFileSync(join(root, "SPEC.md"), "utf8")).toBe("# product spec\n");
    expect(readFileSync(join(root, "DESIGN.md"), "utf8")).toBe("# product design\n");
    expect(existsSync(join(root, "app/page.tsx"))).toBe(true);

    // Regenerated as 0.4.
    const planner = readFileSync(join(root, ".cursor/agents/planner.md"), "utf8");
    expect(planner).toBe(renderAgent("cursor", "planner"));
    const rule = readFileSync(join(root, ".cursor/rules/cursor-agent-kit.mdc"), "utf8");
    expect(rule).not.toContain("COUNCIL.md");
    expect(createDoctorReport(root).ok).toBe(true);
  });
  it("prunes 0.4 skill copies and .antigravity but never the kit's own skills/", () => {
    const root = temp();
    initProject({ cwd: root });
    mkdirSync(join(root, ".cursor/skills/browser-qa"), { recursive: true });
    writeFileSync(join(root, ".cursor/skills/browser-qa/SKILL.md"), "# 0.4 copy\n");
    mkdirSync(join(root, "skills/browser-qa"), { recursive: true });
    writeFileSync(join(root, "skills/browser-qa/SKILL.md"), "# 0.4 portable copy\n");
    mkdirSync(join(root, ".antigravity/runtime-skills/ship"), { recursive: true });
    writeFileSync(join(root, ".antigravity/runtime-skills/ship/SKILL.md"), "# 0.4 copy\n");

    const paths = planLegacyPrune(root).map((entry) => entry.path);
    expect(paths).toContain(".cursor/skills/browser-qa");
    expect(paths).toContain(".antigravity");
    expect(paths).toContain("skills/browser-qa");
    expect(isKitSource(root)).toBe(false);

    // The kit's own source tree keeps skills/ (it is canonical there).
    expect(isKitSource(process.cwd())).toBe(true);
    expect(
      planLegacyPrune(process.cwd())
        .map((entry) => entry.path)
        .some((path) => path.startsWith("skills/"))
    ).toBe(false);

    updateProject({ cwd: root, pruneLegacy: true });
    expect(existsSync(join(root, ".cursor/skills/browser-qa"))).toBe(false);
    expect(existsSync(join(root, ".antigravity"))).toBe(false);
    expect(existsSync(join(root, "skills/browser-qa"))).toBe(false);
    expect(existsSync(join(root, ".agents/skills/browser-qa/SKILL.md"))).toBe(true);
    expect(createDoctorReport(root).ok).toBe(true);
  });
});
