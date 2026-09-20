import { join } from "node:path";
import { copyTextWithConflict, writeConflictProposal, writeText, type CopyResult, sha256 } from "../utils/fs.js";
import { existsSync, readFileSync } from "node:fs";

export interface CopyCollector {
  copied: string[];
  unchanged: string[];
  updated: string[];
  conflicts: string[];
  overwritten: string[];
}

export function emptyCollector(): CopyCollector {
  return { copied: [], unchanged: [], updated: [], conflicts: [], overwritten: [] };
}

export function recordCopy(collector: CopyCollector, result: CopyResult): void {
  if (result.action === "created") collector.copied.push(result.target);
  if (result.action === "unchanged") collector.unchanged.push(result.target);
  if (result.action === "updated") collector.updated.push(result.target);
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
  collector: CopyCollector,
  installedHash?: string
): void {
  recordCopy(
    collector,
    copyTextWithConflict(join(packageRoot, source), cwd, target, {
      force,
      conflictRoot: join(cwd, ".agent-kit", "conflicts"),
      ...(installedHash !== undefined ? { installedHash } : {})
    })
  );
}

export function writeGenerated(cwd: string, relativePath: string, content: string, force: boolean, collector: CopyCollector, installedHash?: string): void {
  const targetPath = join(cwd, relativePath);
  const exists = existsSync(targetPath);
  if (!force && exists) {
    const existing = readFileSync(targetPath, "utf8");
    if (existing === content) {
      collector.unchanged.push(relativePath);
      return;
    }
    if (installedHash && sha256(existing) === installedHash) {
      writeText(targetPath, content);
      collector.updated.push(relativePath);
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
  if (force && exists) {
    collector.overwritten.push(relativePath);
  } else {
    collector.copied.push(relativePath);
  }
}
