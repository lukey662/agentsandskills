import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { runNpm } from "./lib/npm-command.mjs";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const jsonFiles = ["package.json", "catalog.json"];

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
run("Changeset plan check", ["run", "changeset:check"]);
run("Typecheck", ["run", "typecheck"]);
run("Lint", ["run", "lint"]);
run("Format check", ["run", "format:check"]);
run("Test with coverage gate", ["run", "test:coverage"]);
run("Build", ["run", "build"]);
run("Package asset validation", ["run", "package:validate"]);
run("IDE adapter template validation", ["run", "adapter:validate"]);
run("Example consistency check", ["run", "examples:check"]);
run("Install smoke", ["run", "smoke:install"]);
run("Doctor gate smoke", ["run", "smoke:audit-gate"]);
run("Dependency audit", ["audit", "--audit-level=moderate"]);
run("SBOM check", ["run", "sbom:check"]);
run("Package dry run", ["pack", "--dry-run"]);
run("Runtime package dry run", ["pack", "--dry-run", "--workspace", "@appsforgood/agent-kit-runtime"]);

console.log("\nrelease check passed");
