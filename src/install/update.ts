import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import {
  CURSOR_ADAPTER_FILES,
  DEFAULT_AGENT_ROSTER_SOURCE,
  DEFAULT_AGENT_ROSTER_TARGET,
  DEFAULT_MODEL_ROUTING_SOURCE,
  DEFAULT_MODEL_ROUTING_TARGET,
  LIBRARY_FOLDERS,
  PACKAGE_NAME,
  PACKAGE_VERSION,
  ROOT_DOCS
} from "../config/defaults.js";
import type { InstallManifest } from "../config/types.js";
import { copyDirectory, ensureDir, resolveInside, sha256, writeText } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";
import { initProject, readManifest } from "./install.js";

export type UpdateAction = "created" | "updated" | "unchanged" | "kept-local" | "conflict" | "overwritten";

export interface UpdateFileResult {
  target: string;
  action: UpdateAction;
  conflictPath?: string;
  reason: string;
}

export interface UpdateResult {
  dryRun: boolean;
  files: UpdateFileResult[];
  libraryFoldersRefreshed: string[];
  manifestPath: string;
  summary: Record<UpdateAction, number>;
}

export interface UpdateOptions {
  cwd: string;
  force?: boolean;
  dryRun?: boolean;
}

interface PlanInput {
  target: string;
  sourcePath: string;
  installedHash: string | undefined;
  force: boolean;
}

function planFileUpdate(cwd: string, input: PlanInput): UpdateFileResult & { sourceContent: string } {
  const sourceContent = readFileSync(input.sourcePath, "utf8");
  const sourceHash = sha256(sourceContent);
  const targetPath = resolveInside(cwd, input.target);

  if (!existsSync(targetPath)) {
    return { target: input.target, action: "created", reason: "File is missing locally.", sourceContent };
  }

  const localHash = sha256(readFileSync(targetPath, "utf8"));

  if (localHash === sourceHash) {
    return { target: input.target, action: "unchanged", reason: "File already matches the current template.", sourceContent };
  }

  // Pristine install of an older template: safe to auto-update.
  if (input.installedHash && localHash === input.installedHash) {
    return { target: input.target, action: "updated", reason: "File was unmodified since install; applied the newer template.", sourceContent };
  }

  if (input.force) {
    return { target: input.target, action: "overwritten", reason: "Local changes overwritten because --force was used.", sourceContent };
  }

  // Locally modified. If the bundled template did not change, keep local edits silently.
  if (input.installedHash && input.installedHash === sourceHash) {
    return { target: input.target, action: "kept-local", reason: "File is locally customized and the template has not changed.", sourceContent };
  }

  return {
    target: input.target,
    action: "conflict",
    reason: "File is locally customized and the bundled template changed; review the conflict copy.",
    sourceContent
  };
}

