import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { findPackageRoot } from "../utils/package-root.js";

export interface UserGuideLocation {
  path: string;
  source: "cwd" | "package";
  fileUrl: string;
}

export function resolveUserGuideHtml(cwd: string): UserGuideLocation {
  const local = join(cwd, "USER_GUIDE.html");
  if (existsSync(local)) return locate(local, "cwd");
  const packaged = join(findPackageRoot(), "USER_GUIDE.html");
  if (existsSync(packaged)) return locate(packaged, "package");
  throw new Error("USER_GUIDE.html is missing. Run agent-kit init, then open the file in a browser.");
}

function locate(path: string, source: UserGuideLocation["source"]): UserGuideLocation {
  const absolute = resolve(path);
  return { path: absolute, source, fileUrl: pathToFileURL(absolute).href };
}
