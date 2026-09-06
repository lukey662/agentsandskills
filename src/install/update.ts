import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PACKAGE_VERSION } from "../config/defaults.js";
import type { InstallManifest } from "../config/types.js";
import { resolveInside, sha256, writeConflictProposal, writeText } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";
import { planFileUpdate, type PlannedUpdateAction } from "./file-update-plan.js";
import { initProject, readManifest } from "./install.js";
import { listManagedAssets } from "./managed-assets.js";
import type { IdeTarget } from "./ide-activate.js";

export type UpdateAction = PlannedUpdateAction;

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

function summarize(files: UpdateFileResult[]): Record<UpdateAction, number> {
  return {
    created: files.filter((file) => file.action === "created").length,
    unchanged: files.filter((file) => file.action === "unchanged").length,
    updated: files.filter((file) => file.action === "updated").length,
    "kept-local": files.filter((file) => file.action === "kept-local").length,
    conflict: files.filter((file) => file.action === "conflict").length,
    overwritten: files.filter((file) => file.action === "overwritten").length
  };
}

export function updateProject(options: UpdateOptions): UpdateResult {
  const cwd = options.cwd;
  const force = Boolean(options.force);
  const dryRun = Boolean(options.dryRun);
  const manifest = readManifest(cwd);

  if (!manifest) {
    if (dryRun) {
      throw new Error("No .agent-kit/manifest.json found. Run agent-kit init first (or run update without --dry-run to install).");
    }
    const initResult = initProject({ cwd, force });
    const files: UpdateFileResult[] = [
      ...initResult.copied.map((target): UpdateFileResult => ({ target, action: "created", reason: "Installed by init fallback." })),
      ...initResult.unchanged.map((target): UpdateFileResult => ({ target, action: "unchanged", reason: "Already matched the package asset." })),
      ...initResult.overwritten.map((target): UpdateFileResult => ({ target, action: "overwritten", reason: "Overwritten by init --force fallback." })),
      ...initResult.conflicts.map((entry): UpdateFileResult => {
        const [target, conflictPath] = entry.split(" -> ");
        return {
          target: target ?? entry,
          action: "conflict",
          reason: "Local file differed from the package asset during init fallback.",
          ...(conflictPath ? { conflictPath } : {})
        };
      })
    ];
    return {
      dryRun,
      files,
      libraryFoldersRefreshed: [],
      manifestPath: ".agent-kit/manifest.json",
      summary: summarize(files)
    };
  }

  const packageRoot = findPackageRoot();
  const activated = (manifest.activated ?? ["cursor"]) as IdeTarget[];
  const assets = listManagedAssets(packageRoot, { activated });
  const files: UpdateFileResult[] = [];

  for (const asset of assets) {
    if (!existsSync(asset.sourcePath)) continue;
    const plan = planFileUpdate({
      target: asset.target,
      sourcePath: asset.sourcePath,
      targetPath: resolveInside(cwd, asset.target),
      installedHash: manifest.assetHashes?.[asset.target] ?? manifest.templateHashes?.[asset.target],
      force
    });

    let conflictPath: string | undefined;
    if (!dryRun) {
      if (plan.action === "created" || plan.action === "updated" || plan.action === "overwritten") {
        writeText(resolveInside(cwd, asset.target), plan.sourceContent);
      }
      if (plan.action === "conflict") {
        const proposal = writeConflictProposal(cwd, asset.target, plan.sourceContent, {
          currentContent: plan.localContent ?? "",
          reason: "Template changed and the local file was customized."
        });
        conflictPath = proposal.conflictPath;
      }
    }

    files.push({
      target: asset.target,
      action: plan.action,
      reason: plan.reason,
      ...(conflictPath ? { conflictPath } : {})
    });
  }

  if (!dryRun) {
    const nextHashes = { ...manifest.assetHashes };
    for (const asset of assets) {
      if (existsSync(asset.sourcePath)) nextHashes[asset.target] = sha256(readFileSync(asset.sourcePath, "utf8"));
    }
    const next: InstallManifest = {
      ...manifest,
      packageVersion: PACKAGE_VERSION,
      schemaVersion: 3,
      updatedAt: new Date().toISOString(),
      docs: ["AGENTS.md", "USER_GUIDE.md"],
      assetHashes: nextHashes
    };
    writeText(join(cwd, ".agent-kit", "manifest.json"), `${JSON.stringify(next, null, 2)}\n`);
  }

  return {
    dryRun,
    files,
    libraryFoldersRefreshed: [],
    manifestPath: ".agent-kit/manifest.json",
    summary: summarize(files)
  };
}
