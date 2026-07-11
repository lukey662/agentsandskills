import { appendFileSync, closeSync, existsSync, openSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import type { IncomingMessage } from "node:http";
import { basename, dirname, join } from "node:path";
import { ensureDir, readTextIfExists, resolveInside, writeText } from "../utils/fs.js";

export const AGENT_KIT_DIR = ".agent-kit";
export const CONTEXT_JSON = ".agent-kit/project-context.json";
export const CONTEXT_MD = ".agent-kit/project-context.md";
export const CORRECTIONS_DIR = ".agent-kit/corrections";
export const PROJECT_RULES_JSON = ".agent-kit/corrections/project-rules.json";
export const AGENT_RULES_JSON = ".agent-kit/corrections/agent-rules.json";
export const UPSTREAM_PROPOSALS_JSON = ".agent-kit/corrections/upstream-proposals.json";
export const COUNCIL_SESSIONS_DIR = ".agent-kit/council-sessions";
export const ACTIVE_SESSION_FILE = ".agent-kit/council-sessions/active";
export const STUDIO_EXPORT_HTML = ".agent-kit/studio/index.html";

const SECRET_PATTERNS = [
  /gh[pousr]_[A-Za-z0-9_]{12,}/g,
  /github_pat_[A-Za-z0-9_]{20,}/g,
  /sk_(?:live|test)_[A-Za-z0-9_]{8,}/g,
  /sk-(?:proj-|svcacct-|ant-api\d{2}-)?[A-Za-z0-9_-]{20,}/g,
  /xai-[A-Za-z0-9_-]{20,}/g,
  /AIza[0-9A-Za-z_-]{30,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /(?:xox[baprs]-)[A-Za-z0-9-]{10,}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /\bBearer\s+[A-Za-z0-9._~+/-]{20,}=*/gi,
  /sbp_[A-Za-z0-9_]{12,}/g,
  /\b(?:[A-Z0-9_]*(?:API_KEY|TOKEN|SECRET|PASSWORD|PRIVATE_KEY)|DATABASE_URL)\s*=\s*(?!\\n|\\r|\\r\\n)["']?(?!(?:process\.env|import\.meta\.env|env:|keychain:|\$\{|<|replace|example|your|dummy|fake))[^\\\s"'`]{8,}/g,
  /postgres(?:ql)?:\/\/[^\s)]+/gi
];

export function nowIso(): string {
  return new Date().toISOString();
}

export function redactSensitive(text: string): string {
  return SECRET_PATTERNS.reduce((current, pattern) => current.replace(pattern, "[REDACTED]"), text);
}

export function containsLikelySecret(text: string): boolean {
  return SECRET_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}

export function assertNoLikelySecret(value: unknown, label = "Persisted value"): void {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  if (containsLikelySecret(serialized)) {
    throw new Error(`${label} appears to contain a secret. Store credentials in an environment variable or OS keychain reference instead.`);
  }
}

function redactValue(value: unknown): unknown {
  if (typeof value === "string") return redactSensitive(value);
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactValue(item)]));
  }
  return value;
}

export function safeSlug(input: string): string {
  const lowered = input.trim().toLowerCase();
  if (!lowered) throw new Error("A non-empty title or id is required.");
  if (lowered.includes("/") || lowered.includes("\\") || lowered.includes("..")) {
    throw new Error(`Unsafe session or correction id: ${input}`);
  }
  const slug = lowered
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  if (!slug) throw new Error(`Could not derive a safe id from: ${input}`);
  return slug;
}

export function ensureStudioDirs(cwd: string): void {
  ensureDir(join(cwd, AGENT_KIT_DIR));
  ensureDir(join(cwd, CORRECTIONS_DIR));
  ensureDir(join(cwd, COUNCIL_SESSIONS_DIR));
  ensureDir(join(cwd, AGENT_KIT_DIR, "onboarding"));
}

