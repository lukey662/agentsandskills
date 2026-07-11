import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CI_TEMPLATE_FILES,
  CURSOR_ADAPTER_FILES,
  DEFAULT_AGENT_ROSTER_SOURCE,
  DEFAULT_AGENT_ROSTER_TARGET,
  DEFAULT_CONFIG,
  DEFAULT_MODEL_ROUTING_SOURCE,
  DEFAULT_MODEL_ROUTING_TARGET,
  DEFAULT_ORCHESTRATOR_SOURCE,
  DEFAULT_ORCHESTRATOR_TARGET,
  DEFAULT_RUNTIME_IGNORE_SOURCE,
  DEFAULT_RUNTIME_IGNORE_TARGET,
  LIBRARY_FOLDERS,
  PACKAGE_NAME,
  PACKAGE_VERSION,
  ROOT_DOCS
} from "../config/defaults.js";
import type { InstallManifest, StackProfile } from "../config/types.js";
import { initProjectContext } from "../studio/context.js";
import { copyTextWithConflict, ensureDir, sha256, writeText } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";
import { activateIdeTargets, parseActivateTargets, type ActivateIdeResult, type IdeTarget } from "./ide-activate.js";
import { hashManagedAssets, listManagedAssets } from "./managed-assets.js";

export interface InitOptions {
  cwd: string;
  stack?: StackProfile;
  force?: boolean;
  activate?: string[];
}

export interface InitResult {
  copied: string[];
  unchanged: string[];
  conflicts: string[];
  overwritten: string[];
  manifestPath: string;
  contextPath?: string;
  activation?: ActivateIdeResult;
}

