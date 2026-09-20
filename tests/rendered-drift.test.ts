import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadCatalog, parseFrontmatter } from "../src/catalog.js";
import { requiredToolsLine } from "../src/install/roster-adapters.js";
import { agentTargetPath, renderAgent, type AgentHost } from "../src/install/roster-adapters.js";
import { initProject } from "../src/install/install.js";

/**
 * The IDE reads the rendered copy, not the canonical one. If they drift, the newest playbook
 * never reaches the agent. A fresh init must render every host file exactly as the renderer does
 * today, and every rendered body must be the canonical body plus the one required-tools line.
 */

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function temp(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-drift-"));
  roots.push(root);
  return root;
}

const HOSTS: AgentHost[] = ["cursor", "claude", "codex", "copilot", "antigravity"];

describe("rendered layers match canonical sources", () => {
  it("every host file equals the current render and carries the canonical body", () => {
    const root = temp();
    initProject({ cwd: root, activate: ["all"] });
    const catalog = loadCatalog();

    for (const id of catalog.defaultAgents) {
      const canonical = readFileSync(join(process.cwd(), "agents", id, "agent.md"), "utf8");
      const meta = parseFrontmatter(canonical);
      const expectedBody = requiredToolsLine(meta.requiredTools ?? []) + meta.body.replace(/^\n/, "");

      for (const host of HOSTS) {
        const rendered = readFileSync(join(root, agentTargetPath(host, id)), "utf8");
        expect(rendered, `${host}/${id}`).toBe(renderAgent(host, id));
        if (host === "codex") {
          expect(rendered).toContain(canonical.replace(/"""/g, '\\"\\"\\"'));
        } else {
          expect(parseFrontmatter(rendered).body.replace(/^\n/, ""), `${host}/${id} body`).toBe(expectedBody);
          expect(parseFrontmatter(rendered).description, `${host}/${id} description`).toBe(meta.description);
        }
      }
    }
  });

  it(".agents/skills and .claude/skills are byte-equal to skills/", () => {
    const root = temp();
    initProject({ cwd: root, activate: ["all"] });
    const catalog = loadCatalog();
    for (const id of catalog.defaultSkills) {
      const canonical = readFileSync(join(process.cwd(), "skills", id, "SKILL.md"), "utf8");
      expect(readFileSync(join(root, ".agents/skills", id, "SKILL.md"), "utf8")).toBe(canonical);
      expect(readFileSync(join(root, ".claude/skills", id, "SKILL.md"), "utf8")).toBe(canonical);
    }
  });

  it("codex reasoning effort is high for the judgment agents and medium for the rest", () => {
    const root = temp();
    initProject({ cwd: root, activate: ["codex"] });
    for (const id of ["planner", "security", "design"]) {
      expect(readFileSync(join(root, ".codex/agents", `${id}.toml`), "utf8")).toContain('model_reasoning_effort = "high"');
    }
    for (const id of ["app-engineer", "qa", "copy"]) {
      expect(readFileSync(join(root, ".codex/agents", `${id}.toml`), "utf8")).toContain('model_reasoning_effort = "medium"');
    }
  });
});
