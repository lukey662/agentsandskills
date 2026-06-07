import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ProjectContextContract, type ProjectContextContractValue, formatContractIssues } from "../config/contracts.js";
import { listFilesRecursive, readTextIfExists } from "../utils/fs.js";
import { CONTEXT_JSON, CONTEXT_MD, ensureStudioDirs, listMarkdown, nowIso, readJsonFile, redactSensitive, unique, writeJsonFile, writeTextFile } from "./shared.js";

export interface ContextCommandResult {
  contextPath: string;
  markdownPath: string;
  openQuestions: string[];
}

function readPackageJson(cwd: string): { scripts?: Record<string, string>; dependencies?: Record<string, string>; devDependencies?: Record<string, string> } | null {
  const path = join(cwd, "package.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

function detectPackageManager(cwd: string): string | undefined {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "package-lock.json"))) return "npm";
  if (existsSync(join(cwd, "bun.lockb")) || existsSync(join(cwd, "bun.lock"))) return "bun";
  return undefined;
}

function detectFromDependencies(packageJson: ReturnType<typeof readPackageJson>, names: string[]): string[] {
  const deps = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {})
  };
  return names.filter((name) => deps[name] !== undefined);
}

function readEnvExampleKeys(cwd: string): string[] {
  const envText = readTextIfExists(join(cwd, ".env.example")) ?? "";
  return unique(
    envText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => line.split("=")[0]?.trim() ?? "")
      .filter(Boolean)
  );
}

function inferOpenQuestions(context: ProjectContextContractValue): string[] {
  const missing: string[] = [];
  const questions = [
    ["productSummary", "What does this product do in one concrete paragraph?"],
    ["primaryAudience", "Who is the primary user or buyer?"],
    ["authModel", "What authentication model should agents preserve?"],
    ["tenantModel", "Is this single-user, team, tenant, marketplace, admin, or public content?"]
  ] as const;
  missing.push(...questions.flatMap(([field, question]) => (context[field].trim() ? [] : [question])));
  if (context.primaryWorkflows.length === 0) missing.push("What are the top three user workflows?");
  if (!context.uiDirection.preferred.trim()) missing.push("What should the UI feel like, and what should it avoid?");
  if (!context.messaging.valueProposition.trim()) missing.push("What value proposition and proof should public copy use?");
  return unique([...context.openQuestions, ...missing]);
}

export function scanProjectContext(cwd: string): ProjectContextContractValue {
  const packageJson = readPackageJson(cwd);
  const files = listFilesRecursive(cwd);
  const dependencies = detectFromDependencies(packageJson, [
    "next",
    "react",
    "@supabase/supabase-js",
    "@supabase/ssr",
    "tailwindcss",
    "vitest",
    "playwright",
    "@playwright/test",
    "jest",
    "storybook"
  ]);
  const frameworks = dependencies.filter((name) => ["next", "react", "@supabase/supabase-js", "@supabase/ssr"].includes(name));
  const uiLibraries = dependencies.filter((name) => ["tailwindcss", "storybook"].includes(name));
  const testTools = dependencies.filter((name) => ["vitest", "playwright", "@playwright/test", "jest", "storybook"].includes(name));
  const supabaseSignals = files.filter((file) => /(^|\/)(supabase|migrations|seed)\b/.test(file) || file.includes("supabase"));
  const deployment = files.filter((file) => /(^|\/)(vercel\.json|netlify\.toml|Dockerfile|docker-compose\.yml|\.github\/workflows\/.*\.ya?ml)$/.test(file));
  const existing = readJsonFile<ProjectContextContractValue>(cwd, CONTEXT_JSON);
  const now = nowIso();

  const context: ProjectContextContractValue = {
    schemaVersion: 1,
    projectName: existing?.projectName || readPackageName(cwd) || "TBD",
    productSummary: existing?.productSummary ?? "",
    productCategory: existing?.productCategory ?? "TBD",
    primaryAudience: existing?.primaryAudience ?? "",
    primaryWorkflows: existing?.primaryWorkflows ?? [],
    businessCriticalBehavior: existing?.businessCriticalBehavior ?? [],
    architecture: {
      packageManager: detectPackageManager(cwd) ?? existing?.architecture.packageManager,
      scripts: unique(Object.keys(packageJson?.scripts ?? {})),
      frameworks: unique([...(existing?.architecture.frameworks ?? []), ...frameworks]),
      uiLibraries: unique([...(existing?.architecture.uiLibraries ?? []), ...uiLibraries]),
      hasSupabase: Boolean(existing?.architecture.hasSupabase || supabaseSignals.length > 0 || frameworks.some((name) => name.includes("supabase"))),
      supabaseSignals: unique([...(existing?.architecture.supabaseSignals ?? []), ...supabaseSignals.slice(0, 20)]),
      testTools: unique([...(existing?.architecture.testTools ?? []), ...testTools]),
      envExampleKeys: readEnvExampleKeys(cwd),
      deployment: unique([...(existing?.architecture.deployment ?? []), ...deployment.slice(0, 20)])
    },
    dataSensitivity: existing?.dataSensitivity ?? [],
    authModel: existing?.authModel ?? "",
    tenantModel: existing?.tenantModel ?? "",
    integrations: existing?.integrations ?? [],
    uiDirection: existing?.uiDirection ?? { preferred: "", avoid: "" },
    messaging: existing?.messaging ?? { valueProposition: "", proof: [], objections: [] },
    qualityTarget: existing?.qualityTarget ?? "baseline-setup",
    knownConstraints: existing?.knownConstraints ?? [],
    openQuestions: existing?.openQuestions ?? [],
    evidence: uniqueEvidence([
      ...(existing?.evidence ?? []),
      { source: "agent-kit context scan", note: `Scanned ${files.length} files for package, Supabase, test, env example, and deployment signals.` }
    ]),
    lastReviewedAt: now,
    owners: existing?.owners ?? []
  };
  context.openQuestions = inferOpenQuestions(context);
  return ProjectContextContract.parse(context);
}