export function readJsonFile<T>(cwd: string, relativePath: string): T | null {
  const path = resolveInside(cwd, relativePath);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function writeJsonFile(cwd: string, relativePath: string, value: unknown): void {
  assertNoLikelySecret(value, relativePath);
  writeText(resolveInside(cwd, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

export function appendJsonLine(cwd: string, relativePath: string, value: unknown): void {
  const path = resolveInside(cwd, relativePath);
  ensureDir(dirname(path));
  appendFileSync(path, `${JSON.stringify(redactValue(value))}\n`);
}

export function readJsonLines(cwd: string, relativePath: string): unknown[] {
  const text = readTextIfExists(resolveInside(cwd, relativePath));
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  let lastContentIndex = -1;
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines[index]?.trim()) {
      lastContentIndex = index;
      break;
    }
  }
  return lines.flatMap((line, index) => {
    if (!line.trim()) return [];
    try {
      return [JSON.parse(line) as unknown];
    } catch (error) {
      if (index === lastContentIndex && !text.endsWith("\n") && !text.endsWith("\r")) return [];
      throw error;
    }
  });
}

export function writeTextFile(cwd: string, relativePath: string, content: string): void {
  assertNoLikelySecret(content, relativePath);
  writeText(resolveInside(cwd, relativePath), content);
}

const LOCK_SLEEP = new Int32Array(new SharedArrayBuffer(4));

export function withFileLock<T>(cwd: string, relativeLockPath: string, operation: () => T): T {
  const lockPath = resolveInside(cwd, relativeLockPath);
  ensureDir(dirname(lockPath));
  const deadline = Date.now() + 5_000;
  let descriptor: number | undefined;

  while (descriptor === undefined) {
    try {
      descriptor = openSync(lockPath, "wx", 0o600);
      writeFileSync(descriptor, `${process.pid} ${Date.now()}\n`);
    } catch (error) {
      const code = error instanceof Error && "code" in error ? error.code : undefined;
      if (code !== "EEXIST") throw error;
      try {
        if (Date.now() - statSync(lockPath).mtimeMs > 30_000) unlinkSync(lockPath);
      } catch {
        // Another process may have released the lock between checks.
      }
      if (Date.now() >= deadline) throw new Error(`Timed out waiting for local file lock: ${relativeLockPath}`);
      Atomics.wait(LOCK_SLEEP, 0, 0, 15);
    }
  }

  try {
    return operation();
  } finally {
    closeSync(descriptor);
    try {
      unlinkSync(lockPath);
    } catch {
      // The operation completed; a missing lock file does not invalidate its result.
    }
  }
}

export function readTextFile(cwd: string, relativePath: string): string | null {
  return readTextIfExists(resolveInside(cwd, relativePath));
}

export function validateRelativeArtifactPath(cwd: string, requestedPath: string): string {
  const resolved = resolveInside(cwd, requestedPath);
  if (basename(resolved).startsWith(".")) {
    throw new Error(`Hidden files cannot be recorded as artifacts: ${requestedPath}`);
  }
  return requestedPath.replace(/\\/g, "/");
}

export function escapeMarkdownText(value: string | undefined): string {
  return redactSensitive(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/[`![\]()|]/g, "\\$&")
    .replace(/\r?\n/g, "<br>");
}

export function escapeMarkdownTableCell(value: string | undefined): string {
  return escapeMarkdownText(value).replace(/\|/g, "\\|");
}

export function listMarkdown(items: string[]): string {
  if (items.length === 0) return "- None recorded.\n";
  return items.map((item) => `- ${escapeMarkdownText(item)}`).join("\n") + "\n";
}

export function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

export function readJsonBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bodyTooLarge = false;
    request.on("data", (chunk: Buffer) => {
      if (bodyTooLarge) return;
      chunks.push(chunk);
      if (chunks.reduce((total, item) => total + item.length, 0) > 256_000) {
        bodyTooLarge = true;
        reject(new Error("Request body too large."));
      }
    });
    request.on("end", () => {
      if (bodyTooLarge) return;
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw) as unknown);
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}
