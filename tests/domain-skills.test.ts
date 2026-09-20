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
    expect(skill).toContain("one error shape");
    expect(skill).toContain("Action or Route Handler boundary");
    expect(skill).toContain("additive");
    expect(skill).toContain("unsafe to retry");
    expect(skill).toContain("UNVERIFIED");
    expect(skill).toContain("official Next.js docs");
    expect(skill).toContain("sync `cookies()`");
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
    // Kit tokens live in this repo's DESIGN.md; the skill derives tokens from the product.
    expect(skill).not.toContain("#10100e");
    expect(skill).toContain("## Derive the direction");
    expect(skill).toContain("Object.");
    expect(skill).toContain("examples of the method, not a menu");
    expect(skill).toContain("## Type and rhythm");
    expect(skill).toContain("Do not mark selection or severity with a left edge stroke");
    expect(skill).toContain("Scan first");
    expect(skill).toContain("Ask what they need");
    expect(skill).toContain("Who has to succeed");
    expect(skill).toContain("what do you need from this pass");
    expect(skill).toContain("a **short** product `DESIGN.md`");
    expect(skill).toContain("STYLE_GUIDE.md");
    expect(skill).toContain("never overwrite");
    expect(skill).toContain("Quizzing them on hex");
    expect(skill).toContain("clear problem");
    expect(skill).toContain("judgment call");
    // The detect fail-closed tells appear once, in the detect row, not three times.
    expect(skill.match(/slogan hero/g)?.length).toBe(1);
    expect(skill).toContain("styled divs");
    expect(skill).toContain("tracked ALL-CAPS");
    expect(skill).toContain("swap / squint / signature");
    expect(skill).toContain("A clean fail-list pass is necessary, not sufficient");
    expect(skill).toContain("## Fail list");
    expect(skill).toContain("don't change the code");
    const design = readFileSync(join(process.cwd(), "agents/design/agent.md"), "utf8");
    expect(design).toContain("`setup`, `build`, `review`, or `detect`");
    expect(design).toContain("Detect is audit only");
    expect(design).toContain("swap / squint / signature");
    expect(design).toContain("requiredTools: [browser, screenshot, image-review]");
    expect(design).toContain("Setup may skip capture");
    // The agent points at the skill instead of restating it.
    expect(design).toContain("this file does not restate them");
    expect(design).not.toContain("slogan-hero");
  });

  it("planning names which domain skill the owner must run and launches them", () => {
    const skill = readSkill("planning");
    expect(skill).toContain("## Do");
    expect(skill).toContain("nextjs-app-router");
    expect(skill).toContain("`supabase-auth-rls` on any table");
    expect(skill).toContain("`nextjs-app-router` on any route");
    expect(skill).toContain("name setup, build, review, or detect");
    expect(skill).toContain("Design `setup` on a new product UI");
    expect(skill).toContain("`accessibility-wcag` because the screenshot looks fine");
    expect(skill).toContain("`testing-qa` on auth/RLS");
    // Payloads are referenced, not duplicated.
    expect(skill).toContain("payload from `AGENTS.md` → Spawn payloads");
    expect(skill).not.toContain("```text");
    expect(skill).toContain("finishing without launching the owner");
    expect(skill).toContain("a paste printed and left for the human to copy");
    // Shared ask policy replaces the one-question ritual.
    expect(skill).toContain("Ask before acting");
    expect(skill).toContain("one message with a default each");
    expect(skill).not.toContain("unconfirmed restatement");
    expect(skill).not.toContain("sounds good");
    expect(skill).toContain("Launch the owner");
    const planner = readFileSync(join(process.cwd(), "agents/planner/agent.md"), "utf8");
    expect(planner).toContain("Launch the owner");
    expect(planner).toContain("## Ask before acting");
    expect(planner).not.toContain("unconfirmed restatement");
    expect(planner).not.toContain("You do not run the other agents.");
    expect(planner).toContain("payload from `AGENTS.md`");
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
    expect(design).toContain("keyboard pass in the running browser, not a contrast guess");
  });

  it("browser-qa names console errors and failed same-origin requests", () => {
    const skill = readSkill("browser-qa");
    expect(skill).toContain("unexpected console errors");
    expect(skill).toContain("failed same-origin requests");
    expect(skill).toContain("Chrome DevTools MCP");
    expect(skill).toContain("Lighthouse");
    expect(skill).toContain("daily Chrome profile");
    const qa = readFileSync(join(process.cwd(), "agents/qa/agent.md"), "utf8");
    expect(qa).toContain("unexpected console errors");
    expect(qa).toContain("failed same-origin");
  });

  it("product-copy confirms Reader / Job / One action / Proof and rejects a marketing catalog", () => {
    const skill = readSkill("product-copy");
    expect(skill).toContain("Reader / Job / One action / Proof");
    expect(skill).toContain("Ask before acting");
    expect(skill).toContain("assumption");
    expect(skill).toContain("Importing a copy catalog");
    expect(skill).toContain("MESSAGING.md");
    expect(skill).toContain("runs `deslop` as the last pass");
    // Product-neutral: the kit's own guide voice lives in this repo's MESSAGING.md.
    expect(skill).not.toContain("unconfirmed restatement");
    expect(skill).not.toContain("USER_GUIDE");
    expect(skill).not.toContain("Seven Sweeps");
    const copy = readFileSync(join(process.cwd(), "agents/copy/agent.md"), "utf8");
    expect(copy).toContain("Reader");
    expect(copy).toContain("marketing catalog");
    expect(copy).toContain("## Ask before acting");
    expect(copy).not.toContain("unconfirmed restatement");
    const deslop = readSkill("deslop");
    expect(deslop).toContain("Claim sweep");
    expect(deslop).toContain("assumption");
    expect(deslop).toContain("## Structure tells");
    expect(deslop).not.toContain("Seven Sweeps");
  });

  it("testing-qa requires commands-run, RLS fail-closed, and does not replace browser-qa", () => {
    const skill = readSkill("testing-qa");
    expect(skill).toContain("supabase-auth-rls");
    expect(skill).toContain("browser-qa");
    expect(skill).toContain("accessibility-wcag");
    expect(skill).toContain("toBeVisible");
    expect(skill).toContain("Tests pass");
    expect(skill).toContain("it’s just a table");
    expect(skill).toContain("fail closed when another user or anon can read the row");
    expect(skill).toContain("commands:");
    expect(skill).toContain("| Unit |");
    expect(skill).toContain("| Regression |");
    expect(skill).toContain("| Smoke |");
    expect(skill).toContain("Adding Playwright as a required install of this kit");
    const qa = readFileSync(join(process.cwd(), "agents/qa/agent.md"), "utf8");
    expect(qa).toContain("testing-qa");
    expect(qa).toContain("browser-qa");
    expect(qa).toContain("Tests pass");
    expect(qa).toContain("listed the commands");
    expect(qa).toContain("LGTM, ship it");
  });

  it("ship requires go/no-go, rollback, and browser-qa paths for UI", () => {
    const skill = readSkill("ship");
    expect(skill).toContain("verdict: go | no-go");
    expect(skill).toContain("rollback:");
    expect(skill).toContain("browser-qa");
    expect(skill).toContain("LGTM, ship it");
    expect(skill).toContain("testing-qa");
    expect(skill).toContain("postgres-migrations");
    expect(skill).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(skill).toContain("We’ll set env in the dashboard later");
    expect(skill).toContain("does not replace");
    expect(skill).toContain("Kill switch");
    expect(skill).toContain("previous production deployment");
    expect(skill).toContain("git revert");
    expect(skill).toContain("axe-as-ship-gate");
    const qa = readFileSync(join(process.cwd(), "agents/qa/agent.md"), "utf8");
    expect(qa).toContain("ship");
    expect(qa).toContain("LGTM, ship it");
    const planning = readSkill("planning");
    expect(planning).toContain("`ship` because someone said “LGTM.”");
  });

  it("init installs the uplifted domain skills", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-domain-"));
    roots.push(root);
    initProject({ cwd: root, activate: ["cursor"] });
    const next = readFileSync(join(root, ".agents/skills/nextjs-app-router/SKILL.md"), "utf8");
    expect(next).toContain("proxy.ts");
    expect(existsSync(join(root, ".agents/skills/supabase-auth-rls/SKILL.md"))).toBe(true);
    const engineer = readFileSync(join(root, ".cursor/agents/app-engineer.md"), "utf8");
    expect(engineer).toContain("a small route, form, or table is not exempt");
    expect(engineer).toContain("## Ask before acting");
    const design = readFileSync(join(root, ".cursor/agents/design.md"), "utf8");
    expect(design).toContain("Detect is audit only");
    expect(design).toContain("Required tools: browser, screenshot, image-review");
    expect(design).toContain("`setup`, `build`, `review`, or `detect`");
    const planning = readFileSync(join(root, ".agents/skills/planning/SKILL.md"), "utf8");
    expect(planning).toContain("finishing without launching the owner");
    expect(planning).toContain("payload from `AGENTS.md` → Spawn payloads");
    const agentsDoc = readFileSync(join(root, "AGENTS.md"), "utf8");
    expect(agentsDoc).toContain("Act as design. This is a new repo. Scan what is already here, then ask me what we need to set up");
    expect(agentsDoc).toContain("Do not review code alone. Open the app, capture desktop and mobile screenshots");
    expect(agentsDoc).toContain("## Ask before acting");
    const planner = readFileSync(join(root, ".cursor/agents/planner.md"), "utf8");
    expect(planner).toContain("Launch the owner");
    expect(planner).not.toContain("You do not run the other agents.");
    expect(planner).toContain("payload from `AGENTS.md`");
    const guide = readFileSync(join(root, "USER_GUIDE.md"), "utf8");
    expect(guide).toContain("ask me what we need to set up");
    expect(guide).toContain("The session launches that owner");
    expect(guide).toContain("Act as the security agent. Review auth, RLS, IDOR, and secrets");
    expect(guide).toContain("Act as the copy agent. Review the rendered words in screenshots");
    const a11y = readFileSync(join(root, ".agents/skills/accessibility-wcag/SKILL.md"), "utf8");
    expect(a11y).toContain("Contrast looks fine in the screenshot");
    expect(a11y).toContain("keyboard-only pass works on the changed flow in the running UI");
    const qa = readFileSync(join(root, ".cursor/agents/qa.md"), "utf8");
    expect(qa).toContain("accessibility-wcag");
    expect(qa).toContain("keyboard-only pass on the changed flow");
    expect(qa).toContain("Tests pass");
    const testing = readFileSync(join(root, ".agents/skills/testing-qa/SKILL.md"), "utf8");
    expect(testing).toContain("Tests pass");
    expect(testing).toContain("fail closed when another user or anon can read the row");
    expect(testing).toContain("does not replace");
    const ship = readFileSync(join(root, ".agents/skills/ship/SKILL.md"), "utf8");
    expect(ship).toContain("LGTM, ship it");
    expect(ship).toContain("rollback");
    expect(ship).toContain("browser-qa");
    expect(ship).toContain("Kill switch");
    expect(qa).toContain("LGTM, ship it");
    const frontend = readFileSync(join(root, ".agents/skills/frontend-design/SKILL.md"), "utf8");
    expect(frontend).toContain("don't change the code");
    expect(frontend).toContain("judgment call");
    const browser = readFileSync(join(root, ".agents/skills/browser-qa/SKILL.md"), "utf8");
    expect(browser).toContain("unexpected console errors");
    expect(existsSync(join(root, ".agents/skills/web-performance/SKILL.md"))).toBe(false);
  });
});
