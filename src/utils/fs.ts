import { createHash } from "node:crypto";
import { cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
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
  writeFileSync(path, content);
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

  const conflictRoot = options.conflictRoot ?? join(targetRoot, ".agent-kit", "conflicts");
  const safeName = `${Date.now()}-${targetRelativePath.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
  const conflictPath = join(conflictRoot, safeName);
  writeText(conflictPath, sourceContent);

  return {
    action: "conflict",
    target: targetRelativePath,
    conflictPath: relative(targetRoot, conflictPath)
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
