import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function findPackageRoot(start = dirname(fileURLToPath(import.meta.url))): string {
  let current = resolve(start);

  for (let i = 0; i < 8; i += 1) {
    if (existsSync(join(current, "package.json"))) {
      return current;
    }

    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }

  throw new Error("Unable to locate package root from runtime path.");
}
