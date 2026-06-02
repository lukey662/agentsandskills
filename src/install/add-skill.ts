import { existsSync } from "node:fs";
import { join } from "node:path";
import { copyTextWithConflict, listFilesRecursive } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";

export function listSkills(): string[] {
  const packageRoot = findPackageRoot();
  return listFilesRecursive(join(packageRoot, "skills")).filter((file) => file.endsWith(".md"));
}

export function addSkill(cwd: string, skillName: string, options: { force?: boolean } = {}): string {
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

  const result = copyTextWithConflict(sourcePath, cwd, join(".agent-kit", "skills", normalized), {
    force: Boolean(options.force),
    conflictRoot: join(cwd, ".agent-kit", "conflicts")
  });

  return `${result.action}: ${result.target}`;
}
