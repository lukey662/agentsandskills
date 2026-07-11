import { existsSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_AGENT_ROSTER_TARGET, DEFAULT_MODEL_ROUTING_TARGET, LIBRARY_FOLDERS, PACKAGE_NAME, PACKAGE_VERSION, ROOT_DOCS } from "../config/defaults.js";
import type { InstallManifest } from "../config/types.js";
import { resolveInside, writeConflictProposal, writeText } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";
import { planFileUpdate, type PlannedUpdateAction } from "./file-update-plan.js";
import { hashManagedAssets, listManagedAssets } from "./managed-assets.js";
import { initProject, readManifest } from "./install.js";

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
      libraryFoldersRefreshed: [...LIBRARY_FOLDERS],
      manifestPath: ".agent-kit/manifest.json",
      summary: summarize(files)
    };
  }

  const packageRoot = findPackageRoot();
  const stack = manifest.stack ?? "next-supabase";
  const templateRoot = join(packageRoot, "templates", stack);
  if (!existsSync(templateRoot)) throw new Error(`Unsupported stack profile in manifest: ${stack}`);

  const assets = listManagedAssets(packageRoot, stack);
  const plans = assets.map((asset) =>
    planFileUpdate({
      target: asset.target,
      sourcePath: asset.sourcePath,
      targetPath: resolveInside(cwd, asset.target),
      installedHash: manifest.assetHashes?.[asset.target] ?? manifest.templateHashes?.[asset.target],
      force
    })
  );
  const files: UpdateFileResult[] = [];

  for (const plan of plans) {
    const result: UpdateFileResult = { target: plan.target, action: plan.action, reason: plan.reason };
    if (!dryRun) {
      if (plan.action === "created" || plan.action === "updated" || plan.action === "overwritten") {
        writeText(resolveInside(cwd, plan.target), plan.sourceContent);
      } else if (plan.action === "conflict") {
        const proposal = writeConflictProposal(cwd, plan.target, plan.sourceContent, {
          currentContent: plan.localContent,
          reason: plan.reason,
          sourceVersion: PACKAGE_VERSION
        });
        result.conflictPath = proposal.conflictPath;
      }
    }
    files.push(result);
  }

  const currentTargets = new Set(assets.map((asset) => asset.target));
  for (const staleTarget of Object.keys(manifest.assetHashes ?? {})
    .filter((target) => !currentTargets.has(target))
    .sort()) {
    if (!existsSync(resolveInside(cwd, staleTarget))) continue;
    files.push({
      target: staleTarget,
      action: "kept-local",
      reason: "The asset is no longer shipped; it was retained for explicit manual removal."
    });
  }

  const refreshedFolders = [
    ...new Set(
      assets
        .filter((asset, index) => asset.libraryFolder && ["created", "updated", "overwritten"].includes(plans[index]?.action ?? ""))
        .map((asset) => asset.libraryFolder!)
    )
  ].sort();

  if (!dryRun) {
    const assetHashes = hashManagedAssets(assets);
    const updatedManifest: InstallManifest = {
      schemaVersion: 2,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      stack,
      installedAt: manifest.installedAt,
      updatedAt: new Date().toISOString(),
      docs: [...ROOT_DOCS],
      libraryFolders: [...LIBRARY_FOLDERS],
      agentRoster: manifest.agentRoster ?? DEFAULT_AGENT_ROSTER_TARGET,
      modelRouting: manifest.modelRouting ?? DEFAULT_MODEL_ROUTING_TARGET,
      templateHashes: Object.fromEntries(ROOT_DOCS.map((doc) => [doc, assetHashes[doc] ?? ""])),
      assetHashes
    };
    writeText(join(cwd, ".agent-kit", "manifest.json"), `${JSON.stringify(updatedManifest, null, 2)}\n`);
  }

  return {
    dryRun,
    files,
    libraryFoldersRefreshed: refreshedFolders,
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
