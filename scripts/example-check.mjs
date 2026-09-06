import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(repoRoot, "dist", "index.js");
const exampleRoot = join(repoRoot, "examples", "next-supabase-installed");
const tempRoot = mkdtempSync(join(tmpdir(), "agent-kit-example-"));

function run(args, cwd) {
  return execFileSync("node", [cliPath, ...args], { cwd, encoding: "utf8" });
}

try {
  if (!existsSync(cliPath)) throw new Error("dist/index.js is missing. Run npm run build first.");
  run(["init", "--activate", "all"], tempRoot);

  const required = ["AGENTS.md", "USER_GUIDE.md", ".cursor/agents/qa.md", ".cursor/skills/browser-qa/SKILL.md"];
  for (const file of required) {
    if (!existsSync(join(tempRoot, file))) throw new Error(`Fresh init missing ${file}`);
    if (!existsSync(join(exampleRoot, file))) throw new Error(`Example fixture missing ${file}`);
  }

  const tree = readFileSync(join(exampleRoot, "tree.txt"), "utf8");
  for (const entry of ["AGENTS.md", "USER_GUIDE.md", ".cursor/agents/qa.md", "browser-qa"]) {
    if (!tree.includes(entry)) throw new Error(`example tree.txt missing ${entry}`);
  }

  const guide = readFileSync(join(exampleRoot, "USER_GUIDE.md"), "utf8");
  if (!guide.includes("Do not review code alone")) {
    throw new Error("Example USER_GUIDE.md dropped the screenshot fail-closed sentence.");
  }

  console.log("example check passed");
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
