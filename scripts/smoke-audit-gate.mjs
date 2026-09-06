import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(repoRoot, "dist", "index.js");
const tempRoot = mkdtempSync(join(tmpdir(), "agent-kit-doctor-gate-"));

function run(args) {
  return execFileSync("node", [cliPath, ...args], {
    cwd: tempRoot,
    encoding: "utf8"
  });
}

try {
  if (!existsSync(cliPath)) {
    throw new Error("dist/index.js is missing. Run npm run build before smoke:audit-gate.");
  }

  run(["init", "--stack", "next-supabase", "--activate", "all"]);
  run(["doctor"]);
  run(["adapter", "validate", "all"]);

  const guide = readFileSync(join(tempRoot, "USER_GUIDE.md"), "utf8");
  if (!guide.includes("Do not review code alone")) {
    throw new Error("Installed USER_GUIDE.md dropped the screenshot fail-closed sentence.");
  }
  if (!existsSync(join(tempRoot, ".cursor/skills/browser-qa/SKILL.md"))) {
    throw new Error("Expected browser-qa skill after init.");
  }
  if (!existsSync(join(tempRoot, ".cursor/agents/qa.md"))) {
    throw new Error("Expected QA agent after init.");
  }

  console.log("doctor gate passed");
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
