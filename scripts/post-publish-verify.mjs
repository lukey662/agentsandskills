import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { resolveNpmCommand } from "./lib/npm-command.mjs";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
const packageName = process.env.AGENT_KIT_VERIFY_PACKAGE_NAME ?? packageJson.name;
const packageVersion = process.env.AGENT_KIT_VERIFY_PACKAGE_VERSION ?? packageJson.version;
const packageSpec = process.argv[2] ?? `${packageName}@${packageVersion}`;
const registry = process.env.npm_config_registry ?? "https://registry.npmjs.org";
const tempRoot = mkdtempSync(join(tmpdir(), "agent-kit-published-verify-"));
const env = {
  ...process.env,
  npm_config_cache: process.env.npm_config_cache ?? join(tempRoot, "npm-cache")
};

function run(command, args, options = {}) {
  const resolvedCommand =
    command === "npm" ? resolveNpmCommand() : command === "npx" ? resolveNpxCommand() : command;
  const spawnOptions = {
    cwd: options.cwd ?? repoRoot,
    env,
    encoding: options.encoding ?? "utf8",
    stdio: options.stdio ?? "pipe"
  };
  if (process.platform === "win32" && (command === "npm" || command === "npx")) {
    spawnOptions.shell = true;
  }
  return execFileSync(resolvedCommand, args, spawnOptions);
}

function runInstalledAgentKit(args, options = {}) {
  return run(
    "npm",
    ["exec", "--yes", "--package", packageSpec, "--", "agent-kit", ...args],
    options
  );
}

function verifyPackageVisible() {
  const maxAttempts = Number.parseInt(process.env.AGENT_KIT_VERIFY_ATTEMPTS ?? "12", 10);
  const delayMs = Number.parseInt(process.env.AGENT_KIT_VERIFY_DELAY_MS ?? "10000", 10);
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const version = run("npm", ["view", packageSpec, "version", `--registry=${registry}`]).trim();
      console.log(`published package visible: ${packageSpec} -> ${version}`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      console.log(`waiting for npm registry propagation (${attempt}/${maxAttempts})`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delayMs);
    }
  }

  throw lastError ?? new Error(`Package was not visible on npm: ${packageSpec}`);
}

try {
  verifyPackageVisible();

  console.log("preparing clean temp project");
  run("npm", ["init", "--yes"], { cwd: tempRoot, stdio: "ignore" });

  console.log("running published doctor");
  runInstalledAgentKit(["doctor"], { cwd: tempRoot, stdio: "inherit" });

  console.log("running published init in clean temp project");
  runInstalledAgentKit(["init", "--stack", "next-supabase"], { cwd: tempRoot, stdio: "inherit" });

  console.log("running published audit");
  const auditOutput = runInstalledAgentKit(
    ["audit", "--json", "--min-readiness", "baseline-setup"],
    { cwd: tempRoot }
  );
  const auditReport = JSON.parse(auditOutput);
  if (auditReport.summary?.fail !== 0) {
    throw new Error(`Expected published install audit to have 0 failures, got ${auditReport.summary?.fail}.\n${auditOutput}`);
  }

  console.log(
    `published package verification passed: ${auditReport.summary.pass} pass / ${auditReport.summary.warn} warn / ${auditReport.summary.fail} fail / readiness ${auditReport.readiness?.level ?? "unknown"}`
  );
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
