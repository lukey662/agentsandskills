#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(repoRoot, "dist", "index.js");
const exampleRoot = join(repoRoot, "examples", "next-supabase-installed");

if (!existsSync(cliPath)) {
  execFileSync("npm", ["run", "build"], { cwd: repoRoot, stdio: "inherit" });
}

const tempRoot = mkdtempSync(join(tmpdir(), "agent-kit-example-refresh-"));

try {
  execFileSync("node", [cliPath, "init", "--stack", "next-supabase"], {
    cwd: tempRoot,
    stdio: "inherit"
  });

  const generatedAudit = JSON.parse(
    execFileSync("node", [cliPath, "audit", "--json"], {
      cwd: tempRoot,
      encoding: "utf8"
    })
  );

  const manifest = JSON.parse(readFileSync(join(tempRoot, ".agent-kit", "manifest.json"), "utf8"));
  manifest.installedAt = JSON.parse(readFileSync(join(exampleRoot, ".agent-kit", "manifest.json"), "utf8")).installedAt;

  writeFileSync(join(exampleRoot, ".agent-kit", "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(join(exampleRoot, "audit-output.json"), `${JSON.stringify(generatedAudit, null, 2)}\n`);

  const treeLines = [
    ".",
    ...manifest.docs.map((doc) => `|-- ${doc}`),
    "|-- .github",
    "|   `-- workflows",
    "|       `-- agent-kit-audit.yml",
    "|-- .cursor",
    "|   `-- rules",
    "|       |-- cursor-agent-kit.mdc",
    "|       `-- cursor-model-selection.mdc",
    "`-- .agent-kit",
    "    |-- manifest.json",
    "    |-- agent-roster.json",
    "    |-- model-routing.json",
    "    |-- project-context.json",
    "    |-- project-context.md",
    "    |-- config.json",
    "    |-- overrides.json",
    "    |-- agents/",
    "    |-- skills/",
    "    |-- runtime-skills/",
    "    |-- prompts/",
    "    |-- checklists/",
    "    |-- design-adapters/",
    "    |-- assistant-adapters/",
    "    |-- design-briefs/",
    "    |-- profiles/",
    "    |-- rosters/",
    "    `-- schemas/"
  ];
  writeFileSync(join(exampleRoot, "tree.txt"), `${treeLines.join("\n")}\n`);

  console.log(`refreshed examples: TESTING.md hash ${manifest.templateHashes["TESTING.md"]}`);
  console.log(`refreshed examples: LOOP_CODING.md hash ${manifest.templateHashes["LOOP_CODING.md"] ?? "missing"}`);

  execFileSync("node", ["scripts/example-check.mjs"], { cwd: repoRoot, stdio: "inherit" });
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
