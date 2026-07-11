import { realpathSync } from "node:fs";
import { resolve } from "node:path";

export function isSensitiveRelativePath(value: string): boolean {
  const normalized = value.replace(/\\/g, "/").replace(/^\.\//, "");
  const segments = normalized.split("/").filter(Boolean);
  const lower = segments.map((segment) => segment.toLowerCase());
  const basename = lower.at(-1) ?? "";
  if (lower.includes(".git")) return true;
  if (lower[0] === ".agent-kit" && lower[1] === "runtime" && basename !== ".gitignore") return true;
  if (basename === ".npmrc" || basename === ".pypirc" || basename === ".netrc") return true;
  if (["id_rsa", "id_dsa", "id_ecdsa", "id_ed25519"].includes(basename)) return true;
  if (/\.(?:pem|key|p12|pfx)$/.test(basename)) return true;
  if (basename === ".env" || basename.startsWith(".env.")) {
    return !/\.(?:example|sample|template)$/.test(basename);
  }
  return false;
}

export function pathIdentity(value: string, caseInsensitive = process.platform === "win32"): string {
  const normalized = value.replace(/\\/g, "/").replace(/\/+$/, "") || "/";
  return caseInsensitive ? normalized.toLowerCase() : normalized;
}

export function canonicalPath(value: string): string {
  return realpathSync.native(resolve(value));
}

export function pathsEqual(left: string, right: string, caseInsensitive = process.platform === "win32"): boolean {
  return pathIdentity(left, caseInsensitive) === pathIdentity(right, caseInsensitive);
}

export function isPathWithin(root: string, candidate: string, caseInsensitive = process.platform === "win32"): boolean {
  const rootIdentity = pathIdentity(root, caseInsensitive);
  const candidateIdentity = pathIdentity(candidate, caseInsensitive);
  const prefix = rootIdentity.endsWith("/") ? rootIdentity : `${rootIdentity}/`;
  return candidateIdentity === rootIdentity || candidateIdentity.startsWith(prefix);
}

export function assertSafeToolPath(value: string): void {
  const segments = value.replace(/\\/g, "/").split("/");
  if (segments.includes("..")) throw new Error(`Path traversal is not available to runtime tools: ${value}`);
  if (isSensitiveRelativePath(value)) throw new Error(`Sensitive path is not available to runtime tools: ${value}`);
}
