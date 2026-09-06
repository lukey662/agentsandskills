import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(repoRoot, "dist", "index.js");
const exampleRoot = join(repoRoot, "examples", "next-supabase-installed");

if (!existsSync(cliPath)) {
  throw new Error("dist/index.js is missing. Run npm run build first.");
}
if (!existsSync(exampleRoot)) {
  throw new Error("examples/next-supabase-installed is missing.");
}

execFileSync("node", [cliPath, "adapter", "validate", "all"], {
  cwd: exampleRoot,
  stdio: "inherit"
});

console.log("adapter validate example passed");
