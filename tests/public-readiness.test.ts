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
    expect(guide).toContain("Run accessibility-wcag");
    expect(guide).toContain("Do not accept contrast from the screenshot alone");
    expect(guide).toContain("List commands run");
    expect(guide).toContain("Run ship");
    expect(guide).toContain("Reject LGTM, ship it");
    expect(guide).toContain("Reject guessing from the stack trace alone");
    expect(guide).toContain("Reject restoring the 17-doc OS");
    expect(guide).toContain("Reject `init --force` as the upgrade path");
    expect(guide).toContain("Reject using polish as a second design system");
    expect(guide).toContain("Reject optimizing from a guess");
    expect(guide).toContain("The session launches that owner");
    expect(guide).toContain("Act as the security agent. Review auth, RLS, IDOR, and secrets");
    expect(guide).toContain("Act as the copy agent. Review the rendered words in screenshots");
    expect(guide).toContain("**Copy** if public words changed");
    expect(guide).toContain("Launch in this order. Skip Security, Design, or Copy");
    const html = readFileSync(join(root, "USER_GUIDE.html"), "utf8");
    expect(html).toContain("Do not review code alone");
    expect(html).toContain("Say the change");
    expect(html).toContain("deslop");
    expect(html).toContain("catalog.json");
    expect(html).toContain("ask me what we need to set up");
    expect(html).toContain("Run accessibility-wcag");
    expect(html).toContain("Do not accept contrast from the screenshot alone");
    expect(html).toContain("List commands run");
    expect(html).toContain("Run ship");
    expect(html).toContain("Reject LGTM, ship it");
    expect(html).toContain("Reject guessing from the stack trace alone");
    expect(html).toMatch(/Reject restoring\s+the 17-doc OS/);
    expect(html).toMatch(/Reject\s+<code>init --force<\/code>\s+as the upgrade path/);
    expect(html).toMatch(/Reject using polish as a second design system/);
    expect(html).toContain("Reject optimizing from a guess");
    expect(html).toMatch(/The session launches that\s+owner/);
    expect(html).toContain("Act as the security agent. Review auth, RLS, IDOR, and secrets");
    expect(html).toContain("Act as the copy agent. Review the rendered words in screenshots");
    expect(html).toContain("Copy if public words changed");
    expect(html).toContain("Launch in this order. Skip Security, Design, or Copy");
    expect(html).not.toMatch(/<article class="ticket">/);
    expect(html).not.toMatch(/class="frame"/);
    expect(html).not.toMatch(/\.wordmark\s*\{[^}]*text-transform:\s*uppercase/);
    expect(html).not.toMatch(/\.kicker\s*\{[^}]*text-transform:\s*uppercase/);
    const start = html.slice(html.indexOf('id="start"'), html.indexOf('id="ask"'));
    expect(start).toContain('id="init-cmd"');
    expect(start).toContain("say the change");
    expect(start).not.toContain('id="plan-prompt"');
    expect(start).not.toContain("ask me what we need to set up");
    expect(html).toContain('class="skip"');
    expect(html).toContain("a:focus-visible");
    expect(html).toContain("button:focus-visible");
    expect(html.indexOf('id="flows"')).toBeGreaterThan(html.indexOf('id="start"'));
    expect(html.indexOf("Copy if public words changed")).toBeLessThan(html.indexOf('id="qa-feature-prompt"'));
    expect(html).toContain('data-view="user-guide"');
    expect(html).not.toMatch(/border-left\s*:/);
    const installedAgents = readFileSync(join(root, "templates/next-supabase/AGENTS.md"), "utf8");
    expect(installedAgents).toContain("the session launches them");
    expect(installedAgents).not.toContain("it does not run the other agents");
    const cursorRule = readFileSync(join(root, "templates/next-supabase/.cursor/rules/cursor-agent-kit.mdc"), "utf8");
    expect(cursorRule).toContain("This session launches Planner");
    expect(cursorRule).not.toContain("Use `@planner` to pick an owner");
    // The 0.3 council tree is gone from the source repo.
    for (const gone of [
      "checklists",
      "prompts",
      "profiles",
      "design-briefs",
      "rosters",
      "model-routing",
      "schemas",
      "antigravity",
      "src/studio",
      "src/research",
      "packages"
    ]) {
      expect(existsSync(join(root, gone)), gone).toBe(false);
    }
  });

  it("canonical QA files exist", () => {
    expect(existsSync(join(root, "agents/qa/agent.md"))).toBe(true);
    expect(existsSync(join(root, "skills/browser-qa/SKILL.md"))).toBe(true);
    expect(readFileSync(join(root, "skills/browser-qa/SKILL.md"), "utf8")).toContain("Do not review code alone");
    expect(readFileSync(join(root, ".github/workflows/release.yml"), "utf8")).toContain("previously staged version");
  });

  it("ROADMAP holds only the open queue", () => {
    const roadmap = readFileSync(join(root, "ROADMAP.md"), "utf8");
    expect(roadmap).toContain("## Current Next Actions");
    expect(roadmap).toContain("no Studio / audit / research / orchestrator on the default install");
    expect(roadmap).not.toContain("## Phase 1:");
    expect(roadmap.split("\n").length).toBeLessThan(60);
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
