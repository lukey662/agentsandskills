#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cli = join(repoRoot, "dist", "index.js");

if (!existsSync(cli)) {
  console.log("Building CLI before maintainer dogfood init…");
  execFileSync("npm", ["run", "build"], { cwd: repoRoot, stdio: "inherit" });
}

execFileSync("node", [cli, "init", "--stack", "next-supabase", "--activate", "cursor", "--activate", "codex"], { cwd: repoRoot, stdio: "inherit" });

console.log("\nMaintainer dogfood overlay installed locally (gitignored).");
console.log("Validate with:");
console.log("  node dist/index.js adapter validate cursor");
console.log("  node dist/index.js adapter validate codex");
console.log("See DOCS.md#maintainer-dogfood and MAINTAINER_RELEASE.md for release evidence.");
