import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { findPackageRoot } from "./utils/package-root.js";

export interface Catalog {
  schemaVersion: number;
  defaultAgents: string[];
  optionalAgents: string[];
  defaultSkills: string[];
  optionalSkills: string[];
  screenshotFailClosed: string;
}

let cached: Catalog | null = null;

export function loadCatalog(packageRoot = findPackageRoot()): Catalog {
  if (cached && packageRoot === findPackageRoot()) return cached;
  const parsed = JSON.parse(readFileSync(join(packageRoot, "catalog.json"), "utf8")) as Catalog;
  cached = parsed;
  return parsed;
}

export function resetCatalogCache(): void {
  cached = null;
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
  const name = raw.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = raw.match(/^description:\s*(.+)$/m)?.[1]?.trim();
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

function parseYamlList(frontmatter: string, key: string): string[] | undefined {
  const line = frontmatter.match(new RegExp(`^${key}:\\s*\\[(.*)\\]\\s*$`, "m"));
  if (!line?.[1]) return undefined;
  return line[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
