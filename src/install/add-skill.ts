import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { copyTextWithConflict, listFilesRecursive, readTextIfExists, sha256, type CopyResult } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";

export function listSkills(): string[] {
  const packageRoot = findPackageRoot();
  return listFilesRecursive(join(packageRoot, "skills")).filter((file) => file.endsWith(".md"));
}

export interface AddSkillResult extends CopyResult {
  dryRun: boolean;
}

export function addSkill(cwd: string, skillName: string, options: { force?: boolean; dryRun?: boolean } = {}): AddSkillResult {
  const packageRoot = findPackageRoot();
  const normalized = skillName.endsWith(".md") ? skillName : `${skillName}.md`;

  if (!/^[a-z0-9-]+\.md$/.test(normalized)) {
    throw new Error("Skill names may contain only lowercase letters, numbers, and hyphens.");
  }

  const sourcePath = join(packageRoot, "skills", normalized);

  if (!existsSync(sourcePath)) {
    const available = listSkills().join(", ");
    throw new Error(`Unknown skill "${skillName}". Available skills: ${available}`);
  }

  const targetRelativePath = join(".agent-kit", "skills", normalized);

  if (options.dryRun) {
    const existing = readTextIfExists(join(cwd, targetRelativePath));
    const sourceContent = readFileSync(sourcePath, "utf8");
    let action: CopyResult["action"];
    if (existing === null) action = "created";
    else if (sha256(existing) === sha256(sourceContent)) action = "unchanged";
    else action = options.force ? "overwritten" : "conflict";
    return { action, target: targetRelativePath, dryRun: true };
  }

  const result = copyTextWithConflict(sourcePath, cwd, targetRelativePath, {
    force: Boolean(options.force),
    conflictRoot: join(cwd, ".agent-kit", "conflicts")
  });

  return { ...result, dryRun: false };
}
