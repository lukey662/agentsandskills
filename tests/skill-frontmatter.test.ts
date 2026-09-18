import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadCatalog, parseFrontmatter, skillSourcePath } from "../src/catalog.js";
import { initProject } from "../src/install/install.js";

const triggers: Record<string, string> = {
  planning: "what should we do",
  "nextjs-app-router": "proxy.ts",
  "supabase-auth-rls": "RLS",
  "postgres-migrations": "RLS",
  "owasp-security-review": "SSRF",
  "frontend-design": "looks generic",
  "accessibility-wcag": "keyboard",
  "browser-qa": "is this done",
  "testing-qa": "tests pass",
  "product-copy": "empty state",
  deslop: "last copy pass",
  ship: "ship it"
};

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

describe("default skill YAML descriptions", () => {
  it("are unique and include Use-when trigger phrases", () => {
    const catalog = loadCatalog();
    expect(catalog.defaultSkills).toEqual(Object.keys(triggers));
    const descriptions = catalog.defaultSkills.map((id) => {
      const markdown = readFileSync(skillSourcePath(process.cwd(), id), "utf8");
      const description = parseFrontmatter(markdown).description ?? "";
      const trigger = triggers[id] ?? "";
      expect(description, id).not.toBe("");
      expect(trigger, id).not.toBe("");
      expect(description.toLowerCase(), id).toContain(trigger.toLowerCase());
      return description;
    });
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("frontend-design detect YAML matches audit-only asks", () => {
    const markdown = readFileSync(skillSourcePath(process.cwd(), "frontend-design"), "utf8");
    const description = (parseFrontmatter(markdown).description ?? "").toLowerCase();
    expect(description).toContain("looks generic");
    expect(description).toContain("de-slop");
    expect(description).toContain("don't change the code");
    expect(description).toContain("user_guide.html looks bad");
    expect(description).toContain("kit-html");
  });

  it("init copies trigger phrases onto Cursor skills", () => {
    const root = mkdtempSync(join(tmpdir(), "agent-kit-frontmatter-"));
    roots.push(root);
    initProject({ cwd: root, activate: ["cursor"] });
    for (const [id, trigger] of Object.entries(triggers)) {
      const body = readFileSync(join(root, `.cursor/skills/${id}/SKILL.md`), "utf8");
      expect(body.toLowerCase(), id).toContain(trigger.toLowerCase());
    }
  });
});
