import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

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

function run(name, command, args) {
  logStep(name);
  execFileSync(command, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      npm_config_cache: process.env.npm_config_cache ?? "/tmp/agent-kit-npm-cache"
    },
    stdio: "inherit"
  });
}

validateJson();
run("Version consistency check", "npm", ["run", "version:check"]);
run("Typecheck", "npm", ["run", "typecheck"]);
run("Test", "npm", ["test"]);
run("Build", "npm", ["run", "build"]);
run("Example consistency check", "npm", ["run", "examples:check"]);
run("Install smoke", "npm", ["run", "smoke:install"]);
run("Agent Studio smoke", "npm", ["run", "smoke:studio"]);
run("Dependency audit", "npm", ["audit", "--audit-level=moderate"]);
run("SBOM check", "npm", ["run", "sbom:check"]);
run("Package dry run", "npm", ["pack", "--dry-run"]);

console.log("\nrelease check passed");
