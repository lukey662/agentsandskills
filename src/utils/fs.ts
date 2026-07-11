import { createHash, randomUUID } from "node:crypto";
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";

export function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function readTextIfExists(path: string): string | null {
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

export function writeText(path: string, content: string): void {
  ensureDir(dirname(path));
  const temporaryPath = join(dirname(path), `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`);
  try {
    writeFileSync(temporaryPath, content);
    renameSync(temporaryPath, path);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}

export function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export function resolveInside(root: string, requestedPath: string): string {
  const resolvedRoot = resolve(root);
  const resolvedPath = resolve(resolvedRoot, requestedPath);
  const rel = relative(resolvedRoot, resolvedPath);

  if (rel === ".." || rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`Unsafe path outside root: ${requestedPath}`);
  }

  return resolvedPath;
}

export function listFilesRecursive(root: string): string[] {
  if (!existsSync(root)) return [];

  const out: string[] = [];
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      let stats;
      try {
        stats = lstatSync(fullPath);
      } catch {
        continue;
      }

      if (stats.isSymbolicLink()) continue;

      if (stats.isDirectory()) {
        if (entry === "node_modules" || entry === ".git") continue;
        visit(fullPath);
      } else {
        out.push(relative(root, fullPath));
      }
    }
  };

  visit(root);
  return out.sort();
}

export interface CopyResult {
  action: "created" | "unchanged" | "conflict" | "overwritten";
  target: string;
  conflictPath?: string;
}

export interface ConflictProposalResult {
  conflictPath: string;
  metadataPath: string;
}

export function writeConflictProposal(
  targetRoot: string,
  targetRelativePath: string,
  proposedContent: string,
  options: { currentContent?: string | undefined; reason?: string; sourceVersion?: string } = {}
): ConflictProposalResult {
  const proposalHash = sha256(proposedContent);
  const safeTarget = targetRelativePath.replace(/[^a-zA-Z0-9_.-]/g, "__");
  const baseName = `${safeTarget}.${proposalHash.slice(0, 12)}`;
  const conflictRoot = join(targetRoot, ".agent-kit", "conflicts");
  const proposalPath = join(conflictRoot, `${baseName}.proposed`);
  const metadataPath = join(conflictRoot, `${baseName}.json`);
  const normalizedTarget = targetRelativePath.replace(/\\/g, "/");
  writeText(proposalPath, proposedContent);
  writeText(
    metadataPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        target: normalizedTarget,
        proposedSha256: proposalHash,
        ...(options.currentContent !== undefined ? { currentSha256: sha256(options.currentContent) } : {}),
        ...(options.reason ? { reason: options.reason } : {}),
        ...(options.sourceVersion ? { sourceVersion: options.sourceVersion } : {})
      },
      null,
      2
    )}\n`
  );
  return {
    conflictPath: relative(targetRoot, proposalPath).replace(/\\/g, "/"),
    metadataPath: relative(targetRoot, metadataPath).replace(/\\/g, "/")
  };
}

export function copyTextWithConflict(
  sourcePath: string,
  targetRoot: string,
  targetRelativePath: string,
  options: { force?: boolean; conflictRoot?: string } = {}
): CopyResult {
  const targetPath = resolveInside(targetRoot, targetRelativePath);
  const sourceContent = readFileSync(sourcePath, "utf8");
  const existingContent = readTextIfExists(targetPath);

  if (existingContent === null) {
    writeText(targetPath, sourceContent);
    return { action: "created", target: targetRelativePath };
  }

  if (sha256(existingContent) === sha256(sourceContent)) {
    return { action: "unchanged", target: targetRelativePath };
  }

  if (options.force) {
    writeText(targetPath, sourceContent);
    return { action: "overwritten", target: targetRelativePath };
  }

  const defaultConflictRoot = join(targetRoot, ".agent-kit", "conflicts");
  if (options.conflictRoot && resolve(options.conflictRoot) !== resolve(defaultConflictRoot)) {
    throw new Error("Custom conflict roots are no longer supported; proposals must stay under .agent-kit/conflicts.");
  }
  const proposal = writeConflictProposal(targetRoot, targetRelativePath, sourceContent, {
    currentContent: existingContent,
    reason: "Local content differs from the proposed package content."
  });

  return {
    action: "conflict",
    target: targetRelativePath,
    conflictPath: proposal.conflictPath
  };
}

export function copyDirectory(sourceRoot: string, targetRoot: string): void {
  ensureDir(dirname(targetRoot));
  cpSync(sourceRoot, targetRoot, {
    recursive: true,
    force: true,
    filter: (source) => !basename(source).startsWith(".DS_Store")
  });
}
