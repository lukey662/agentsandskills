import { join } from "node:path";
import { copyTextWithConflict, writeConflictProposal, writeText, type CopyResult } from "../utils/fs.js";
import { existsSync, readFileSync } from "node:fs";

export interface CopyCollector {
  copied: string[];
  unchanged: string[];
  conflicts: string[];
  overwritten: string[];
}

export function emptyCollector(): CopyCollector {
  return { copied: [], unchanged: [], conflicts: [], overwritten: [] };
}

export function recordCopy(collector: CopyCollector, result: CopyResult): void {
  if (result.action === "created") collector.copied.push(result.target);
  if (result.action === "unchanged") collector.unchanged.push(result.target);
  if (result.action === "overwritten") collector.overwritten.push(result.target);
  if (result.action === "conflict") {
    collector.conflicts.push(result.conflictPath ? `${result.target} -> ${result.conflictPath}` : result.target);
  }
}

export function copyFromPackage(
  cwd: string,
  packageRoot: string,
  source: string,
  target: string,
  force: boolean,
  collector: CopyCollector
): void {
  recordCopy(
    collector,
    copyTextWithConflict(join(packageRoot, source), cwd, target, {
      force,
      conflictRoot: join(cwd, ".agent-kit", "conflicts")
    })
  );
}

export function writeGenerated(
  cwd: string,
  relativePath: string,
  content: string,
  force: boolean,
  collector: CopyCollector
): void {
  const targetPath = join(cwd, relativePath);
  if (!force && existsSync(targetPath)) {
    const existing = readFileSync(targetPath, "utf8");
    if (existing === content) {
      collector.unchanged.push(relativePath);
      return;
    }
    const proposal = writeConflictProposal(cwd, relativePath, content, {
      currentContent: existing,
      reason: "Generated content changed while the local target is customized."
    });
    collector.conflicts.push(`${relativePath} -> ${proposal.conflictPath}`);
    return;
  }
  writeText(targetPath, content);
  collector.copied.push(relativePath);
}
