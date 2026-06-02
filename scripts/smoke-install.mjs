import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const tempRoot = mkdtempSync(join(tmpdir(), "agent-kit-smoke-"));
const npmEnv = {
  ...process.env,
  npm_config_cache: join(tempRoot, "npm-cache")
};
const forbiddenPublicPatterns = [
  /@afg/i,
  /\bAFG\b/,
  /private package/i,
  /private-first/i,
  /private v0\.1/i,
  /restricted access/i,
  /publish --access restricted/i,
  /NPM_READ_TOKEN/,
  /NPM_TOKEN/,
  /Do not redistribute/i
];

function listFiles(root) {
  const entries = [];
  for (const entry of readdir(root)) {
    const path = join(root, entry);
    const stats = stat(path);
    if (stats.isDirectory()) entries.push(...listFiles(path));
    if (stats.isFile()) entries.push(path);
  }
  return entries;
}

function readdir(path) {
  return existsSync(path) ? readdirSync(path) : [];
}

function stat(path) {
  return statSync(path);
}

try {
  const packOutput = execFileSync("npm", ["pack", "--json", "--pack-destination", tempRoot], {
    cwd: repoRoot,
    env: npmEnv,
    encoding: "utf8"
  });
  const [packResult] = JSON.parse(packOutput);
  if (!packResult?.filename) throw new Error("npm pack did not return a package filename.");

  const tarballPath = join(tempRoot, packResult.filename);
  const unpackRoot = join(tempRoot, "unpack");
  mkdirSync(unpackRoot);
  execFileSync("tar", ["-xzf", tarballPath, "-C", unpackRoot]);

  const packageRoot = join(unpackRoot, "package");
  const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  const binPath = packageJson.bin?.["agent-kit"];
  if (packageJson.name !== "@agent-skills/next-supabase-kit") {
    throw new Error(`Unexpected package name in tarball: ${packageJson.name}`);
  }
  if (binPath !== "dist/index.js") {
    throw new Error(`Unexpected agent-kit bin path in tarball: ${binPath}`);
  }
  if (!existsSync(join(packageRoot, binPath))) {
    throw new Error(`Packaged CLI is missing at ${binPath}.`);
  }

  for (const file of listFiles(packageRoot)) {
    const text = readFileSync(file, "utf8");
    for (const pattern of forbiddenPublicPatterns) {
      if (pattern.test(text)) {
        throw new Error(`Packaged file ${file} contains forbidden public-package text matching ${pattern}.`);
      }
    }
  }

  const projectRoot = join(tempRoot, "project");
  mkdirSync(projectRoot);
  execFileSync("npm", ["init", "--yes"], { cwd: projectRoot, env: npmEnv, stdio: "ignore" });
  execFileSync("npm", ["install", "--no-audit", "--ignore-scripts", "--package-lock=false", tarballPath], {
    cwd: projectRoot,
    env: npmEnv,
    stdio: "inherit"
  });
  const cliPath = join(projectRoot, "node_modules", ".bin", "agent-kit");
  execFileSync(cliPath, ["init", "--stack", "next-supabase"], { cwd: projectRoot, stdio: "inherit" });
  const auditOutput = execFileSync(cliPath, ["audit", "--json"], { cwd: projectRoot, encoding: "utf8" });
  const auditReport = JSON.parse(auditOutput);
  if (auditReport.summary?.fail !== 0) {
    throw new Error(`Expected install smoke audit to have 0 failures, got ${auditReport.summary?.fail}.\n${auditOutput}`);
  }

  console.log(`install smoke passed: ${auditReport.summary.pass} pass / ${auditReport.summary.warn} warn / ${auditReport.summary.fail} fail`);
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
