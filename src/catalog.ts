import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { findPackageRoot } from "./utils/package-root.js";

/** Ids of the canonical handoff prompts. Six agents, Design's new-repo setup variant, and the release go/no-go. */
export type SpawnPayloadId = "planner" | "app-engineer" | "security" | "design" | "design-setup" | "qa" | "copy" | "ship";

export interface Catalog {
  schemaVersion: number;
  defaultAgents: string[];
  optionalAgents: string[];
  defaultSkills: string[];
  optionalSkills: string[];
  /**
   * Skills each agent must run, by agent id. Claude preloads them through the subagent `skills:`
   * field and Antigravity through `skills:` paths, so the gate skills are in context at launch
   * rather than discovered by description.
   */
  agentSkills: Record<string, string[]>;
  screenshotFailClosed: string;
  /** Shared ask-before-acting rule. Rendered into AGENTS.md so every agent context has it once. */
  askPolicy: string;
  /**
   * The only copy of each handoff prompt. AGENTS.md, USER_GUIDE.md, the Copilot and Antigravity
   * generators, and the agent files all read or are tested against this map so the text cannot drift.
   */
  spawnPayloads: Record<SpawnPayloadId, string>;
}

const catalogByRoot = new Map<string, Catalog>();

export function loadCatalog(packageRoot = findPackageRoot()): Catalog {
  const existing = catalogByRoot.get(packageRoot);
  if (existing) return existing;
  const parsed = JSON.parse(readFileSync(join(packageRoot, "catalog.json"), "utf8")) as Catalog;
  catalogByRoot.set(packageRoot, parsed);
  return parsed;
}

export function resetCatalogCache(): void {
  catalogByRoot.clear();
}

export function agentSourcePath(packageRoot: string, id: string): string {
  const main = join(packageRoot, "agents", id, "agent.md");
  if (existsSync(main)) return main;
  const optional = join(packageRoot, "agents", "optional", id, "agent.md");
  if (existsSync(optional)) return optional;
  throw new Error(`Unknown agent "${id}".`);
}

export function skillSourcePath(packageRoot: string, id: string): string {
  const main = join(packageRoot, "skills", id, "SKILL.md");
  if (existsSync(main)) return main;
  const optional = join(packageRoot, "skills", "optional", id, "SKILL.md");
  if (existsSync(optional)) return optional;
  throw new Error(`Unknown skill "${id}".`);
}

export function listKnownAgents(packageRoot = findPackageRoot()): string[] {
  const catalog = loadCatalog(packageRoot);
  return [...catalog.defaultAgents, ...catalog.optionalAgents];
}

export function listKnownSkills(packageRoot = findPackageRoot()): string[] {
  const catalog = loadCatalog(packageRoot);
  return [...catalog.defaultSkills, ...catalog.optionalSkills];
}

export function isOptionalAgent(id: string, packageRoot = findPackageRoot()): boolean {
  return loadCatalog(packageRoot).optionalAgents.includes(id);
}

export function isOptionalSkill(id: string, packageRoot = findPackageRoot()): boolean {
  return loadCatalog(packageRoot).optionalSkills.includes(id);
}

export function parseFrontmatter(markdown: string): { name?: string; description?: string; tools?: string[]; requiredTools?: string[]; body: string } {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { body: markdown };
  const raw = match[1] ?? "";
  const body = match[2] ?? "";
  const name = unquote(raw.match(/^name:\s*(.+)$/m)?.[1]?.trim());
  const description = unquote(raw.match(/^description:\s*(.+)$/m)?.[1]?.trim());
  const tools = parseYamlList(raw, "tools");
  const requiredTools = parseYamlList(raw, "requiredTools");
  return {
    ...(name ? { name } : {}),
    ...(description ? { description } : {}),
    ...(tools ? { tools } : {}),
    ...(requiredTools ? { requiredTools } : {}),
    body
  };
}

/** Rendered host files double-quote scalars so colons in descriptions stay valid YAML. Canonical files do not. */
function unquote(value: string | undefined): string | undefined {
  if (!value) return value;
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return value;
}

function parseYamlList(frontmatter: string, key: string): string[] | undefined {
  const line = frontmatter.match(new RegExp(`^${key}:\\s*\\[(.*)\\]\\s*$`, "m"));
  if (!line?.[1]) return undefined;
  return line[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
