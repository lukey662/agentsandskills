import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
const runtimePackageJson = JSON.parse(readFileSync(join(repoRoot, "packages", "runtime", "package.json"), "utf8"));
const packageLock = JSON.parse(readFileSync(join(repoRoot, "package-lock.json"), "utf8"));
const changelog = readFileSync(join(repoRoot, "CHANGELOG.md"), "utf8");
const runtimeChangelog = readFileSync(join(repoRoot, "packages", "runtime", "CHANGELOG.md"), "utf8");
const versionSource = readFileSync(join(repoRoot, "src", "config", "defaults.ts"), "utf8");

const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function assertEqual(name, actual, expected) {
  if (actual !== expected) fail(`${name} mismatch: expected ${expected}, got ${actual ?? "missing"}.`);
}

function validatePackage(label, manifest, lockPath, changelogText) {
  const version = manifest.version;
  if (!semverPattern.test(version)) fail(`${label} version is not valid SemVer: ${version}`);
  assertEqual(`package-lock ${lockPath || "root"} version`, packageLock.packages?.[lockPath]?.version, version);
  const changelogHeadingPattern = new RegExp(`^## \\[?${version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]?\\b`, "m");
  const headingMatch = changelogText.match(changelogHeadingPattern);
  if (!headingMatch || headingMatch.index === undefined) fail(`${label} changelog is missing a release section for ${version}.`);
  const sectionStart = headingMatch.index + headingMatch[0].length;
  const nextHeadingIndex = changelogText.slice(sectionStart).search(/^##\s+/m);
  const section =
    nextHeadingIndex === -1 ? changelogText.slice(sectionStart).trim() : changelogText.slice(sectionStart, sectionStart + nextHeadingIndex).trim();
  if (!section || !/^- .+/m.test(section)) fail(`${label} changelog release section ${version} must contain bullet entries.`);
}

validatePackage("root package", packageJson, "", changelog);
validatePackage("runtime package", runtimePackageJson, "packages/runtime", runtimeChangelog);

const version = packageJson.version;
assertEqual("package-lock root version", packageLock.version, version);
const sourceVersion = versionSource.match(/export const PACKAGE_VERSION = "([^"]+)";/)?.[1];
assertEqual("CLI source version", sourceVersion, version);

const ref = process.env.GITHUB_REF ?? "";
const refName = process.env.GITHUB_REF_NAME ?? "";
const refType = process.env.GITHUB_REF_TYPE ?? "";
const releaseTag = refType === "tag" ? refName : ref.startsWith("refs/tags/") ? ref.slice("refs/tags/".length) : "";

if (releaseTag) {
  assertEqual("release tag", releaseTag, `v${version}`);
  console.log(`version check passed: ${version}, release tag ${releaseTag}`);
} else {
  console.log(`version check passed: ${version}`);
}
