import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function copyDir(sourceDir, targetDir) {
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

const wizardSource = join(repoRoot, "src", "studio", "wizard", "assets");
const wizardTarget = join(repoRoot, "dist", "studio", "wizard", "assets");
mkdirSync(wizardTarget, { recursive: true });
cpSync(join(wizardSource, "wizard.css"), join(wizardTarget, "wizard.css"));
cpSync(join(wizardSource, "wizard.js"), join(wizardTarget, "wizard.js"));

const officeSource = join(repoRoot, "src", "studio", "office", "assets");
const officeTarget = join(repoRoot, "dist", "studio", "office", "assets");
copyDir(officeSource, officeTarget);

console.log("copied wizard and office assets to dist/studio/");
