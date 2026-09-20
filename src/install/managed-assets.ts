import { join } from "node:path";
import { AGENTS_DOC_SOURCE, AGENTS_RULE_FILE, CLAUDE_TEMPLATE, CURSOR_RULE_FILE, USER_GUIDE_HTML_SOURCE, USER_GUIDE_SOURCE } from "../config/defaults.js";
import type { IdeTarget } from "./ide-activate.js";

export type ManagedAssetCategory = "root-doc" | "adapter";

export interface ManagedAsset {
  target: string;
  sourcePath: string;
  category: ManagedAssetCategory;
}

/** Files copied verbatim from the package and refreshed by `update` through hash comparison. Generated agent files are handled by activation instead. */
export function listManagedAssets(packageRoot: string, options: { activated?: IdeTarget[] } = {}): ManagedAsset[] {
  const assets: ManagedAsset[] = [
    { target: "AGENTS.md", sourcePath: join(packageRoot, AGENTS_DOC_SOURCE), category: "root-doc" },
    { target: "USER_GUIDE.md", sourcePath: join(packageRoot, USER_GUIDE_SOURCE), category: "root-doc" },
    { target: "USER_GUIDE.html", sourcePath: join(packageRoot, USER_GUIDE_HTML_SOURCE), category: "root-doc" },
    { target: CURSOR_RULE_FILE.target, sourcePath: join(packageRoot, CURSOR_RULE_FILE.source), category: "adapter" }
  ];

  const activated = new Set(options.activated ?? ["cursor"]);
  if (activated.has("claude")) {
    assets.push({ target: "CLAUDE.md", sourcePath: join(packageRoot, CLAUDE_TEMPLATE), category: "adapter" });
  }
  if (activated.has("antigravity")) {
    assets.push({ target: AGENTS_RULE_FILE.target, sourcePath: join(packageRoot, AGENTS_RULE_FILE.source), category: "adapter" });
  }

  return assets;
}
