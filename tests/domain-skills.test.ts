import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/install/install.js";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function readSkill(id: string): string {
  return readFileSync(join(process.cwd(), "skills", id, "SKILL.md"), "utf8");
}

describe("domain skill uplifts", () => {
  it("nextjs-app-router names App Router contracts and rejects Pages Router plus non-Supabase auth vendors", () => {
    const skill = readSkill("nextjs-app-router");
    expect(skill).toContain("Server Components are the default");
    expect(skill).toContain("proxy.ts");
    expect(skill).toContain("awaited");
    expect(skill).toContain("getServerSideProps");
    expect(skill).toContain("Supabase");
    expect(skill).toContain("Clerk");
    expect(skill).toContain("open the running route");
  });

  it("supabase-auth-rls keeps service role server-only and treats UI as not authorization", () => {
    const skill = readSkill("supabase-auth-rls");
    expect(skill).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(skill).toContain("NEXT_PUBLIC_");
    expect(skill).toContain("getUser()");
    expect(skill).toContain("ENABLE ROW LEVEL SECURITY");
    expect(skill).toContain("UI checks are not treated as authorization");
    expect(skill).toContain("auth.uid()");
  });

  it("postgres-migrations requires RLS in the same change", () => {
    const skill = readSkill("postgres-migrations");
    expect(skill).toContain("RLS lands in this change");
    expect(skill).toContain("GRANT");
    expect(skill).toContain("We’ll add RLS after launch");
  });

  it("owasp-security-review maps Top 10 onto Server Actions, RLS, and SSRF", () => {
    const skill = readSkill("owasp-security-review");
    expect(skill).toContain("SSRF");
    expect(skill).toContain("Server Actions");
    expect(skill).toContain("IDOR");
    expect(skill).toContain("user_id");
  });

  it("frontend-design names modes, surfaces, setup intake, and DESIGN.md before CSS", () => {
    const skill = readSkill("frontend-design");
    expect(skill).toContain("| `setup` |");
    expect(skill).toContain("| `build` |");
    expect(skill).toContain("| `review` |");
    expect(skill).toContain("| `detect` |");
    expect(skill).toContain("inside-design-system");
    expect(skill).toContain("Read `DESIGN.md`");
    expect(skill).toContain("code-certain");
    expect(skill).toContain("inferred");
    expect(skill).toContain("Installing a design MCP");
    expect(skill).toContain("#10100e");
    expect(skill).toContain("Do not mark selection or severity with a left edge stroke");
    expect(skill).toContain("Scan first");
    expect(skill).toContain("Ask what they need");
    expect(skill).toContain("Who has to succeed");
    expect(skill).toContain("what do you need from this pass");
    expect(skill).toContain("a **short** product `DESIGN.md`");
    expect(skill).toContain("STYLE_GUIDE.md");
    expect(skill).toContain("do not overwrite");
    expect(skill).toContain("Quizzing them on hex");
    const design = readFileSync(join(process.cwd(), "agents/design/agent.md"), "utf8");
    expect(design).toContain("`setup`, `build`, `review`, or `detect`");
    expect(design).toContain("Detect means audit only");
    expect(design).toContain("requiredTools: [browser, screenshot, image-review]");
    expect(design).toContain("Setup may skip capture");
  });

  it("planning names which domain skill the owner must run", () => {
    const skill = readSkill("planning");
    expect(skill).toContain("nextjs-app-router");
    expect(skill).toContain("Skipping `supabase-auth-rls`");
    expect(skill).toContain("Skipping `nextjs-app-router`");
    expect(skill).toContain("name setup, build, review, or detect");
    expect(skill).toContain("Skipping Design `setup`");
    expect(skill).toContain("Skipping `accessibility-wcag`");
    expect(skill).toContain("contrast looks fine in the screenshot");
  });

  it("accessibility-wcag requires a keyboard pass in the running UI and rejects screenshot-only contrast", () => {
    const skill = readSkill("accessibility-wcag");
    expect(skill).toContain("WCAG 2.1 AA");
    expect(skill).toContain("keyboard-only pass works on the changed flow in the running UI");
    expect(skill).toContain("Contrast looks fine in the screenshot");
    expect(skill).toContain("htmlFor");
    expect(skill).toContain("Installing axe");
    expect(skill).toContain("browser-qa");
    expect(skill).toContain("supabase-auth-rls");
    expect(skill).not.toContain("requiredTools: [axe]");
    const qa = readFileSync(join(process.cwd(), "agents/qa/agent.md"), "utf8");
    expect(qa).toContain("accessibility-wcag");
    expect(qa).toContain("Contrast looks fine in the screenshot");
    expect(qa).toContain("keyboard-only pass on the changed flow");
    const design = readFileSync(join(process.cwd(), "agents/design/agent.md"), "utf8");
    expect(design).toContain("accessibility-wcag");
    expect(design).toContain("frontend-design` does not replace it");
  });

  it("testing-qa does not replace domain skills or browser-qa", () => {
    const skill = readSkill("testing-qa");
    expect(skill).toContain("supabase-auth-rls");
    expect(skill).toContain("browser-qa");
  });

  it("init installs the uplifted domain skills", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-domain-"));
    roots.push(root);
    initProject({ cwd: root, activate: ["cursor"] });
    const next = readFileSync(join(root, ".cursor/skills/nextjs-app-router/SKILL.md"), "utf8");
    expect(next).toContain("proxy.ts");
    expect(existsSync(join(root, ".cursor/skills/supabase-auth-rls/SKILL.md"))).toBe(true);
    const engineer = readFileSync(join(root, ".cursor/agents/app-engineer.md"), "utf8");
    expect(engineer).toContain("Do not treat a small route, form, or table as exempt");
    const design = readFileSync(join(root, ".cursor/agents/design.md"), "utf8");
    expect(design).toContain("Detect means audit only");
    expect(design).toContain("requiredTools: [browser, screenshot, image-review]");
    expect(design).toContain("`setup`, `build`, `review`, or `detect`");
    const guide = readFileSync(join(root, "USER_GUIDE.md"), "utf8");
    expect(guide).toContain("ask me what we need to set up");
    const a11y = readFileSync(join(root, ".cursor/skills/accessibility-wcag/SKILL.md"), "utf8");
    expect(a11y).toContain("Contrast looks fine in the screenshot");
    expect(a11y).toContain("keyboard-only pass works on the changed flow in the running UI");
    const qa = readFileSync(join(root, ".cursor/agents/qa.md"), "utf8");
    expect(qa).toContain("accessibility-wcag");
    expect(qa).toContain("keyboard-only pass on the changed flow");
  });
});
