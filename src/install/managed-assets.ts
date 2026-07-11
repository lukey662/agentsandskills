import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CI_TEMPLATE_FILES,
  CURSOR_ADAPTER_FILES,
  DEFAULT_AGENT_ROSTER_SOURCE,
  DEFAULT_AGENT_ROSTER_TARGET,
  DEFAULT_MODEL_ROUTING_SOURCE,
  DEFAULT_MODEL_ROUTING_TARGET,
  DEFAULT_ORCHESTRATOR_SOURCE,
  DEFAULT_ORCHESTRATOR_TARGET,
  DEFAULT_RUNTIME_IGNORE_SOURCE,
  DEFAULT_RUNTIME_IGNORE_TARGET,
  LIBRARY_FOLDERS,
  ROOT_DOCS
} from "../config/defaults.js";
import { listFilesRecursive, sha256 } from "../utils/fs.js";

export type ManagedAssetCategory = "root-doc" | "adapter" | "roster" | "model-routing" | "orchestrator" | "library" | "ci";

export interface ManagedAsset {
  target: string;
  sourcePath: string;
  category: ManagedAssetCategory;
  libraryFolder?: string;
}

export function listManagedAssets(packageRoot: string, stack: string): ManagedAsset[] {
  const assets: ManagedAsset[] = [];
  const templateRoot = join(packageRoot, "templates", stack);

  for (const target of ROOT_DOCS) {
    assets.push({ target, sourcePath: join(templateRoot, target), category: "root-doc" });
  }
  for (const adapter of CURSOR_ADAPTER_FILES) {
    assets.push({ target: adapter.target, sourcePath: join(packageRoot, adapter.source), category: "adapter" });
  }
  assets.push(
    { target: DEFAULT_AGENT_ROSTER_TARGET, sourcePath: join(packageRoot, DEFAULT_AGENT_ROSTER_SOURCE), category: "roster" },
    { target: DEFAULT_MODEL_ROUTING_TARGET, sourcePath: join(packageRoot, DEFAULT_MODEL_ROUTING_SOURCE), category: "model-routing" },
    { target: DEFAULT_ORCHESTRATOR_TARGET, sourcePath: join(packageRoot, DEFAULT_ORCHESTRATOR_SOURCE), category: "orchestrator" },
    { target: DEFAULT_RUNTIME_IGNORE_TARGET, sourcePath: join(packageRoot, DEFAULT_RUNTIME_IGNORE_SOURCE), category: "orchestrator" }
  );
  for (const template of CI_TEMPLATE_FILES) {
    assets.push({ target: template.target, sourcePath: join(packageRoot, template.source), category: "ci" });
  }
  for (const folder of LIBRARY_FOLDERS) {
    for (const relativePath of listFilesRecursive(join(packageRoot, folder))) {
      assets.push({
        target: `.agent-kit/${folder}/${relativePath}`.replace(/\\/g, "/"),
        sourcePath: join(packageRoot, folder, relativePath),
        category: "library",
        libraryFolder: folder
      });
    }
  }

  const byTarget = new Map<string, ManagedAsset>();
  for (const asset of assets) byTarget.set(asset.target, asset);
  return [...byTarget.values()].sort((left, right) => left.target.localeCompare(right.target));
}

export function hashManagedAssets(assets: ManagedAsset[]): Record<string, string> {
  return Object.fromEntries(assets.map((asset) => [asset.target, sha256(readFileSync(asset.sourcePath, "utf8"))]));
}
