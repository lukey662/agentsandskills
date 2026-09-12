import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  name: string;
  version: string;
  bin?: Record<string, string>;
  files?: string[];
  scripts?: Record<string, string>;
};

describe("public package readiness", () => {
  it("ships a slim product identity", () => {
    expect(packageJson.name).toBe("@appsforgood/next-supabase-kit");
    expect(packageJson.bin?.["agent-kit"]).toBe("dist/index.js");
    expect(packageJson.bin?.["agents-and-skills"]).toBe("dist/index.js");
    expect(packageJson.files).toContain("catalog.json");
    expect(packageJson.files).toContain("USER_GUIDE.md");
    expect(packageJson.files).toContain("USER_GUIDE.html");
    expect(packageJson.files).toContain("agents");
    expect(packageJson.files).toContain("skills");
    expect(packageJson.scripts?.smoke).toBe("node dist/index.js doctor");
  });

  it("README points at the user guide first", () => {
    const readme = readFileSync(join(root, "README.md"), "utf8");
    expect(readme).toContain("USER_GUIDE.html");
    expect(readme).toContain("browser-qa");
    expect(readme).not.toContain("agent-kit session");
    expect(readme).not.toContain("agent-kit orchestrate");
  });

  it("USER_GUIDE keeps the screenshot fail-closed rule", () => {
    const guide = readFileSync(join(root, "USER_GUIDE.md"), "utf8");
    expect(guide).toContain("Do not review code alone");
    expect(guide).toContain("A user-visible change is not done until someone opened the running UI");
    expect(guide).toContain("@planner");
    expect(guide).toContain("browser-qa");
    expect(guide).toContain("deslop");
    expect(guide).toContain("npx agent-kit guide");
    expect(guide).toContain("catalog.json");
    expect(guide).toContain("ask me what we need to set up");
    const html = readFileSync(join(root, "USER_GUIDE.html"), "utf8");
    expect(html).toContain("Do not review code alone");
    expect(html).toContain("Ask one specialist");
    expect(html).toContain("deslop");
    expect(html).toContain("catalog.json");
    expect(html).toContain("ask me what we need to set up");
    expect(html).toContain('data-view="user-guide"');
    expect(html).not.toMatch(/border-left\s*:/);
    const distinct = readFileSync(join(root, "checklists/frontend-distinctiveness.md"), "utf8");
    expect(distinct).toContain("left selection rail");
    expect(distinct).toContain("thick left border");
  });

  it("canonical QA files exist", () => {
    expect(existsSync(join(root, "agents/qa/agent.md"))).toBe(true);
    expect(existsSync(join(root, "skills/browser-qa/SKILL.md"))).toBe(true);
    expect(readFileSync(join(root, "skills/browser-qa/SKILL.md"), "utf8")).toContain("Do not review code alone");
  });

  it("ROADMAP Phase 10 is the working queue", () => {
    const roadmap = readFileSync(join(root, "ROADMAP.md"), "utf8");
    expect(roadmap).toContain("## Phase 10:");
    expect(roadmap).toContain("#### 10.1 `accessibility-wcag` playbook");
    expect(roadmap).toContain("Do not restore session, Studio, research, or `orchestrate` as the default install.");
    expect(roadmap).toContain("## Current Next Actions");
    expect(roadmap.indexOf("## Phase 10:")).toBeLessThan(roadmap.indexOf("## Phase 1:"));
  });

  it("post-publish verify uses the 0.4 CLI, not audit or orchestrate", () => {
    const source = readFileSync(join(root, "scripts/post-publish-verify.mjs"), "utf8");
    expect(source).toContain('init", "--stack", "next-supabase", "--activate", "all"');
    expect(source).toContain('["doctor"]');
    expect(source).toContain('adapter", "validate", "all"');
    expect(source.indexOf("running published init")).toBeLessThan(source.indexOf("running published doctor"));
    expect(source).not.toContain("orchestrate");
    expect(source).not.toContain("min-readiness");
    expect(source).not.toContain("audit --json");
  });
});
