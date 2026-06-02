import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  name: string;
  publishConfig?: { access?: string };
  bin?: Record<string, string>;
  files?: string[];
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
    expect(packageJson.name).toBe("@agent-skills/next-supabase-kit");
    expect(packageJson.publishConfig?.access).toBe("public");
    expect(packageJson.bin?.["agent-kit"]).toBe("dist/index.js");
    expect(packageJson.files).toContain("RESEARCH_CITATION_POLICY.md");
    expect(packageJson.files).toContain("research/summaries");
    expect(packageJson.files).toContain("research/proposed-updates.md");
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
    const packaged = packagedPublicFiles().map((file) => file.replace(root, "").replace(/^\/+/, ""));
    expect(packaged.some((file) => file.startsWith("research/findings/"))).toBe(false);
    expect(packaged).toContain("research/summaries/scan-overview.md");
    expect(packaged).toContain("research/proposed-updates.md");
    expect(packaged).toContain("RESEARCH_CITATION_POLICY.md");
  });

  it("validates the default agent council contract", () => {
    const roster = JSON.parse(readFileSync(join(root, "rosters", "next-supabase-default-council.json"), "utf8")) as {
      required: boolean;
      defaultWorkflow: string;
      agents: Array<{ id: string; skills?: string[]; defaultFor?: string[] }>;
      workflows: Array<{ id: string; sequence?: string[]; council?: string[] }>;
    };
    const agentIds = new Set(roster.agents.map((agent) => agent.id));
    const planner = roster.agents.find((agent) => agent.id === "planner");
    const coreChange = roster.workflows.find((workflow) => workflow.id === "core-change");

    expect(roster.required).toBe(true);
    expect(roster.defaultWorkflow).toBe("planning");
    expect(agentIds).toContain("planner");
    expect(agentIds).toContain("lead-architect");
    expect(agentIds).toContain("security-reviewer");
    expect(agentIds).toContain("qa-engineer");
    expect(planner?.defaultFor).toContain("planning");
    expect(planner?.skills).toContain("planning-council");
    expect(coreChange?.sequence).toContain("lead-architect");
    expect(coreChange?.council).toContain("lead-architect");
  });
});
