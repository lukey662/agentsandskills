import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_CONFIG, LIBRARY_FOLDERS, PACKAGE_NAME, PACKAGE_VERSION, ROOT_DOCS } from "../config/defaults.js";
import type { InstallManifest, StackProfile } from "../config/types.js";
import { copyDirectory, copyTextWithConflict, ensureDir, sha256, writeText } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";

export interface InitOptions {
  cwd: string;
  stack?: StackProfile;
  force?: boolean;
}

export interface InitResult {
  copied: string[];
  unchanged: string[];
  conflicts: string[];
  overwritten: string[];
  manifestPath: string;
}

export function initProject(options: InitOptions): InitResult {
  const cwd = options.cwd;
  const stack = options.stack ?? DEFAULT_CONFIG.stack;
  const packageRoot = findPackageRoot();
  const templateRoot = join(packageRoot, "templates", stack);

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

  for (const folder of LIBRARY_FOLDERS) {
    copyDirectory(join(packageRoot, folder), join(cwd, ".agent-kit", folder));
  }

  const manifest: InstallManifest = {
    packageName: PACKAGE_NAME,
    packageVersion: PACKAGE_VERSION,
    stack,
    installedAt: new Date().toISOString(),
    docs: [...ROOT_DOCS],
    libraryFolders: [...LIBRARY_FOLDERS],
    templateHashes
  };

  writeText(join(cwd, ".agent-kit", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeText(join(cwd, ".agent-kit", "config.json"), `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`);
  const overridesPath = join(cwd, ".agent-kit", "overrides.json");
  if (!existsSync(overridesPath)) writeText(overridesPath, `${JSON.stringify({ templates: {} }, null, 2)}\n`);

  return result;
}

export function readManifest(cwd: string): InstallManifest | null {
  const manifestPath = join(cwd, ".agent-kit", "manifest.json");
  if (!existsSync(manifestPath)) return null;
  return JSON.parse(readFileSync(manifestPath, "utf8")) as InstallManifest;
}
