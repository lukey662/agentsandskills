#!/usr/bin/env node
/**
 * Refresh examples/next-supabase-installed so it is exactly what `agent-kit init --activate all`
 * writes today. The fixture is golden evidence for downstream users, so it must not lag the
 * canonical agents/ and skills/.
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(repoRoot, "dist", "index.js");
const exampleRoot = join(repoRoot, "examples", "next-supabase-installed");
const KEEP = new Set(["README.md"]);

if (!existsSync(cliPath)) {
  execFileSync("npm", ["run", "build"], { cwd: repoRoot, stdio: "inherit" });
}

function listFiles(root) {
  const out = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) out.push(...listFiles(path));
    else out.push(path);
  }
  return out;
}

const tempRoot = mkdtempSync(join(tmpdir(), "agent-kit-example-refresh-"));

try {
  execFileSync("node", [cliPath, "init", "--stack", "next-supabase", "--activate", "all"], { cwd: tempRoot, stdio: "inherit" });

  // Keep the fixture's original install timestamp so refreshes do not churn the manifest.
  const manifestPath = join(tempRoot, ".agent-kit", "manifest.json");
  const previousManifestPath = join(exampleRoot, ".agent-kit", "manifest.json");
  if (existsSync(previousManifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    manifest.installedAt = JSON.parse(readFileSync(previousManifestPath, "utf8")).installedAt ?? manifest.installedAt;
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  // init creates an empty conflicts dir; the fixture does not need it.
  rmSync(join(tempRoot, ".agent-kit", "conflicts"), { recursive: true, force: true });

  // Replace everything except the fixture README.
  if (existsSync(exampleRoot)) {
    for (const entry of readdirSync(exampleRoot)) {
      if (KEEP.has(entry)) continue;
      rmSync(join(exampleRoot, entry), { recursive: true, force: true });
    }
  }
  cpSync(tempRoot, exampleRoot, { recursive: true });

  const tree = listFiles(exampleRoot)
    .map((path) => relative(exampleRoot, path))
    .filter((path) => path !== "tree.txt")
    .sort();
  writeFileSync(join(exampleRoot, "tree.txt"), `${[...tree, "tree.txt"].join("\n")}\n`);

  console.log(`refreshed examples: ${tree.length} files`);
  execFileSync("node", ["scripts/example-check.mjs"], { cwd: repoRoot, stdio: "inherit" });
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
