import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
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
  /sbp_[A-Za-z0-9_]{12,}/g,
  /(?:SUPABASE_SERVICE_ROLE_KEY|DATABASE_URL|OPENAI_API_KEY|ANTHROPIC_API_KEY|GITHUB_TOKEN)=["']?[^"'\s]+/gi,
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
}

export function readJsonFile<T>(cwd: string, relativePath: string): T | null {
  const path = resolveInside(cwd, relativePath);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function writeJsonFile(cwd: string, relativePath: string, value: unknown): void {
  writeText(resolveInside(cwd, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

export function appendJsonLine(cwd: string, relativePath: string, value: unknown): void {
  const path = resolveInside(cwd, relativePath);
  ensureDir(dirname(path));
  appendFileSync(path, `${JSON.stringify(value)}\n`);
}

export function readJsonLines(cwd: string, relativePath: string): unknown[] {
  const text = readTextIfExists(resolveInside(cwd, relativePath));
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as unknown);
}

export function writeTextFile(cwd: string, relativePath: string, content: string): void {
  writeText(resolveInside(cwd, relativePath), content);
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
  return escapeMarkdownText(value)
    .replace(/\|/g, "\\|")
}

export function listMarkdown(items: string[]): string {
  if (items.length === 0) return "- None recorded.\n";
  return items.map((item) => `- ${escapeMarkdownText(item)}`).join("\n") + "\n";
}

export function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}
