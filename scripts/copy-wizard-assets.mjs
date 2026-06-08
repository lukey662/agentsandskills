import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(repoRoot, "src", "studio", "wizard", "assets");
const target = join(repoRoot, "dist", "studio", "wizard", "assets");

mkdirSync(target, { recursive: true });
cpSync(join(source, "wizard.css"), join(target, "wizard.css"));
cpSync(join(source, "wizard.js"), join(target, "wizard.js"));
console.log("copied wizard assets to dist/studio/wizard/assets");
