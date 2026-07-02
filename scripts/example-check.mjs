import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const cliPath = join(repoRoot, "dist", "index.js");
const exampleRoot = join(repoRoot, "examples", "next-supabase-installed");
const tempRoot = mkdtempSync(join(tmpdir(), "agent-kit-example-"));

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function stableManifest(manifest) {
  const { installedAt, ...stable } = manifest;
  if (!installedAt || Number.isNaN(Date.parse(installedAt))) {
    throw new Error("Example manifest installedAt must be a valid ISO timestamp.");
  }
  return stable;
}

function stableAudit(report) {
  return {
    summary: report.summary,
    readiness: report.readiness,
    findings: report.findings
  };
}

function assertDeepEqual(name, actual, expected) {
  const actualText = JSON.stringify(actual, null, 2);
  const expectedText = JSON.stringify(expected, null, 2);
  if (actualText !== expectedText) {
    throw new Error(`${name} is stale or inconsistent with current CLI output.`);
  }
}

function assertTreeSummary() {
  const treeText = readFileSync(join(exampleRoot, "tree.txt"), "utf8");
  const requiredEntries = [
    "AGENTS.md",
    "AGENT_ROSTER.md",
    "ASSISTANT_ADAPTERS.md",
    "COUNCIL.md",
    "SKILLS.md",
    "SPEC.md",
    "DECISIONS.md",
    "DOCS.md",
    "DESIGN.md",
    "MESSAGING.md",
    "MODEL_ROUTING.md",
    "QUALITY_GATES.md",
    "STYLE_GUIDE.md",
    "SECURITY.md",
    "TESTING.md",
    "LOOP_CODING.md",
    "DEPLOYMENT.md",
    "UPGRADE.md",
    ".agent-kit",
    "agent-roster.json",
    "model-routing.json",
    "agents/",
    "skills/",
    "runtime-skills/",
    "prompts/",
    "checklists/",
    "design-adapters/",
    "assistant-adapters/",
    "design-briefs/",
    "profiles/",
    "rosters/",
    "schemas/"
  ];

  for (const entry of requiredEntries) {
    if (!treeText.includes(entry)) {
      throw new Error(`Example tree.txt is missing ${entry}.`);
    }
  }
}

try {
  if (!existsSync(cliPath)) {
    throw new Error("dist/index.js is missing. Run npm run build before npm run examples:check.");
  }

  execFileSync("node", [cliPath, "init", "--stack", "next-supabase"], {
    cwd: tempRoot,
    stdio: "ignore"
  });
  const generatedAudit = JSON.parse(
    execFileSync("node", [cliPath, "audit", "--json"], {
      cwd: tempRoot,
      encoding: "utf8"
    })
  );

  assertDeepEqual(
    "Example agent roster",
    readJson(join(exampleRoot, ".agent-kit", "agent-roster.json")),
    readJson(join(tempRoot, ".agent-kit", "agent-roster.json"))
  );

  assertDeepEqual(
    "Example model routing",
    readJson(join(exampleRoot, ".agent-kit", "model-routing.json")),
    readJson(join(tempRoot, ".agent-kit", "model-routing.json"))
  );

  assertDeepEqual(
    "Example manifest",
    stableManifest(readJson(join(exampleRoot, ".agent-kit", "manifest.json"))),
    stableManifest(readJson(join(tempRoot, ".agent-kit", "manifest.json")))
  );

  assertDeepEqual("Example audit output", stableAudit(readJson(join(exampleRoot, "audit-output.json"))), stableAudit(generatedAudit));

  assertTreeSummary();

  console.log(
    `example check passed: ${generatedAudit.summary.pass} pass / ${generatedAudit.summary.warn} warn / ${generatedAudit.summary.fail} fail / readiness ${generatedAudit.readiness?.level ?? "unknown"}`
  );
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
