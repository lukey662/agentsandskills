import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const changesetDirectory = join(root, ".changeset");
const bumpRank = { patch: 1, minor: 2, major: 3 };

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeAtomic(path, content) {
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, content);
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
}

export function parseChangeset(path) {
  const source = readFileSync(path, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`Malformed changeset frontmatter: ${basename(path)}`);
  const releases = match[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const release = line.match(/^("(?:[^"\\]|\\.)*"|'[^']+'|[^:]+):\s*(patch|minor|major)$/);
      if (!release) throw new Error(`Unsupported changeset release entry in ${basename(path)}: ${line}`);
      const rawName = release[1].trim();
      const name = rawName.startsWith('"') ? JSON.parse(rawName) : rawName.startsWith("'") ? rawName.slice(1, -1) : rawName;
      return { name, type: release[2] };
    });
  if (releases.length !== 1) {
    throw new Error(`Changeset ${basename(path)} must target exactly one package so root and workspace versioning remain deterministic.`);
  }
  const summary = match[2].trim().replace(/\s+/g, " ");
  if (!summary) throw new Error(`Changeset ${basename(path)} requires a non-empty summary.`);
  return { path, releases, summary };
}

export function incrementVersion(version, type) {
  const match = version.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
  if (!match) throw new Error(`Unsupported package version: ${version}`);
  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]);
  if (type === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (type === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

function listChangesets() {
  return readdirSync(changesetDirectory)
    .filter((name) => name.endsWith(".md") && name !== "README.md")
    .sort()
    .map((name) => parseChangeset(join(changesetDirectory, name)));
}

function versionRootPackage(rootChangesets, rootPackage) {
  const highest = rootChangesets.reduce((current, changeset) => {
    const type = changeset.releases[0].type;
    return bumpRank[type] > bumpRank[current] ? type : current;
  }, "patch");
  const nextVersion = incrementVersion(rootPackage.version, highest);
  const packagePath = join(root, "package.json");
  const lockPath = join(root, "package-lock.json");
  const changelogPath = join(root, "CHANGELOG.md");
  const versionSourcePath = join(root, "src", "config", "defaults.ts");
  const lock = readJson(lockPath);
  if (!lock.packages?.[""]) throw new Error("package-lock.json is missing its root package record.");
  if (lock.packages[""].version !== rootPackage.version) {
    throw new Error(`Root package-lock version ${lock.packages[""].version ?? "missing"} does not match package.json ${rootPackage.version}.`);
  }
  if (lock.version !== rootPackage.version) {
    throw new Error(`Top-level package-lock version ${lock.version ?? "missing"} does not match package.json ${rootPackage.version}.`);
  }
  const versionSource = readFileSync(versionSourcePath, "utf8");
  const versionDeclaration = `export const PACKAGE_VERSION = "${rootPackage.version}";`;
  if (!versionSource.includes(versionDeclaration)) {
    throw new Error(`src/config/defaults.ts does not declare PACKAGE_VERSION ${rootPackage.version}.`);
  }
  const changelog = readFileSync(changelogPath, "utf8");
  if (new RegExp(`^## ${nextVersion.replace(/\./g, "\\.")}$`, "m").test(changelog)) {
    throw new Error(`CHANGELOG.md already contains version ${nextVersion}.`);
  }
  const heading = "# Changelog\n";
  if (!changelog.startsWith(heading)) throw new Error("CHANGELOG.md must start with '# Changelog'.");
  const notes = rootChangesets.map((changeset) => `- ${changeset.summary}`).join("\n");
  const nextChangelog = `${heading}\n## ${nextVersion}\n\n${notes}\n\n${changelog.slice(heading.length).replace(/^\n+/, "")}`;
  rootPackage.version = nextVersion;
  lock.version = nextVersion;
  lock.packages[""].version = nextVersion;
  writeAtomic(packagePath, `${JSON.stringify(rootPackage, null, 2)}\n`);
  writeAtomic(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  writeAtomic(changelogPath, nextChangelog);
  writeAtomic(versionSourcePath, versionSource.replace(versionDeclaration, `export const PACKAGE_VERSION = "${nextVersion}";`));
  for (const changeset of rootChangesets) rmSync(changeset.path);
  return nextVersion;
}

function runWorkspaceVersion(rootChangesets) {
  const cli = join(root, "node_modules", "@changesets", "cli", "bin.js");
  if (rootChangesets.length === 0) {
    execFileSync(process.execPath, [cli, "version"], { cwd: root, stdio: "inherit" });
    return;
  }
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "agent-kit-root-changesets-"));
  try {
    for (const changeset of rootChangesets) renameSync(changeset.path, join(temporaryDirectory, basename(changeset.path)));
    execFileSync(process.execPath, [cli, "version"], { cwd: root, stdio: "inherit" });
  } finally {
    for (const changeset of rootChangesets) {
      const held = join(temporaryDirectory, basename(changeset.path));
      if (existsSync(held)) renameSync(held, changeset.path);
    }
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

export function synchronizeWorkspaceLock(lock, workspacePackages) {
  if (!lock.packages || typeof lock.packages !== "object") throw new Error("package-lock.json is missing package records.");
  for (const [workspacePath, workspacePackage] of Object.entries(workspacePackages)) {
    const record = lock.packages[workspacePath];
    if (!record) throw new Error(`package-lock.json is missing workspace record ${workspacePath}.`);
    if (record.name && record.name !== workspacePackage.name) {
      throw new Error(`Workspace ${workspacePath} name mismatch: package-lock has ${record.name}, package.json has ${workspacePackage.name}.`);
    }
    record.version = workspacePackage.version;
  }
  return lock;
}

function syncWorkspaceLockfile() {
  const lockPath = join(root, "package-lock.json");
  const lock = readJson(lockPath);
  const workspacePackages = Object.fromEntries(
    Object.keys(lock.packages ?? {}).flatMap((workspacePath) => {
      if (!workspacePath || workspacePath.startsWith("node_modules/")) return [];
      const packagePath = join(root, workspacePath, "package.json");
      return existsSync(packagePath) ? [[workspacePath, readJson(packagePath)]] : [];
    })
  );
  synchronizeWorkspaceLock(lock, workspacePackages);
  writeAtomic(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}

function main() {
  const rootPackage = readJson(join(root, "package.json"));
  const changesets = listChangesets();
  const rootChangesets = changesets.filter((changeset) => changeset.releases[0].name === rootPackage.name);
  const workspaceChangesets = changesets.filter((changeset) => changeset.releases[0].name !== rootPackage.name);
  if (process.argv.includes("--check")) {
    console.log(`Validated ${changesets.length} changeset(s): root=${rootChangesets.length}, workspace=${workspaceChangesets.length}.`);
    return;
  }
  if (changesets.length === 0) {
    console.log("No changesets to version.");
    return;
  }
  if (workspaceChangesets.length > 0) runWorkspaceVersion(rootChangesets);
  const rootVersion = rootChangesets.length > 0 ? versionRootPackage(rootChangesets, rootPackage) : undefined;
  if (workspaceChangesets.length > 0) syncWorkspaceLockfile();
  console.log(`Versioned packages${rootVersion ? `; root=${rootVersion}` : ""}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
