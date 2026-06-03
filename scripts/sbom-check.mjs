import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const outputIndex = args.indexOf("--output");
const outputPath = outputIndex >= 0 ? args[outputIndex + 1] : null;
const packageJson = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
const packageLock = JSON.parse(readFileSync(join(repoRoot, "package-lock.json"), "utf8"));

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function packageNameFromPath(packagePath) {
  const parts = packagePath.split("node_modules/");
  const tail = parts[parts.length - 1];
  const segments = tail.split("/");
  return segments[0]?.startsWith("@") ? `${segments[0]}/${segments[1]}` : segments[0];
}

function purlName(name) {
  if (!name.startsWith("@")) return encodeURIComponent(name);
  const [scope, packageName] = name.slice(1).split("/");
  return `%40${encodeURIComponent(scope)}/${encodeURIComponent(packageName)}`;
}

function bomRef(name, version, packagePath) {
  return `pkg:npm/${purlName(name)}@${encodeURIComponent(version)}?path=${encodeURIComponent(packagePath)}`;
}

function deterministicUuid(value) {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function scopeFor(entry) {
  if (entry.optional) return "optional";
  if (entry.dev || entry.devOptional) return "excluded";
  return "required";
}

function integrityHashes(integrity) {
  if (!integrity || typeof integrity !== "string") return [];
  return integrity
    .split(/\s+/)
    .map((part) => {
      const separator = part.indexOf("-");
      if (separator === -1) return null;
      const alg = part.slice(0, separator).toUpperCase().replace("SHA", "SHA-");
      const value = part.slice(separator + 1);
      if (!value) return null;
      return {
        alg,
        content: Buffer.from(value, "base64").toString("hex")
      };
    })
    .filter(Boolean);
}

function externalReferences(entry) {
  const references = [];
  if (typeof entry.resolved === "string") {
    references.push({ type: "distribution", url: entry.resolved });
  }
  return references;
}

function licenses(entry) {
  if (!entry.license || typeof entry.license !== "string") return [];
  return [{ license: { id: entry.license } }];
}

function parentPrefix(packagePath) {
  const marker = "/node_modules/";
  const index = packagePath.lastIndexOf(marker);
  if (index === -1) return "";
  return packagePath.slice(0, index);
}

const packageEntries = Object.entries(packageLock.packages ?? {})
  .filter(([packagePath, entry]) => packagePath && packagePath.includes("node_modules/") && entry && typeof entry.version === "string")
  .sort(([a], [b]) => a.localeCompare(b));

const pathToRef = new Map();
const components = packageEntries.map(([packagePath, entry]) => {
  const name = packageNameFromPath(packagePath);
  const version = entry.version;
  const ref = bomRef(name, version, packagePath);
  pathToRef.set(packagePath, ref);
  return {
    "bom-ref": ref,
    type: "library",
    name,
    version,
    scope: scopeFor(entry),
    purl: `pkg:npm/${purlName(name)}@${encodeURIComponent(version)}`,
    hashes: integrityHashes(entry.integrity),
    licenses: licenses(entry),
    externalReferences: externalReferences(entry),
    properties: [
      {
        name: "cdx:npm:package:path",
        value: packagePath
      }
    ]
  };
});

function resolveDependencyPath(fromPath, dependencyName) {
  let prefix = fromPath;
  while (true) {
    const candidate = prefix ? `${prefix}/node_modules/${dependencyName}` : `node_modules/${dependencyName}`;
    if (pathToRef.has(candidate)) return candidate;
    if (!prefix) return null;
    prefix = parentPrefix(prefix);
  }
}

const unresolved = [];
const skippedOptional = [];
const rootRef = bomRef(packageJson.name, packageJson.version, "");
const rootDependencyNames = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {})
].sort();

const dependencies = [
  {
    ref: rootRef,
    dependsOn: rootDependencyNames
      .map((dependencyName) => {
        const resolvedPath = resolveDependencyPath("", dependencyName);
        if (!resolvedPath) unresolved.push(`${packageJson.name} -> ${dependencyName}`);
        return resolvedPath ? pathToRef.get(resolvedPath) : null;
      })
      .filter(Boolean)
  }
];

for (const [packagePath, entry] of packageEntries) {
  const names = [
    ...Object.keys(entry.dependencies ?? {}),
    ...Object.keys(entry.optionalDependencies ?? {})
  ].sort();
  dependencies.push({
    ref: pathToRef.get(packagePath),
    dependsOn: names
      .map((dependencyName) => {
        const resolvedPath = resolveDependencyPath(packagePath, dependencyName);
        if (!resolvedPath) {
          const unresolvedLink = `${packagePath} -> ${dependencyName}`;
          if (entry.optional || entry.devOptional) skippedOptional.push(unresolvedLink);
          else unresolved.push(unresolvedLink);
        }
        return resolvedPath ? pathToRef.get(resolvedPath) : null;
      })
      .filter(Boolean)
  });
}

const sbom = {
  "$schema": "http://cyclonedx.org/schema/bom-1.5.schema.json",
  bomFormat: "CycloneDX",
  specVersion: "1.5",
  serialNumber: `urn:uuid:${deterministicUuid(`${packageJson.name}@${packageJson.version}`)}`,
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    lifecycles: [{ phase: "build" }],
    tools: [
      {
        vendor: "agent-skills",
        name: "package-lock-cyclonedx",
        version: packageJson.version
      }
    ],
    component: {
      "bom-ref": rootRef,
      type: "library",
      name: packageJson.name,
      version: packageJson.version,
      scope: "required",
      purl: `pkg:npm/${purlName(packageJson.name)}@${encodeURIComponent(packageJson.version)}`,
      licenses: [{ license: { id: packageJson.license ?? "MIT" } }],
      externalReferences: [
        {
          type: "vcs",
          url: packageJson.repository?.url ?? "https://github.com/lukey662/agentsandskills"
        }
      ],
      properties: [{ name: "cdx:npm:package:path", value: "" }]
    }
  },
  components,
  dependencies
};

const requiredRuntimeDependencies = Object.keys(packageJson.dependencies ?? {});
const componentNames = new Set(components.map((component) => component.name));
for (const dependencyName of requiredRuntimeDependencies) {
  if (!componentNames.has(dependencyName)) {
    fail(`SBOM is missing runtime dependency ${dependencyName}.`);
  }
}

if (sbom.bomFormat !== "CycloneDX" || sbom.specVersion !== "1.5") {
  fail("SBOM metadata is not CycloneDX 1.5.");
}

if (components.length === 0) {
  fail("SBOM contains no dependency components.");
}

if (unresolved.length > 0) {
  fail(`SBOM has unresolved dependency links:\n${unresolved.slice(0, 20).join("\n")}`);
}

if (process.exitCode) process.exit();

if (outputPath) {
  const target = outputPath.startsWith("/") ? outputPath : join(repoRoot, outputPath);
  writeFileSync(target, `${JSON.stringify(sbom, null, 2)}\n`);
  console.log(`wrote ${basename(target)} with ${components.length} components (${skippedOptional.length} optional-platform links skipped)`);
} else {
  console.log(
    `sbom check passed: CycloneDX ${sbom.specVersion}, ${components.length} components, ${dependencies.length} dependency records, ${skippedOptional.length} optional-platform links skipped`
  );
}
