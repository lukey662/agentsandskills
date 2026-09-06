import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCatalog } from "../catalog.js";
import {
  AGENTS_DOC_SOURCE,
  CURSOR_RULE_FILE,
  PACKAGE_NAME,
  PACKAGE_VERSION,
  ROOT_DOCS,
  USER_GUIDE_HTML_SOURCE,
  USER_GUIDE_SOURCE
} from "../config/defaults.js";
import type { InstallManifest, StackProfile } from "../config/types.js";
import { copyTextWithConflict, ensureDir, sha256, writeText } from "../utils/fs.js";
import { findPackageRoot } from "../utils/package-root.js";
import { emptyCollector, recordCopy, type CopyCollector } from "./copy-asset.js";
import { activateIdeTargets, parseActivateTargets, type ActivateIdeResult, type IdeTarget } from "./ide-activate.js";
import { listManagedAssets } from "./managed-assets.js";
import { generatePortableSkills } from "./roster-adapters.js";

export interface InitOptions {
  cwd: string;
  stack?: StackProfile;
  force?: boolean;
  activate?: string[];
  legacyDocs?: boolean;
}

export interface InitResult extends CopyCollector {
  manifestPath: string;
  activation?: ActivateIdeResult;
  contextPath?: string;
}

export function initProject(options: InitOptions): InitResult {
  const cwd = options.cwd;
  const stack = options.stack ?? "next-supabase";
  const packageRoot = findPackageRoot();
  const force = Boolean(options.force);

  ensureDir(join(cwd, ".agent-kit", "conflicts"));

  const result: InitResult = {
    ...emptyCollector(),
    manifestPath: ".agent-kit/manifest.json"
  };

  const templateHashes: Record<string, string> = {};
  const agentsDoc = readFileSync(join(packageRoot, AGENTS_DOC_SOURCE), "utf8");
  const userGuide = readFileSync(join(packageRoot, USER_GUIDE_SOURCE), "utf8");
  const userGuideHtml = readFileSync(join(packageRoot, USER_GUIDE_HTML_SOURCE), "utf8");
  templateHashes["AGENTS.md"] = sha256(agentsDoc);
  templateHashes["USER_GUIDE.md"] = sha256(userGuide);
  templateHashes["USER_GUIDE.html"] = sha256(userGuideHtml);

  recordCopy(
    result,
    copyTextWithConflict(join(packageRoot, AGENTS_DOC_SOURCE), cwd, "AGENTS.md", {
      force,
      conflictRoot: join(cwd, ".agent-kit", "conflicts")
    })
  );
  recordCopy(
    result,
    copyTextWithConflict(join(packageRoot, USER_GUIDE_SOURCE), cwd, "USER_GUIDE.md", {
      force,
      conflictRoot: join(cwd, ".agent-kit", "conflicts")
    })
  );
  recordCopy(
    result,
    copyTextWithConflict(join(packageRoot, USER_GUIDE_HTML_SOURCE), cwd, "USER_GUIDE.html", {
      force,
      conflictRoot: join(cwd, ".agent-kit", "conflicts")
    })
  );

  if (options.legacyDocs) {
    const legacyRoot = join(packageRoot, "templates", stack);
    const legacyDocs = ["SPEC.md", "DECISIONS.md", "DESIGN.md", "SECURITY.md", "TESTING.md", "QUALITY_GATES.md"];
    for (const doc of legacyDocs) {
      const source = join(legacyRoot, doc);
      if (!existsSync(source)) continue;
      recordCopy(
        result,
        copyTextWithConflict(source, cwd, doc, {
          force,
          conflictRoot: join(cwd, ".agent-kit", "conflicts")
        })
      );
    }
  }

  const activateTargets = parseActivateTargets(options.activate);
  const targets: IdeTarget[] = activateTargets.length > 0 ? activateTargets : ["cursor"];
  result.activation = activateIdeTargets({ cwd, targets, force });
  generatePortableSkills(cwd, force, result.activation);
  result.copied.push(...result.activation.copied.filter((path) => !result.copied.includes(path)));
  result.unchanged.push(...result.activation.unchanged.filter((path) => !result.unchanged.includes(path)));
  result.conflicts.push(...result.activation.conflicts.filter((path) => !result.conflicts.includes(path)));
  result.overwritten.push(...result.activation.overwritten.filter((path) => !result.overwritten.includes(path)));

  const assets = listManagedAssets(packageRoot, { activated: targets });
  const assetHashes: Record<string, string> = {};
  for (const asset of assets) {
    if (existsSync(asset.sourcePath)) assetHashes[asset.target] = sha256(readFileSync(asset.sourcePath, "utf8"));
  }
  // Generated files: hash what we just wrote
  for (const relative of [...result.copied, ...result.unchanged, ...result.overwritten]) {
    const path = join(cwd, relative);
    if (existsSync(path) && !assetHashes[relative]) {
      assetHashes[relative] = sha256(readFileSync(path, "utf8"));
    }
  }

  const catalog = loadCatalog(packageRoot);
  const manifest: InstallManifest = {
    schemaVersion: 3,
    packageName: PACKAGE_NAME,
    packageVersion: PACKAGE_VERSION,
    stack,
    installedAt: new Date().toISOString(),
    docs: [...ROOT_DOCS],
    activated: targets,
    templateHashes,
    assetHashes
  };

  writeText(join(cwd, ".agent-kit", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeText(
    join(cwd, ".agent-kit", "config.json"),
    `${JSON.stringify({ stack, catalog: { defaultAgents: catalog.defaultAgents, defaultSkills: catalog.defaultSkills } }, null, 2)}\n`
  );

  // Always keep the Cursor rule available even when only other IDEs were requested
  if (!targets.includes("cursor")) {
    recordCopy(
      result,
      copyTextWithConflict(join(packageRoot, CURSOR_RULE_FILE.source), cwd, CURSOR_RULE_FILE.target, {
        force,
        conflictRoot: join(cwd, ".agent-kit", "conflicts")
      })
    );
  }

  return result;
}

export function readManifest(cwd: string): InstallManifest | null {
  const manifestPath = join(cwd, ".agent-kit", "manifest.json");
  if (!existsSync(manifestPath)) return null;
  return JSON.parse(readFileSync(manifestPath, "utf8")) as InstallManifest;
}

export function readGithubActionsMode(_cwd: string): "off" | "advisory" {
  return "off";
}

export { type IdeTarget };
