import { describe, expect, it } from "vitest";
import { loadCatalog } from "../src/catalog.js";
import { CLAUDE_TOOL_NAMES, CURSOR_AGENT_KEYS, frontmatterKeys, renderedRequiredTools, validateHostAgentFile } from "../src/install/host-frontmatter.js";
import { renderAgent } from "../src/install/roster-adapters.js";

/**
 * Each host loads only the frontmatter it documents. Claude refuses to launch a subagent whose
 * `tools` do not resolve; Cursor ignores unknown keys but has no `tools`; Antigravity needs
 * `subagent: true` to be invokable. These tests judge the renderer against those schemas.
 */

const catalog = loadCatalog();

describe("per-host agent frontmatter", () => {
  it("cursor files carry only Cursor's documented keys and make Planner readonly", () => {
    for (const id of catalog.defaultAgents) {
      const text = renderAgent("cursor", id);
      const keys = frontmatterKeys(text);
      for (const key of keys.keys()) expect(CURSOR_AGENT_KEYS.has(key), `${id}: ${key}`).toBe(true);
      expect(keys.has("tools")).toBe(false);
      expect(validateHostAgentFile("cursor", text)).toEqual([]);
    }
    expect(frontmatterKeys(renderAgent("cursor", "planner")).get("readonly")).toBe("true");
    expect(frontmatterKeys(renderAgent("cursor", "app-engineer")).has("readonly")).toBe(false);
  });

  it("claude files resolve every tool, preload the catalog skills, and raise effort for judgment agents", () => {
    for (const id of catalog.defaultAgents) {
      const text = renderAgent("claude", id);
      const keys = frontmatterKeys(text);
      expect(validateHostAgentFile("claude", text), id).toEqual([]);
      const tools = keys.get("tools");
      if (tools) {
        for (const tool of tools.split(",").map((item) => item.trim())) expect(CLAUDE_TOOL_NAMES.has(tool), `${id}: ${tool}`).toBe(true);
      }
      const skills = keys.get("skills") ?? "";
      for (const skill of catalog.agentSkills[id] ?? []) expect(skills, `${id} preloads ${skill}`).toContain(skill);
    }
    expect(frontmatterKeys(renderAgent("claude", "planner")).get("tools")).toBe("Read, Grep, Glob, Skill");
    // Browser-class agents inherit every tool because browser tooling is MCP-provided.
    expect(frontmatterKeys(renderAgent("claude", "design")).has("tools")).toBe(false);
    for (const id of ["planner", "security", "design"]) expect(frontmatterKeys(renderAgent("claude", id)).get("effort")).toBe("high");
    expect(frontmatterKeys(renderAgent("claude", "qa")).has("effort")).toBe(false);
  });

  it("copilot files have a description and nothing the kit invented", () => {
    for (const id of catalog.defaultAgents) {
      const text = renderAgent("copilot", id);
      expect(validateHostAgentFile("copilot", text), id).toEqual([]);
      const keys = frontmatterKeys(text);
      expect([...keys.keys()].sort()).toEqual(["description", "name"]);
    }
  });

  it("antigravity files are invokable subagents with the catalog skills attached", () => {
    for (const id of catalog.defaultAgents) {
      const text = renderAgent("antigravity", id);
      expect(validateHostAgentFile("antigravity", text), id).toEqual([]);
      const keys = frontmatterKeys(text);
      expect(keys.get("subagent")).toBe("true");
      expect(keys.get("mainAgent")).toBe("true");
      for (const skill of catalog.agentSkills[id] ?? []) expect(keys.get("skills") ?? "", `${id} attaches ${skill}`).toContain(`skills/${skill}`);
    }
  });

  it("the kit's required-tools contract survives on every host as a body line", () => {
    for (const host of ["cursor", "claude", "copilot", "antigravity"] as const) {
      expect(renderedRequiredTools(renderAgent(host, "qa"))).toEqual(["browser", "screenshot", "image-review"]);
      expect(renderedRequiredTools(renderAgent(host, "design"))).toEqual(["browser", "screenshot", "image-review"]);
    }
  });

  it("the kit vocabulary itself is rejected as Claude tools", () => {
    const stale = '---\nname: qa\ndescription: "x"\ntools: repo, edit, browser\n---\n# QA\n';
    const problems = validateHostAgentFile("claude", stale);
    expect(problems.join(" ")).toContain("Claude cannot resolve tools: repo, edit, browser");
  });
});