export function initProject(options: InitOptions): InitResult {
  const cwd = options.cwd;
  const stack = options.stack ?? DEFAULT_CONFIG.stack;
  const packageRoot = findPackageRoot();
  const templateRoot = join(packageRoot, "templates", stack);
  const managedAssets = listManagedAssets(packageRoot, stack);

  if (!existsSync(templateRoot)) {
    throw new Error(`Unsupported stack profile: ${stack}`);
  }

  ensureDir(join(cwd, ".agent-kit"));
  ensureDir(join(cwd, ".agent-kit", "conflicts"));

  const result: InitResult = {
    copied: [],
    unchanged: [],
    conflicts: [],
    overwritten: [],
    manifestPath: ".agent-kit/manifest.json"
  };

  const templateHashes: Record<string, string> = {};

  for (const doc of ROOT_DOCS) {
    const templatePath = join(templateRoot, doc);
    templateHashes[doc] = sha256(readFileSync(templatePath, "utf8"));

    const copyResult = copyTextWithConflict(templatePath, cwd, doc, {
      force: Boolean(options.force),
      conflictRoot: join(cwd, ".agent-kit", "conflicts")
    });

    if (copyResult.action === "created") result.copied.push(copyResult.target);
    if (copyResult.action === "unchanged") result.unchanged.push(copyResult.target);
    if (copyResult.action === "overwritten") result.overwritten.push(copyResult.target);
    if (copyResult.action === "conflict") {
      result.conflicts.push(`${copyResult.target} -> ${copyResult.conflictPath}`);
    }
  }

  for (const asset of managedAssets.filter((item) => item.category === "library")) {
    const libraryCopy = copyTextWithConflict(asset.sourcePath, cwd, asset.target, {
      force: Boolean(options.force),
      conflictRoot: join(cwd, ".agent-kit", "conflicts")
    });
    if (libraryCopy.action === "overwritten") result.overwritten.push(libraryCopy.target);
    if (libraryCopy.action === "conflict") result.conflicts.push(`${libraryCopy.target} -> ${libraryCopy.conflictPath}`);
  }

  for (const adapter of CURSOR_ADAPTER_FILES) {
    const adapterCopy = copyTextWithConflict(join(packageRoot, adapter.source), cwd, adapter.target, {
      force: Boolean(options.force),
      conflictRoot: join(cwd, ".agent-kit", "conflicts")
    });
    if (adapterCopy.action === "created") result.copied.push(adapterCopy.target);
    if (adapterCopy.action === "unchanged") result.unchanged.push(adapterCopy.target);
    if (adapterCopy.action === "overwritten") result.overwritten.push(adapterCopy.target);
    if (adapterCopy.action === "conflict") {
      result.conflicts.push(`${adapterCopy.target} -> ${adapterCopy.conflictPath}`);
    }
  }

  const rosterCopy = copyTextWithConflict(join(packageRoot, DEFAULT_AGENT_ROSTER_SOURCE), cwd, DEFAULT_AGENT_ROSTER_TARGET, {
    force: Boolean(options.force),
    conflictRoot: join(cwd, ".agent-kit", "conflicts")
  });
  if (rosterCopy.action === "created") result.copied.push(rosterCopy.target);
  if (rosterCopy.action === "unchanged") result.unchanged.push(rosterCopy.target);
  if (rosterCopy.action === "overwritten") result.overwritten.push(rosterCopy.target);
  if (rosterCopy.action === "conflict") result.conflicts.push(`${rosterCopy.target} -> ${rosterCopy.conflictPath}`);

  const modelRoutingCopy = copyTextWithConflict(join(packageRoot, DEFAULT_MODEL_ROUTING_SOURCE), cwd, DEFAULT_MODEL_ROUTING_TARGET, {
    force: Boolean(options.force),
    conflictRoot: join(cwd, ".agent-kit", "conflicts")
  });
  if (modelRoutingCopy.action === "created") result.copied.push(modelRoutingCopy.target);
  if (modelRoutingCopy.action === "unchanged") result.unchanged.push(modelRoutingCopy.target);
  if (modelRoutingCopy.action === "overwritten") result.overwritten.push(modelRoutingCopy.target);
  if (modelRoutingCopy.action === "conflict") result.conflicts.push(`${modelRoutingCopy.target} -> ${modelRoutingCopy.conflictPath}`);

  const orchestratorCopy = copyTextWithConflict(join(packageRoot, DEFAULT_ORCHESTRATOR_SOURCE), cwd, DEFAULT_ORCHESTRATOR_TARGET, {
    force: Boolean(options.force),
    conflictRoot: join(cwd, ".agent-kit", "conflicts")
  });
  if (orchestratorCopy.action === "created") result.copied.push(orchestratorCopy.target);
  if (orchestratorCopy.action === "unchanged") result.unchanged.push(orchestratorCopy.target);
  if (orchestratorCopy.action === "overwritten") result.overwritten.push(orchestratorCopy.target);
  if (orchestratorCopy.action === "conflict") result.conflicts.push(`${orchestratorCopy.target} -> ${orchestratorCopy.conflictPath}`);

  const runtimeIgnoreCopy = copyTextWithConflict(join(packageRoot, DEFAULT_RUNTIME_IGNORE_SOURCE), cwd, DEFAULT_RUNTIME_IGNORE_TARGET, {
    force: Boolean(options.force),
    conflictRoot: join(cwd, ".agent-kit", "conflicts")
  });
  if (runtimeIgnoreCopy.action === "created") result.copied.push(runtimeIgnoreCopy.target);
  if (runtimeIgnoreCopy.action === "unchanged") result.unchanged.push(runtimeIgnoreCopy.target);
  if (runtimeIgnoreCopy.action === "overwritten") result.overwritten.push(runtimeIgnoreCopy.target);
  if (runtimeIgnoreCopy.action === "conflict") result.conflicts.push(`${runtimeIgnoreCopy.target} -> ${runtimeIgnoreCopy.conflictPath}`);

  const manifest: InstallManifest = {
    schemaVersion: 2,
    packageName: PACKAGE_NAME,
    packageVersion: PACKAGE_VERSION,
    stack,
    installedAt: new Date().toISOString(),
    docs: [...ROOT_DOCS],
    libraryFolders: [...LIBRARY_FOLDERS],
    agentRoster: DEFAULT_AGENT_ROSTER_TARGET,
    modelRouting: DEFAULT_MODEL_ROUTING_TARGET,
    templateHashes,
    assetHashes: hashManagedAssets(managedAssets)
  };

  writeText(join(cwd, ".agent-kit", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeText(join(cwd, ".agent-kit", "config.json"), `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`);
  const overridesPath = join(cwd, ".agent-kit", "overrides.json");
  if (!existsSync(overridesPath)) writeText(overridesPath, `${JSON.stringify({ templates: {} }, null, 2)}\n`);

  for (const template of CI_TEMPLATE_FILES) {
    const ciCopy = copyTextWithConflict(join(packageRoot, template.source), cwd, template.target, {
      force: Boolean(options.force),
      conflictRoot: join(cwd, ".agent-kit", "conflicts")
    });
    if (ciCopy.action === "created") result.copied.push(ciCopy.target);
    if (ciCopy.action === "unchanged") result.unchanged.push(ciCopy.target);
    if (ciCopy.action === "overwritten") result.overwritten.push(ciCopy.target);
    if (ciCopy.action === "conflict") result.conflicts.push(`${ciCopy.target} -> ${ciCopy.conflictPath}`);
  }

  const context = initProjectContext(cwd);
  result.contextPath = context.contextPath;

  const activateTargets = parseActivateTargets(options.activate);
  if (activateTargets.length > 0) {
    result.activation = activateIdeTargets({
      cwd,
      targets: activateTargets,
      force: Boolean(options.force)
    });
    result.copied.push(...result.activation.copied.filter((path) => !result.copied.includes(path)));
    result.unchanged.push(...result.activation.unchanged.filter((path) => !result.unchanged.includes(path)));
    result.conflicts.push(...result.activation.conflicts.filter((path) => !result.conflicts.includes(path)));
    result.overwritten.push(...result.activation.overwritten.filter((path) => !result.overwritten.includes(path)));
  }

  return result;
}

export { type IdeTarget };

export function readManifest(cwd: string): InstallManifest | null {
  const manifestPath = join(cwd, ".agent-kit", "manifest.json");
  if (!existsSync(manifestPath)) return null;
  return JSON.parse(readFileSync(manifestPath, "utf8")) as InstallManifest;
}