function readPackageName(cwd: string): string | null {
  const packageJson = readPackageJson(cwd);
  return typeof (packageJson as { name?: unknown } | null)?.name === "string" ? (packageJson as { name: string }).name : null;
}

function uniqueEvidence(items: ProjectContextContractValue["evidence"]): ProjectContextContractValue["evidence"] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.source}:${item.note}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function writeProjectContext(cwd: string, context: ProjectContextContractValue): ContextCommandResult {
  ensureStudioDirs(cwd);
  const parsed = ProjectContextContract.parse(context);
  writeJsonFile(cwd, CONTEXT_JSON, parsed);
  const markdown = renderProjectContextMarkdown(parsed);
  writeTextFile(cwd, CONTEXT_MD, markdown);
  return { contextPath: CONTEXT_JSON, markdownPath: CONTEXT_MD, openQuestions: parsed.openQuestions };
}

export function initProjectContext(cwd: string): ContextCommandResult {
  return writeProjectContext(cwd, scanProjectContext(cwd));
}

export function validateProjectContext(cwd: string): ContextCommandResult {
  const context = readJsonFile<unknown>(cwd, CONTEXT_JSON);
  const result = ProjectContextContract.safeParse(context);
  if (!result.success) {
    throw new Error(`Invalid ${CONTEXT_JSON}: ${formatContractIssues(result.error).join("; ")}`);
  }
  return { contextPath: CONTEXT_JSON, markdownPath: CONTEXT_MD, openQuestions: result.data.openQuestions };
}

export function renderProjectContext(cwd: string): ContextCommandResult {
  const context = readJsonFile<unknown>(cwd, CONTEXT_JSON);
  const result = ProjectContextContract.safeParse(context);
  if (!result.success) {
    throw new Error(`Invalid ${CONTEXT_JSON}: ${formatContractIssues(result.error).join("; ")}`);
  }
  writeTextFile(cwd, CONTEXT_MD, renderProjectContextMarkdown(result.data));
  return { contextPath: CONTEXT_JSON, markdownPath: CONTEXT_MD, openQuestions: result.data.openQuestions };
}

export function renderProjectContextMarkdown(context: ProjectContextContractValue): string {
  return `# Project Context

Generated from \`${CONTEXT_JSON}\`.

## Summary

- Project: ${redactSensitive(context.projectName || "TBD")}
- Category: ${redactSensitive(context.productCategory || "TBD")}
- Audience: ${redactSensitive(context.primaryAudience || "TBD")}
- Quality target: ${context.qualityTarget}
- Last reviewed: ${context.lastReviewedAt}

${redactSensitive(context.productSummary || "No product summary recorded.")}

## Primary Workflows

${listMarkdown(context.primaryWorkflows)}

## Architecture Signals

- Package manager: ${context.architecture.packageManager ?? "unknown"}
- Frameworks: ${context.architecture.frameworks.join(", ") || "none detected"}
- UI libraries: ${context.architecture.uiLibraries.join(", ") || "none detected"}
- Test tools: ${context.architecture.testTools.join(", ") || "none detected"}
- Supabase detected: ${context.architecture.hasSupabase ? "yes" : "no"}
- Env example keys: ${context.architecture.envExampleKeys.join(", ") || "none detected"}
- Deployment files: ${context.architecture.deployment.join(", ") || "none detected"}

## Security And Data

- Auth model: ${redactSensitive(context.authModel || "TBD")}
- Tenant model: ${redactSensitive(context.tenantModel || "TBD")}

Data sensitivity:

${listMarkdown(context.dataSensitivity)}

## UI Direction

- Preferred: ${redactSensitive(context.uiDirection.preferred || "TBD")}
- Avoid: ${redactSensitive(context.uiDirection.avoid || "TBD")}

## Messaging

- Value proposition: ${redactSensitive(context.messaging.valueProposition || "TBD")}

Proof:

${listMarkdown(context.messaging.proof)}

Objections:

${listMarkdown(context.messaging.objections)}

## Open Questions

${listMarkdown(context.openQuestions)}

## Evidence

| Source | Note |
| --- | --- |
${context.evidence.map((item) => `| ${redactSensitive(item.source)} | ${redactSensitive(item.note).replace(/\|/g, "\\|")} |`).join("\n")}
`;
}
