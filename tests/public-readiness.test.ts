import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  name: string;
  publishConfig?: { access?: string };
  bin?: Record<string, string>;
  files?: string[];
  scripts?: Record<string, string>;
};

function listFiles(path: string): string[] {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((entry) => listFiles(join(path, entry)));
}

function packagedPublicFiles(): string[] {
  const explicitFiles = ["package.json", ...(packageJson.files ?? [])].filter((file) => file !== "dist");
  return explicitFiles.flatMap((file) => listFiles(join(root, file)));
}

describe("public package readiness", () => {
  it("uses neutral public package metadata", () => {
    expect(packageJson.name).toBe("@appsforgood/next-supabase-kit");
    expect(packageJson.publishConfig?.access).toBe("public");
    expect(packageJson.bin?.["agent-kit"]).toBe("dist/index.js");
    expect(packageJson.scripts?.["release:check"]).toBe("node scripts/release-check.mjs");
    expect(packageJson.scripts?.["examples:check"]).toBe("node scripts/example-check.mjs");
    expect(packageJson.scripts?.["version:check"]).toBe("node scripts/version-check.mjs");
    expect(packageJson.scripts?.["sbom:check"]).toBe("node scripts/sbom-check.mjs");
    expect(packageJson.scripts?.["sbom:generate"]).toBe("node scripts/sbom-check.mjs --output sbom.cdx.json");
    expect(packageJson.scripts?.["publish:verify"]).toBe("node scripts/post-publish-verify.mjs");
    expect(packageJson.scripts?.["smoke:studio"]).toBe("node scripts/smoke-studio.mjs");
    expect(packageJson.scripts?.["smoke:audit-gate"]).toBe("node scripts/smoke-audit-gate.mjs");
    expect(packageJson.files).toContain("RESEARCH_CITATION_POLICY.md");
    expect(packageJson.files).toContain("CHANGELOG.md");
    expect(packageJson.files).toContain("CONTRIBUTING.md");
    expect(packageJson.files).toContain("CODE_OF_CONDUCT.md");
    expect(packageJson.files).toContain("SUPPORT.md");
    expect(packageJson.files).toContain("GOVERNANCE.md");
    expect(packageJson.files).toContain("REPOSITORY_SETTINGS.md");
    expect(packageJson.files).toContain("SUPPLY_CHAIN.md");
    expect(packageJson.files).toContain("BEST_PRACTICE_EVIDENCE.md");
    expect(packageJson.files).toContain("DOGFOOD.md");
    expect(packageJson.files).toContain("research/summaries");
    expect(packageJson.files).toContain("research/proposed-updates.md");
    expect(packageJson.files).toContain("schemas");
    expect(packageJson.files).toContain("assistant-adapters");
    expect(packageJson.files).toContain("model-routing");
    expect(packageJson.files).toContain("UPGRADE.md");
    expect(packageJson.files).not.toContain("research/findings");
    expect(packageJson.files).not.toContain("research/repo-candidates.json");
  });

  it("ships an MIT license", () => {
    const license = readFileSync(join(root, "LICENSE"), "utf8");
    expect(license).toContain("MIT License");
    expect(license).toContain("Permission is hereby granted, free of charge");
  });

  it("keeps private branding and restricted publish assumptions out of packaged files", () => {
    const forbidden = [
      /@afg/i,
      /\bAFG\b/,
      /private package/i,
      /private-first/i,
      /private v0\.1/i,
      /restricted access/i,
      /publish --access restricted/i,
      /NPM_READ_TOKEN/,
      /NPM_TOKEN/,
      /Do not redistribute/i
    ];

    for (const file of packagedPublicFiles()) {
      const text = readFileSync(file, "utf8");
      for (const pattern of forbidden) {
        expect(text, `${file} contains forbidden public-package text matching ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("keeps detailed per-repo research out of the public package", () => {
    const packaged = packagedPublicFiles().map((file) => file.replace(root, "").replace(/\\/g, "/").replace(/^\/+/, ""));
    expect(packaged.some((file) => file.startsWith("research/findings/"))).toBe(false);
    expect(packaged).toContain("research/summaries/scan-overview.md");
    expect(packaged).toContain("research/proposed-updates.md");
    expect(packaged).toContain("BEST_PRACTICE_EVIDENCE.md");
    expect(packaged).toContain("DOGFOOD.md");
    expect(packaged).toContain("RESEARCH_CITATION_POLICY.md");
    expect(packaged).toContain("UPGRADE.md");
    expect(packaged.some((file) => file.startsWith("dogfood/"))).toBe(false);
  });

  it("keeps generated example special files out of package inputs", () => {
    const packaged = packagedPublicFiles().map((file) => file.replace(root, "").replace(/\\/g, "/").replace(/^\/+/, ""));
    expect(packaged).not.toContain("examples/next-supabase-installed/SECURITY.md");
    expect(packaged).not.toContain("examples/next-supabase-installed/UPGRADE.md");
    expect(packaged).not.toContain("examples/next-supabase-installed/.agent-kit/assistant-adapters/README.md");
    expect(packaged).not.toContain("examples/next-supabase-installed/.agent-kit/checklists/upgrade.md");
  });

  it("maps research findings to enforceable best-practice assets", () => {
    const evidence = readFileSync(join(root, "BEST_PRACTICE_EVIDENCE.md"), "utf8");

    expect(evidence).toContain("100-repo research pass as input, not proof");
    expect(evidence).toContain("88 of 100 findings");
    expect(evidence).toContain("66 of 100 findings");
    expect(evidence).toContain("57 of 100 findings");
    expect(evidence).toContain("54 of 100 findings");
    expect(evidence).toContain("templates/next-supabase/SECURITY.md");
    expect(evidence).toContain("rosters/next-supabase-default-council.json");
    expect(evidence).toContain("schemas/audit-report.schema.json");
    expect(evidence).toContain("ASSISTANT_ADAPTERS.md");
    expect(evidence).toContain("UPGRADE.md");
    expect(evidence).toContain("frontend-distinctiveness-benchmark.md");
    expect(evidence).toContain("frontend-product-quality-rubric.md");
    expect(evidence).toContain("agent-kit audit --min-readiness");
    expect(evidence).toContain("npm run release:check");
    expect(evidence).toContain("A fresh install is not a completed best-practice project");
  });

  it("ships public-safe dogfood evidence without local project paths", () => {
    const dogfood = readFileSync(join(root, "DOGFOOD.md"), "utf8");

    expect(existsSync(join(root, "research", "summaries", "dogfood-adoption-patterns.md"))).toBe(true);
    expect(dogfood).toContain("Current Read-Only Audit Snapshot");
    expect(dogfood).toContain("SaaS/tool hybrid");
    expect(dogfood).toContain("Content/admin hybrid");
    expect(dogfood).toContain("11 pass, 20 warn, 7 fail");
    expect(dogfood).toContain("reference-led design critique");
    expect(dogfood).toContain("public npm package has not yet been published");
    expect(dogfood).not.toContain("/Volumes/");
    expect(dogfood).not.toContain("/Users/");
  });

  it("validates the default agent council contract", () => {
    const roster = JSON.parse(readFileSync(join(root, "rosters", "next-supabase-default-council.json"), "utf8")) as {
      required: boolean;
      defaultWorkflow: string;
      agents: Array<{ id: string; skills?: string[]; defaultFor?: string[] }>;
      workflows: Array<{ id: string; sequence?: string[]; council?: string[]; requiredOutputs?: string[] }>;
    };
    const agentIds = new Set(roster.agents.map((agent) => agent.id));
    const planner = roster.agents.find((agent) => agent.id === "planner");
    const frontendDesignLead = roster.agents.find((agent) => agent.id === "frontend-design-lead");
    const marketingCopyLead = roster.agents.find((agent) => agent.id === "marketing-copy-lead");
    const coreChange = roster.workflows.find((workflow) => workflow.id === "core-change");
    const frontendChange = roster.workflows.find((workflow) => workflow.id === "frontend-change");
    const marketingCopy = roster.workflows.find((workflow) => workflow.id === "marketing-copy");

    expect(roster.required).toBe(true);
    expect(roster.defaultWorkflow).toBe("planning");
    expect(agentIds).toContain("planner");
    expect(agentIds).toContain("lead-architect");
    expect(agentIds).toContain("security-reviewer");
    expect(agentIds).toContain("marketing-copy-lead");
    expect(agentIds).toContain("qa-engineer");
    expect(planner?.defaultFor).toContain("planning");
    expect(planner?.skills).toContain("planning-council");
    expect(planner?.skills).toContain("best-practice-maturity-review");
    expect(planner?.skills).toContain("agent-handoff-tracing");
    expect(planner?.skills).toContain("upgrade-maintenance");
    expect(frontendDesignLead?.skills).toContain("content-first-design");
    expect(frontendDesignLead?.skills).toContain("reference-led-design-critique");
    expect(frontendDesignLead?.skills).toContain("frontend-distinctiveness-benchmark");
    expect(frontendDesignLead?.skills).toContain("frontend-product-quality-rubric");
    expect(frontendDesignLead?.skills).toContain("visual-regression-qa");
    expect(frontendDesignLead?.defaultFor).toContain("creative-direction");
    expect(frontendDesignLead?.defaultFor).toContain("reference-led-critique");
    expect(frontendDesignLead?.defaultFor).toContain("distinctiveness-benchmark");
    expect(frontendDesignLead?.defaultFor).toContain("product-quality-scorecard");
    expect(marketingCopyLead?.skills).toContain("positioning-messaging");
    expect(marketingCopyLead?.skills).toContain("conversion-copywriting");
    expect(marketingCopyLead?.skills).toContain("landing-page-copy");
    expect(marketingCopyLead?.skills).toContain("product-voice-tone");
    expect(marketingCopyLead?.skills).toContain("onboarding-empty-state-copy");
    expect(marketingCopyLead?.defaultFor).toContain("value-proposition");
    expect(marketingCopyLead?.defaultFor).toContain("conversion");
    expect(coreChange?.sequence).toContain("lead-architect");
    expect(coreChange?.council).toContain("lead-architect");
    expect(coreChange?.requiredOutputs).toContain("upgrade evidence when applicable");
    expect(frontendChange?.sequence).toContain("frontend-design-lead");
    expect(frontendChange?.requiredOutputs).toContain("brand/content intake");
    expect(frontendChange?.requiredOutputs).toContain("creative-direction rationale");
    expect(frontendChange?.requiredOutputs).toContain("reference-set evidence");
    expect(frontendChange?.requiredOutputs).toContain("distinctiveness benchmark");
    expect(frontendChange?.requiredOutputs).toContain("design critique verdict");
    expect(frontendChange?.requiredOutputs).toContain("frontend product-quality scorecard");
    expect(frontendChange?.requiredOutputs).toContain("visual QA evidence");
    expect(marketingCopy?.sequence).toContain("marketing-copy-lead");
    expect(marketingCopy?.requiredOutputs).toContain("problem, pain, desired outcome, and value proposition");
    expect(marketingCopy?.requiredOutputs).toContain("differentiators, proof points, objections, and counter-messaging");
  });

  it("ships assistant adapter assets for common AI coding tools", () => {
    expect(existsSync(join(root, "templates", "next-supabase", "ASSISTANT_ADAPTERS.md"))).toBe(true);
    expect(existsSync(join(root, "assistant-adapters", "README.md"))).toBe(true);
    expect(existsSync(join(root, "assistant-adapters", "codex-agents.md"))).toBe(true);
    expect(existsSync(join(root, "assistant-adapters", "github-copilot-instructions.md"))).toBe(true);
    expect(existsSync(join(root, "assistant-adapters", "github-next-supabase.instructions.md"))).toBe(true);
    expect(existsSync(join(root, "assistant-adapters", "cursor-agent-kit.mdc"))).toBe(true);
    expect(existsSync(join(root, "assistant-adapters", "claude-code-subagents.md"))).toBe(true);
    expect(existsSync(join(root, "assistant-adapters", "model-selection", "codex-config.example.toml"))).toBe(true);
    expect(existsSync(join(root, "assistant-adapters", "model-selection", "claude-code-subagents-with-models.md"))).toBe(true);
    expect(existsSync(join(root, "assistant-adapters", "model-selection", "cursor-model-selection.mdc"))).toBe(true);
    expect(existsSync(join(root, "assistant-adapters", "model-selection", "github-copilot-model-selection.md"))).toBe(true);

    const setup = readFileSync(join(root, "templates", "next-supabase", "ASSISTANT_ADAPTERS.md"), "utf8");
    const cursor = readFileSync(join(root, "assistant-adapters", "cursor-agent-kit.mdc"), "utf8");
    const copilot = readFileSync(join(root, "assistant-adapters", "github-copilot-instructions.md"), "utf8");
    const claude = readFileSync(join(root, "assistant-adapters", "claude-code-subagents.md"), "utf8");
    const codexModel = readFileSync(join(root, "assistant-adapters", "model-selection", "codex-config.example.toml"), "utf8");

    expect(setup).toContain("AGENTS.md");
    expect(setup).toContain("MODEL_ROUTING.md");
    expect(setup).toContain("Model-selection status");
    expect(setup).toContain("Enforcement");
    expect(setup).toContain(".github/copilot-instructions.md");
    expect(setup).toContain(".cursor/rules/cursor-agent-kit.mdc");
    expect(setup).toContain(".cursor/rules/cursor-model-selection.mdc");
    expect(setup).toContain(".claude/agents/*.md");
    expect(cursor).toContain("alwaysApply: true");
    expect(cursor).toContain("MODEL_ROUTING.md");
    expect(copilot).toContain("agent-kit audit --min-readiness");
    expect(copilot).toContain("MODEL_ROUTING.md");
    expect(claude).toContain(".claude/");
    expect(claude).toContain("MODEL_ROUTING.md");
    expect(codexModel).toContain("June 2026 Agent Kit suggested baseline");
  });

  it("ships model-routing assets for agent model selection", () => {
    expect(existsSync(join(root, "templates", "next-supabase", "MODEL_ROUTING.md"))).toBe(true);
    expect(existsSync(join(root, "model-routing", "default-model-routing.json"))).toBe(true);
    expect(existsSync(join(root, "schemas", "model-routing.schema.json"))).toBe(true);
    expect(existsSync(join(root, "schemas", "project-context.schema.json"))).toBe(true);
    expect(existsSync(join(root, "schemas", "correction-rules.schema.json"))).toBe(true);
    expect(existsSync(join(root, "schemas", "session-event.schema.json"))).toBe(true);
    expect(existsSync(join(root, "schemas", "studio-session.schema.json"))).toBe(true);

    const modelRouting = JSON.parse(readFileSync(join(root, "model-routing", "default-model-routing.json"), "utf8")) as {
      profiles: Array<{ id: string }>;
      agentRoutes: Array<{ agentId: string; profileId: string }>;
      toolSurfaces: Array<{ tool: string; enforcement: string }>;
    };
    const profileIds = new Set(modelRouting.profiles.map((profile) => profile.id));
    const agentIds = new Set(modelRouting.agentRoutes.map((route) => route.agentId));
    const toolNames = new Set(modelRouting.toolSurfaces.map((tool) => tool.tool));

    expect(profileIds).toContain("balanced-reasoning");
    expect(profileIds).toContain("deep-reasoning-large-context");
    expect(profileIds).toContain("creative-vision-large-context");
    expect(agentIds).toContain("planner");
    expect(agentIds).toContain("lead-architect");
    expect(agentIds).toContain("frontend-design-lead");
    expect(agentIds).toContain("marketing-copy-lead");
    expect(agentIds).toContain("security-reviewer");
    expect(toolNames).toContain("Codex");
    expect(toolNames).toContain("Claude Code");
    expect(toolNames).toContain("Cursor");
    expect(toolNames).toContain("GitHub Copilot");
    expect(modelRouting.agentRoutes.every((route) => profileIds.has(route.profileId))).toBe(true);
    expect(readFileSync(join(root, "templates", "next-supabase", "MODEL_ROUTING.md"), "utf8")).toContain("June 2026 Commented Recommendations");
    expect(readFileSync(join(root, "src", "config", "contracts.ts"), "utf8")).toContain("ModelRoutingContract");
  });

  it("ships the static Agent Studio export command and smoke coverage", () => {
    const cli = readFileSync(join(root, "src", "cli", "index.ts"), "utf8");
    const exportModule = readFileSync(join(root, "src", "studio", "export.ts"), "utf8");
    const smokeStudio = readFileSync(join(root, "scripts", "smoke-studio.mjs"), "utf8");

    expect(cli).toContain("program.command(\"studio\")");
    expect(cli).toContain("exportStaticStudio");
    expect(exportModule).toContain("STUDIO_EXPORT_HTML");
    expect(exportModule).toContain("agent-studio-data");
    expect(exportModule).toContain("<svg");
    expect(exportModule).toContain("<details");
    expect(smokeStudio).toContain("[\"studio\", \"export\"]");
  });

  it("ships upgrade lifecycle assets", () => {
    expect(existsSync(join(root, "UPGRADE.md"))).toBe(true);
    expect(existsSync(join(root, "templates", "next-supabase", "UPGRADE.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "upgrade-maintenance.md"))).toBe(true);
    expect(existsSync(join(root, "checklists", "upgrade.md"))).toBe(true);
    expect(existsSync(join(root, "prompts", "upgrade-review.md"))).toBe(true);
    expect(existsSync(join(root, "research", "summaries", "upgrade-lifecycle-patterns.md"))).toBe(true);

    const upgradeTemplate = readFileSync(join(root, "templates", "next-supabase", "UPGRADE.md"), "utf8");
    const upgradeSkill = readFileSync(join(root, "skills", "upgrade-maintenance.md"), "utf8");

    expect(upgradeTemplate).toContain("agent-kit diff");
    expect(upgradeTemplate).toContain("agent-kit update");
    expect(upgradeTemplate).toContain("audit --min-readiness");
    expect(upgradeTemplate).toContain("Next.js");
    expect(upgradeTemplate).toContain("Supabase");
    expect(upgradeTemplate).toContain("rollback");
    expect(upgradeSkill).toContain("migration history");
  });

  it("ships content-first design assets", () => {
    expect(existsSync(join(root, "templates", "next-supabase", "DESIGN.md"))).toBe(true);
    expect(existsSync(join(root, "templates", "next-supabase", "QUALITY_GATES.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "best-practice-maturity-review.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "content-first-design.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "reference-led-design-critique.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "frontend-distinctiveness-benchmark.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "frontend-product-quality-rubric.md"))).toBe(true);
    expect(existsSync(join(root, "prompts", "brand-content-intake.md"))).toBe(true);
    expect(existsSync(join(root, "prompts", "creative-direction-matrix.md"))).toBe(true);
    expect(existsSync(join(root, "prompts", "design-critique-gate.md"))).toBe(true);
    expect(existsSync(join(root, "prompts", "frontend-distinctiveness-benchmark.md"))).toBe(true);
    expect(existsSync(join(root, "prompts", "frontend-product-quality-scorecard.md"))).toBe(true);
    expect(existsSync(join(root, "prompts", "visual-qa-plan.md"))).toBe(true);
    expect(existsSync(join(root, "checklists", "brand-content.md"))).toBe(true);
    expect(existsSync(join(root, "checklists", "design-critique.md"))).toBe(true);
    expect(existsSync(join(root, "checklists", "frontend-distinctiveness.md"))).toBe(true);
    expect(existsSync(join(root, "checklists", "frontend-product-quality.md"))).toBe(true);
    expect(existsSync(join(root, "checklists", "visual-regression.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "visual-regression-qa.md"))).toBe(true);
    expect(existsSync(join(root, "research", "summaries", "frontend-product-quality-rubric-patterns.md"))).toBe(true);
    expect(existsSync(join(root, "research", "summaries", "frontend-distinctiveness-benchmark-patterns.md"))).toBe(true);
    expect(readFileSync(join(root, "templates", "next-supabase", "DESIGN.md"), "utf8")).toContain("Design Critique Gate");
    expect(readFileSync(join(root, "templates", "next-supabase", "DESIGN.md"), "utf8")).toContain("Frontend Distinctiveness Benchmark");
    expect(readFileSync(join(root, "templates", "next-supabase", "DESIGN.md"), "utf8")).toContain("Product Quality Scorecard");
    expect(readFileSync(join(root, "templates", "next-supabase", "STYLE_GUIDE.md"), "utf8")).toContain("content-first");
    expect(readFileSync(join(root, "templates", "next-supabase", "STYLE_GUIDE.md"), "utf8")).toContain("frontend-distinctiveness-benchmark");
    expect(readFileSync(join(root, "templates", "next-supabase", "STYLE_GUIDE.md"), "utf8")).toContain("frontend-product-quality-scorecard");
    expect(readFileSync(join(root, "templates", "next-supabase", "QUALITY_GATES.md"), "utf8")).toContain("Best-Practice");
  });

  it("ships marketing copy and messaging assets", () => {
    expect(existsSync(join(root, "templates", "next-supabase", "MESSAGING.md"))).toBe(true);
    expect(existsSync(join(root, "agents", "marketing-copy-lead.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "positioning-messaging.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "conversion-copywriting.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "landing-page-copy.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "product-voice-tone.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "onboarding-empty-state-copy.md"))).toBe(true);
    expect(existsSync(join(root, "prompts", "copy-review.md"))).toBe(true);
    expect(existsSync(join(root, "checklists", "marketing-copy.md"))).toBe(true);

    const messaging = readFileSync(join(root, "templates", "next-supabase", "MESSAGING.md"), "utf8");
    const agents = readFileSync(join(root, "templates", "next-supabase", "AGENTS.md"), "utf8");
    const skills = readFileSync(join(root, "templates", "next-supabase", "SKILLS.md"), "utf8");

    expect(messaging).toContain("Discovery Questions");
    expect(messaging).toContain("Proof And Objections");
    expect(messaging).toContain("Page And Flow Copy Inventory");
    expect(agents).toContain("Marketing Copy Lead");
    expect(skills).toContain("Marketing Copy And Messaging");
  });

  it("ships schema-backed council evidence assets", () => {
    expect(existsSync(join(root, "schemas", "agent-roster.schema.json"))).toBe(true);
    expect(existsSync(join(root, "schemas", "council-session.schema.json"))).toBe(true);
    expect(existsSync(join(root, "schemas", "audit-report.schema.json"))).toBe(true);
    expect(existsSync(join(root, "schemas", "model-routing.schema.json"))).toBe(true);
    expect(existsSync(join(root, "src", "config", "contracts.ts"))).toBe(true);
    expect(existsSync(join(root, "templates", "next-supabase", "COUNCIL.md"))).toBe(true);
    expect(existsSync(join(root, "skills", "agent-handoff-tracing.md"))).toBe(true);
    expect(existsSync(join(root, "checklists", "agent-council.md"))).toBe(true);
    expect(existsSync(join(root, "prompts", "council-session-review.md"))).toBe(true);
    expect(readFileSync(join(root, "templates", "next-supabase", "COUNCIL.md"), "utf8")).toContain("Council Session");
    expect(readFileSync(join(root, "src", "config", "contracts.ts"), "utf8")).toContain("AgentRosterContract");
    expect(readFileSync(join(root, "src", "config", "contracts.ts"), "utf8")).toContain("AuditReportContract");
    expect(readFileSync(join(root, "src", "config", "contracts.ts"), "utf8")).toContain("ModelRoutingContract");
  });

  it("has public OSS repository health assets", () => {
    expect(existsSync(join(root, "CODE_OF_CONDUCT.md"))).toBe(true);
    expect(existsSync(join(root, "SUPPORT.md"))).toBe(true);
    expect(existsSync(join(root, "GOVERNANCE.md"))).toBe(true);
    expect(existsSync(join(root, "REPOSITORY_SETTINGS.md"))).toBe(true);
    expect(existsSync(join(root, "SUPPLY_CHAIN.md"))).toBe(true);
    expect(existsSync(join(root, ".github", "CODEOWNERS"))).toBe(true);
    expect(existsSync(join(root, ".github", "pull_request_template.md"))).toBe(true);
    expect(existsSync(join(root, ".github", "dependabot.yml"))).toBe(true);
    expect(existsSync(join(root, ".github", "labels.yml"))).toBe(true);
    expect(existsSync(join(root, ".github", "labeler.yml"))).toBe(true);
    expect(existsSync(join(root, ".github", "ISSUE_TEMPLATE", "bug_report.yml"))).toBe(true);
    expect(existsSync(join(root, ".github", "ISSUE_TEMPLATE", "feature_request.yml"))).toBe(true);
    expect(existsSync(join(root, ".github", "ISSUE_TEMPLATE", "research_promotion.yml"))).toBe(true);
    expect(existsSync(join(root, ".github", "workflows", "codeql.yml"))).toBe(true);
    expect(existsSync(join(root, ".github", "workflows", "dependency-review.yml"))).toBe(true);
    expect(existsSync(join(root, ".github", "workflows", "pr-labeler.yml"))).toBe(true);
    expect(existsSync(join(root, ".github", "workflows", "scorecard.yml"))).toBe(true);
    expect(existsSync(join(root, "scripts", "release-check.mjs"))).toBe(true);
    expect(existsSync(join(root, "scripts", "post-publish-verify.mjs"))).toBe(true);
    expect(existsSync(join(root, "scripts", "example-check.mjs"))).toBe(true);
    expect(existsSync(join(root, "scripts", "version-check.mjs"))).toBe(true);
    expect(existsSync(join(root, "scripts", "sbom-check.mjs"))).toBe(true);

    const prTemplate = readFileSync(join(root, ".github", "pull_request_template.md"), "utf8");
    const dependabot = readFileSync(join(root, ".github", "dependabot.yml"), "utf8");
    const codeql = readFileSync(join(root, ".github", "workflows", "codeql.yml"), "utf8");
    const release = readFileSync(join(root, ".github", "workflows", "release.yml"), "utf8");
    const ci = readFileSync(join(root, ".github", "workflows", "ci.yml"), "utf8");
    const dependencyReview = readFileSync(join(root, ".github", "workflows", "dependency-review.yml"), "utf8");
    const scorecard = readFileSync(join(root, ".github", "workflows", "scorecard.yml"), "utf8");
    const prLabeler = readFileSync(join(root, ".github", "workflows", "pr-labeler.yml"), "utf8");
    const supplyChain = readFileSync(join(root, "SUPPLY_CHAIN.md"), "utf8");
    const repositorySettings = readFileSync(join(root, "REPOSITORY_SETTINGS.md"), "utf8");
    const labels = readFileSync(join(root, ".github", "labels.yml"), "utf8");

    expect(prTemplate).toContain("COUNCIL.md");
    expect(prTemplate).toContain("Research citation policy");
    expect(dependabot).toContain("package-ecosystem: npm");
    expect(dependabot).toContain("package-ecosystem: github-actions");
    expect(codeql).toContain("github/codeql-action/analyze");
    expect(dependencyReview).toContain("actions/dependency-review-action");
    expect(dependencyReview).toContain("fail-on-severity: moderate");
    expect(scorecard).toContain("ossf/scorecard-action");
    expect(scorecard).toContain("publish_results: true");
    expect(prLabeler).toContain("actions/labeler");
    expect(prLabeler).toContain("pull_request_target");
    expect(release).toContain("id-token: write");
    expect(release).toContain("attestations: write");
    expect(release).toContain("npm run release:check");
    expect(release).toContain("node scripts/sbom-check.mjs --output release-artifacts/sbom.cdx.json");
    expect(release).toContain("actions/upload-artifact");
    expect(release).toContain("actions/attest-sbom");
    expect(release).toContain("sbom-path: release-artifacts/sbom.cdx.json");
    expect(release).toContain("npm publish \"${{ steps.pack.outputs.tarball }}\" --access public");
    expect(release).toContain("node scripts/post-publish-verify.mjs");
    expect(ci).toContain("npm run release:check");
    expect(release).toContain("Validate manual publish ref");
    expect(release).not.toContain("NODE_AUTH_TOKEN");
    expect(supplyChain).toContain("Trusted Publishing");
    expect(supplyChain).toContain("provenance");
    expect(supplyChain).toContain("SBOM");
    expect(repositorySettings).toContain("Branch Protection");
    expect(repositorySettings).toContain("npm-publish");
    expect(repositorySettings).toContain("Private vulnerability reporting");
    expect(labels).toContain("needs-triage");
    expect(labels).toContain("risk: security");
  });

  it("uses one shared release-readiness command for local, CI, and release gates", () => {
    const releaseCheck = readFileSync(join(root, "scripts", "release-check.mjs"), "utf8");
    const postPublishVerify = readFileSync(join(root, "scripts", "post-publish-verify.mjs"), "utf8");
    const ci = readFileSync(join(root, ".github", "workflows", "ci.yml"), "utf8");
    const release = readFileSync(join(root, ".github", "workflows", "release.yml"), "utf8");

    expect(packageJson.scripts?.["release:check"]).toBe("node scripts/release-check.mjs");
    expect(ci).toContain("npm run release:check");
    expect(release).toContain("npm run release:check");

    expect(releaseCheck).toContain("research/scan-config.json");
    expect(releaseCheck).toContain("rosters/next-supabase-default-council.json");
    expect(releaseCheck).toContain("schemas/agent-roster.schema.json");
    expect(releaseCheck).toContain("schemas/council-session.schema.json");
    expect(releaseCheck).toContain("schemas/audit-report.schema.json");
    expect(releaseCheck).toContain("schemas/model-routing.schema.json");
    expect(releaseCheck).toContain("schemas/project-context.schema.json");
    expect(releaseCheck).toContain("schemas/correction-rules.schema.json");
    expect(releaseCheck).toContain("schemas/session-event.schema.json");
    expect(releaseCheck).toContain("schemas/studio-session.schema.json");
    expect(releaseCheck).toContain("model-routing/default-model-routing.json");
    expect(releaseCheck).toContain("examples/next-supabase-installed/.agent-kit/agent-roster.json");
    expect(releaseCheck).toContain("examples/next-supabase-installed/.agent-kit/model-routing.json");
    expect(releaseCheck).toContain("examples/next-supabase-installed/audit-output.json");
    expect(releaseCheck).toContain("[\"run\", \"version:check\"]");
    expect(releaseCheck).toContain("[\"run\", \"typecheck\"]");
    expect(releaseCheck).toContain("[\"test\"]");
    expect(releaseCheck).toContain("[\"run\", \"build\"]");
    expect(releaseCheck).toContain("[\"run\", \"examples:check\"]");
    expect(releaseCheck).toContain("[\"run\", \"smoke:install\"]");
    expect(releaseCheck).toContain("[\"run\", \"smoke:studio\"]");
    expect(releaseCheck).toContain("[\"run\", \"smoke:audit-gate\"]");
    expect(releaseCheck).toContain("[\"audit\", \"--audit-level=moderate\"]");
    expect(releaseCheck).toContain("[\"run\", \"sbom:check\"]");
    expect(releaseCheck).toContain("[\"pack\", \"--dry-run\"]");

    const sbomCheck = readFileSync(join(root, "scripts", "sbom-check.mjs"), "utf8");
    expect(sbomCheck).toContain("CycloneDX");
    expect(sbomCheck).toContain("package-lock.json");
    expect(sbomCheck).toContain("requiredRuntimeDependencies");

    const exampleCheck = readFileSync(join(root, "scripts", "example-check.mjs"), "utf8");
    expect(exampleCheck).toContain("stableManifest");
    expect(exampleCheck).toContain("stableAudit");
    expect(exampleCheck).toContain("Example audit output");

    const versionCheck = readFileSync(join(root, "scripts", "version-check.mjs"), "utf8");
    expect(versionCheck).toContain("semverPattern");
    expect(versionCheck).toContain("CHANGELOG.md");
    expect(versionCheck).toContain("package-lock");
    expect(versionCheck).toContain("refs/tags/");
    expect(versionCheck).toContain("v${version}");

    expect(postPublishVerify).toContain('run("npm", ["view", packageSpec');
    expect(postPublishVerify).toContain("npx");
    expect(postPublishVerify).toContain("doctor");
    expect(postPublishVerify).toContain("init");
    expect(postPublishVerify).toContain("audit");
    expect(postPublishVerify).toContain("auditReport.summary?.fail !== 0");
    expect(postPublishVerify).toContain("AGENT_KIT_VERIFY_ATTEMPTS");
  });

  it("keeps upgrade preview fields in the diff implementation", () => {
    const diff = readFileSync(join(root, "src", "install", "diff.ts"), "utf8");
    const upgrade = readFileSync(join(root, "UPGRADE.md"), "utf8");

    expect(diff).toContain("wouldCreate");
    expect(diff).toContain("wouldWriteConflicts");
    expect(diff).toContain("wouldRefreshLibraryFolders");
    expect(diff).toContain("agentRoster");
    expect(diff).toContain("modelRouting");
    expect(diff).toContain("libraryFolders");
    expect(upgrade).toContain("preview.wouldCreate");
    expect(upgrade).toContain("preview.wouldWriteConflicts");
    expect(upgrade).toContain("libraryFolders.missing");
    expect(upgrade).toContain("modelRouting");
  });
});
