import { existsSync, readFileSync } from "node:fs";
import { isOptionalSkill, listKnownSkills, skillSourcePath } from "../catalog.js";
import { findPackageRoot } from "../utils/package-root.js";
import { emptyCollector } from "./copy-asset.js";
import { copyOptionalSkill } from "./roster-adapters.js";

export function listSkills(): string[] {
  return listKnownSkills();
}

export interface AddSkillResult {
  action: "created" | "unchanged" | "conflict" | "overwritten";
  target: string;
  dryRun: boolean;
}

export function addSkill(cwd: string, skillName: string, options: { force?: boolean; dryRun?: boolean } = {}): AddSkillResult {
  const packageRoot = findPackageRoot();
  const id = skillName.replace(/\.md$/, "").replace(/\/SKILL$/, "");
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new Error("Skill names may contain only lowercase letters, numbers, and hyphens.");
  }

  const available = listKnownSkills(packageRoot);
  if (!available.includes(id)) {
    throw new Error(`Unknown skill "${skillName}". Available skills: ${available.join(", ")}`);
  }

  const sourcePath = skillSourcePath(packageRoot, id);
  const target = `.cursor/skills/${id}/SKILL.md`;

  if (options.dryRun) {
    const existing = existsSync(`${cwd}/${target}`) ? readFileSync(`${cwd}/${target}`, "utf8") : null;
    const sourceContent = readFileSync(sourcePath, "utf8");
    let action: AddSkillResult["action"] = "created";
    if (existing === sourceContent) action = "unchanged";
    else if (existing) action = options.force ? "overwritten" : "conflict";
    return { action, target, dryRun: true };
  }

  const collector = emptyCollector();
  copyOptionalSkill(cwd, id, Boolean(options.force), collector);
  const action = collector.copied.includes(target)
    ? "created"
    : collector.unchanged.includes(target)
      ? "unchanged"
      : collector.overwritten.includes(target)
        ? "overwritten"
        : "conflict";
  return { action, target, dryRun: false };
}

export function assertAddableSkill(id: string): void {
  if (!isOptionalSkill(id) && !listKnownSkills().includes(id)) {
    throw new Error(`Unknown skill "${id}".`);
  }
}
