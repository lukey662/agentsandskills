import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { runNpm } from "./lib/npm-command.mjs";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const jsonFiles = [
  "package.json",
  "research/scan-config.json",
  "rosters/next-supabase-default-council.json",
  "model-routing/default-model-routing.json",
  "schemas/agent-roster.schema.json",
  "schemas/council-session.schema.json",
  "schemas/audit-report.schema.json",
  "schemas/model-routing.schema.json",
  "schemas/project-context.schema.json",
  "schemas/correction-rules.schema.json",
  "schemas/session-event.schema.json",
  "schemas/studio-session.schema.json",
  "examples/next-supabase-installed/.agent-kit/agent-roster.json",
  "examples/next-supabase-installed/.agent-kit/model-routing.json",
  "examples/next-supabase-installed/.agent-kit/manifest.json",
  "examples/next-supabase-installed/audit-output.json"
];

function logStep(name) {
  console.log(`\n==> ${name}`);
}

function validateJson() {
  logStep("Validate JSON assets");
  for (const file of jsonFiles) {
    JSON.parse(readFileSync(join(repoRoot, file), "utf8"));
    console.log(`ok ${file}`);
  }
}

function run(name, args) {
  logStep(name);
  runNpm(args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      npm_config_cache: process.env.npm_config_cache ?? join(tmpdir(), "agent-kit-npm-cache")
    }
  });
}

validateJson();
run("Version consistency check", ["run", "version:check"]);
run("Typecheck", ["run", "typecheck"]);
run("Test", ["test"]);
run("Build", ["run", "build"]);
run("Example consistency check", ["run", "examples:check"]);
run("Install smoke", ["run", "smoke:install"]);
run("Agent Studio smoke", ["run", "smoke:studio"]);
run("Baseline audit gate smoke", ["run", "smoke:audit-gate"]);
run("Dependency audit", ["audit", "--audit-level=moderate"]);
run("SBOM check", ["run", "sbom:check"]);
run("Package dry run", ["pack", "--dry-run"]);

console.log("\nrelease check passed");
