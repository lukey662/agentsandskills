import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT_DOCS } from "../config/defaults.js";
import { sha256 } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";

export interface DiffResult {
  missing: string[];
  unchanged: string[];
  changed: string[];
}

export function diffProject(cwd: string, stack = "next-supabase"): DiffResult {
  const packageRoot = findPackageRoot();
  const templateRoot = join(packageRoot, "templates", stack);
  const result: DiffResult = { missing: [], unchanged: [], changed: [] };

  for (const doc of ROOT_DOCS) {
    const target = join(cwd, doc);
    const template = join(templateRoot, doc);

    if (!existsSync(target)) {
      result.missing.push(doc);
      continue;
    }

    const targetHash = sha256(readFileSync(target, "utf8"));
    const templateHash = sha256(readFileSync(template, "utf8"));
    if (targetHash === templateHash) result.unchanged.push(doc);
    else result.changed.push(doc);
  }

  return result;
}
