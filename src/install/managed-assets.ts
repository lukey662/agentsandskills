import { join } from "node:path";
import { AGENTS_DOC_SOURCE, CURSOR_RULE_FILE, USER_GUIDE_SOURCE } from "../config/defaults.js";
import type { IdeTarget } from "./ide-activate.js";

export type ManagedAssetCategory = "root-doc" | "adapter" | "generated";

export interface ManagedAsset {
  target: string;
  sourcePath: string;
  category: ManagedAssetCategory;
  libraryFolder?: string;
}

export function listManagedAssets(packageRoot: string, options: { activated?: IdeTarget[] } = {}): ManagedAsset[] {
  const assets: ManagedAsset[] = [
    { target: "AGENTS.md", sourcePath: join(packageRoot, AGENTS_DOC_SOURCE), category: "root-doc" },
    { target: "USER_GUIDE.md", sourcePath: join(packageRoot, USER_GUIDE_SOURCE), category: "root-doc" },
    { target: CURSOR_RULE_FILE.target, sourcePath: join(packageRoot, CURSOR_RULE_FILE.source), category: "adapter" }
  ];

  const activated = new Set(options.activated ?? ["cursor"]);
  if (activated.has("claude")) {
    assets.push({
      target: "CLAUDE.md",
      sourcePath: join(packageRoot, "templates/next-supabase/CLAUDE.md"),
      category: "adapter"
    });
  }

  return assets;
}