function writeConflictCopy(cwd: string, target: string, content: string): string {
  const conflictRoot = join(cwd, ".agent-kit", "conflicts");
  const safeName = `${Date.now()}-${target.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
  const conflictPath = join(conflictRoot, safeName);
  writeText(conflictPath, content);
  return relative(cwd, conflictPath).replace(/\\/g, "/");
}

export function updateProject(options: UpdateOptions): UpdateResult {
  const cwd = options.cwd;
  const force = Boolean(options.force);
  const dryRun = Boolean(options.dryRun);
  const manifest = readManifest(cwd);

  if (!manifest) {
    // No previous install: update degrades to a fresh conflict-safe init.
    if (dryRun) {
      throw new Error("No .agent-kit/manifest.json found. Run agent-kit init first (or run update without --dry-run to install).");
    }
    const initResult = initProject({ cwd, force });
    const files: UpdateFileResult[] = [
      ...initResult.copied.map((target): UpdateFileResult => ({ target, action: "created", reason: "Installed by init fallback." })),
      ...initResult.unchanged.map((target): UpdateFileResult => ({ target, action: "unchanged", reason: "Already matched the template." })),
      ...initResult.overwritten.map((target): UpdateFileResult => ({ target, action: "overwritten", reason: "Overwritten by init --force fallback." })),
      ...initResult.conflicts.map((entry): UpdateFileResult => {
        const [target, conflictPath] = entry.split(" -> ");
        return {
          target: target ?? entry,
          action: "conflict",
          reason: "Local file differed from the template during init fallback.",
          ...(conflictPath ? { conflictPath } : {})
        };
      })
    ];
    return {
      dryRun,
      files,
      libraryFoldersRefreshed: [...LIBRARY_FOLDERS],
      manifestPath: ".agent-kit/manifest.json",
      summary: summarize(files)
    };
  }

  const packageRoot = findPackageRoot();
  const stack = manifest.stack ?? "next-supabase";
  const templateRoot = join(packageRoot, "templates", stack);
  if (!existsSync(templateRoot)) {
    throw new Error(`Unsupported stack profile in manifest: ${stack}`);
  }

  const files: UpdateFileResult[] = [];
  const templateHashes: Record<string, string> = {};

  const plans: Array<UpdateFileResult & { sourceContent: string }> = [];

  for (const doc of ROOT_DOCS) {
    const sourcePath = join(templateRoot, doc);
    templateHashes[doc] = sha256(readFileSync(sourcePath, "utf8"));
    plans.push(
      planFileUpdate(cwd, {
        target: doc,
        sourcePath,
        installedHash: manifest.templateHashes?.[doc],
        force
      })
    );
  }

  for (const adapter of CURSOR_ADAPTER_FILES) {
    plans.push(
      planFileUpdate(cwd, {
        target: adapter.target,
        sourcePath: join(packageRoot, adapter.source),
        installedHash: undefined,
        force
      })
    );
  }

  plans.push(
    planFileUpdate(cwd, {
      target: DEFAULT_AGENT_ROSTER_TARGET,
      sourcePath: join(packageRoot, DEFAULT_AGENT_ROSTER_SOURCE),
      installedHash: undefined,
      force
    }),
    planFileUpdate(cwd, {
      target: DEFAULT_MODEL_ROUTING_TARGET,
      sourcePath: join(packageRoot, DEFAULT_MODEL_ROUTING_SOURCE),
      installedHash: undefined,
      force
    })
  );

  for (const plan of plans) {
    const { sourceContent, ...fileResult } = plan;
    if (!dryRun) {
      if (plan.action === "created" || plan.action === "updated" || plan.action === "overwritten") {
        writeText(resolveInside(cwd, plan.target), sourceContent);
      } else if (plan.action === "conflict") {
        fileResult.conflictPath = writeConflictCopy(cwd, plan.target, sourceContent);
      }
    }
    files.push(fileResult);
  }

  if (!dryRun) {
    ensureDir(join(cwd, ".agent-kit"));
    for (const folder of LIBRARY_FOLDERS) {
      copyDirectory(join(packageRoot, folder), join(cwd, ".agent-kit", folder));
    }

    const updatedManifest: InstallManifest = {
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      stack,
      installedAt: manifest.installedAt,
      updatedAt: new Date().toISOString(),
      docs: [...ROOT_DOCS],
      libraryFolders: [...LIBRARY_FOLDERS],
      agentRoster: DEFAULT_AGENT_ROSTER_TARGET,
      modelRouting: DEFAULT_MODEL_ROUTING_TARGET,
      templateHashes
    };
    writeText(join(cwd, ".agent-kit", "manifest.json"), `${JSON.stringify(updatedManifest, null, 2)}\n`);
  }

  return {
    dryRun,
    files,
    libraryFoldersRefreshed: [...LIBRARY_FOLDERS],
    manifestPath: ".agent-kit/manifest.json",
    summary: summarize(files)
  };
}

function summarize(files: UpdateFileResult[]): Record<UpdateAction, number> {
  const summary: Record<UpdateAction, number> = {
    created: 0,
    updated: 0,
    unchanged: 0,
    "kept-local": 0,
    conflict: 0,
    overwritten: 0
  };
  for (const file of files) summary[file.action] += 1;
  return summary;
}
