import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
const packageLock = JSON.parse(readFileSync(join(repoRoot, "package-lock.json"), "utf8"));
const changelog = readFileSync(join(repoRoot, "CHANGELOG.md"), "utf8");

const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function assertEqual(name, actual, expected) {
  if (actual !== expected) fail(`${name} mismatch: expected ${expected}, got ${actual ?? "missing"}.`);
}

const version = packageJson.version;
if (!semverPattern.test(version)) fail(`package.json version is not valid SemVer: ${version}`);

assertEqual("package-lock root version", packageLock.version, version);
assertEqual("package-lock packages[\"\"] version", packageLock.packages?.[""]?.version, version);

const changelogHeadingPattern = new RegExp(`^## \\[?${version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]?\\b`, "m");
const headingMatch = changelog.match(changelogHeadingPattern);
if (!headingMatch || headingMatch.index === undefined) {
  fail(`CHANGELOG.md is missing a release section for ${version}.`);
}

const sectionStart = headingMatch.index + headingMatch[0].length;
const nextHeadingIndex = changelog.slice(sectionStart).search(/^##\s+/m);
const section =
  nextHeadingIndex === -1 ? changelog.slice(sectionStart).trim() : changelog.slice(sectionStart, sectionStart + nextHeadingIndex).trim();
if (!section || !section.startsWith("- ")) {
  fail(`CHANGELOG.md release section ${version} must contain bullet entries.`);
}

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
