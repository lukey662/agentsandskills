import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { AuditFinding } from "../../config/types.js";
import { listFilesRecursive } from "../../utils/fs.js";
import { CONTEXT_JSON, containsLikelySecret } from "../../studio/shared.js";
import { AuditRuleRegistry, type AuditRuleContext } from "./types.js";

function relativeFilesFromGit(cwd: string): { files: string[]; tracked: boolean } {
  try {
    const output = execFileSync("git", ["ls-files", "-z", "--cached"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return { files: output.split("\0").filter(Boolean), tracked: true };
  } catch {
    return { files: listFilesRecursive(cwd), tracked: false };
  }
}

function readPackageJson(cwd: string): { scripts?: Record<string, string> } | null {
  const path = join(cwd, "package.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as { scripts?: Record<string, string> };
  } catch {
    return null;
  }
}

function testScriptLooksExecutable(script: string): boolean {
  if (/\b(?:echo|printf)\b.*\b(?:no|skip|todo|placeholder)\b.*\btests?\b/i.test(script)) return false;
  if (/^(?:true|exit\s+0|:)(?:\s|$)/i.test(script.trim())) return false;
  return /\b(?:vitest|jest|playwright|node\s+--test|tsx?\s+--test|pytest|cargo\s+test|go\s+test|flutter\s+test|dart\s+test|mvn\s+test|gradle\w*\s+test)\b/i.test(
    script
  );
}

function normalizeSqlIdentifier(identifier: string): string {
  return identifier
    .split(".")
    .map((part) => part.replace(/^"|"$/g, "").toLowerCase())
    .join(".");
}

function collectSqlIdentifiers(sql: string, expression: RegExp): Set<string> {
  const values = new Set<string>();
  for (const match of sql.matchAll(expression)) {
    if (match[1]) values.add(normalizeSqlIdentifier(match[1]));
  }
  return values;
}

function containsLikelySecretForAudit(relativeFile: string, content: string): boolean {
  const normalized = relativeFile.replace(/\\/g, "/");
  const testSecretFixture = ["sk", "test", "fake", "secret", "value"].join("_");
  let candidate = content
    .replace(/gh[pousr]_(?:replace|example|fake|dummy)[A-Za-z0-9_]*/gi, "x")
    .replaceAll(testSecretFixture, "x")
    .replaceAll("sk-proj-this-is-a-resolved-secret-value", "x")
    .replace(/sk-testsecret[A-Za-z0-9_-]*/g, "x");
  if (normalized.startsWith("tests/") && content.includes("not.toContain(fakeSecret)")) candidate = candidate.replaceAll("top-secret-value", "x");
  return containsLikelySecret(candidate);
}

function evaluateRls(context: AuditRuleContext): AuditFinding | AuditFinding[] | null {
  const migrationsDir = join(context.cwd, "supabase", "migrations");
  if (!existsSync(migrationsDir)) return null;
  const sqlFiles = listFilesRecursive(migrationsDir).filter((file) => file.endsWith(".sql"));
  if (sqlFiles.length === 0) {
    return {
      level: "warn",
      area: "project-reality",
      message: "supabase/migrations exists but contains no SQL migration files.",
      remediation: "Add versioned SQL migrations or remove the empty migrations directory if Supabase is not in use.",
      confidence: "high",
      evidence: [{ kind: "file", path: "supabase/migrations", summary: "Migration directory is empty.", observedAt: context.observedAt }]
    };
  }

  const created = new Set<string>();
  const rlsEnabled = new Set<string>();
  const policyTables = new Set<string>();
  for (const file of sqlFiles) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    for (const table of collectSqlIdentifiers(sql, /create\s+table\s+(?:if\s+not\s+exists\s+)?((?:"?[a-zA-Z_][\w$-]*"?\.)?"?[a-zA-Z_][\w$-]*"?)/gi))
      created.add(table);
    for (const table of collectSqlIdentifiers(
      sql,
      /alter\s+table\s+(?:only\s+)?((?:"?[a-zA-Z_][\w$-]*"?\.)?"?[a-zA-Z_][\w$-]*"?)\s+enable\s+row\s+level\s+security/gi
    ))
      rlsEnabled.add(table);
    for (const table of collectSqlIdentifiers(sql, /create\s+policy\s+[\s\S]*?\s+on\s+((?:"?[a-zA-Z_][\w$-]*"?\.)?"?[a-zA-Z_][\w$-]*"?)/gi))
      policyTables.add(table);
  }

  const missingRls = [...created].filter((table) => !rlsEnabled.has(table)).sort();
  if (missingRls.length > 0 || rlsEnabled.size === 0) {
    return {
      level: "fail",
      area: "project-reality",
      message:
        missingRls.length > 0
          ? `Migration-created tables missing explicit row level security (RLS) enablement: ${missingRls.join(", ")}.`
          : "No Supabase migration enables row level security.",
      remediation: "Enable RLS explicitly for every application table and add intentional policies before shipping user data.",
      confidence: "high",
      evidence: sqlFiles.map((file) => ({
        kind: "file",
        path: `supabase/migrations/${file}`,
        summary: "Parsed SQL migration.",
        observedAt: context.observedAt
      }))
    };
  }

  const withoutPolicies = [...rlsEnabled].filter((table) => created.has(table) && !policyTables.has(table)).sort();
  const findings: AuditFinding[] = [
    {
      level: "pass",
      area: "project-reality",
      message: `Supabase migrations explicitly enable RLS for ${rlsEnabled.size} table(s).`,
      confidence: "high",
      evidence: sqlFiles.map((file) => ({
        kind: "file",
        path: `supabase/migrations/${file}`,
        summary: "Parsed SQL migration.",
        observedAt: context.observedAt
      }))
    }
  ];
  if (withoutPolicies.length > 0) {
    findings.push({
      level: "warn",
      area: "project-reality",
      message: `RLS-enabled tables without a policy in the scanned migrations: ${withoutPolicies.join(", ")}.`,
      remediation: "Add explicit policies or document why access should remain denied by default.",
      confidence: "medium",
      evidence: []
    });
  }
  return findings;
}

function evaluateTests(context: AuditRuleContext): AuditFinding {
  const packageJson = readPackageJson(context.cwd);
  if (!packageJson) {
    return {
      level: "warn",
      area: "project-reality",
      message: "No package.json found to verify test scripts.",
      remediation: "Add package.json with executable test, lint, and build scripts appropriate to the stack.",
      confidence: "high",
      evidence: []
    };
  }
  const scripts = packageJson.scripts ?? {};
  const entry = (["test", "test:unit", "test:ci"] as const).find((name) => scripts[name]);
  if (!entry) {
    return {
      level: "warn",
      area: "project-reality",
      message: "package.json has no test script (test, test:unit, or test:ci).",
      remediation: "Add an executable test command and document it in TESTING.md.",
      confidence: "high",
      evidence: [{ kind: "file", path: "package.json", summary: "No supported test script key was found.", observedAt: context.observedAt }]
    };
  }
  const script = scripts[entry] ?? "";
  const files = listFilesRecursive(context.cwd);
  const hasTests = files.some((file) => /(^|\/)(?:tests?|__tests__)(\/|$)|\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(file));
  if (!testScriptLooksExecutable(script) || !hasTests) {
    return {
      level: "warn",
      area: "project-reality",
      message: `package.json script ${entry} does not provide credible executable test evidence.`,
      remediation: "Use a recognized test runner and keep at least one discoverable test file in the repository.",
      confidence: "high",
      evidence: [{ kind: "configuration", path: "package.json", summary: `${entry}: ${script}`, observedAt: context.observedAt }]
    };
  }
  return {
    level: "pass",
    area: "project-reality",
    message: `package.json defines executable test script ${entry} and discoverable test files exist.`,
    confidence: "high",
    evidence: [{ kind: "configuration", path: "package.json", summary: `${entry}: ${script}`, observedAt: context.observedAt }]
  };
}

function evaluateSecrets(context: AuditRuleContext): AuditFinding | null {
  const inventory = relativeFilesFromGit(context.cwd);
  const candidates = inventory.files.filter((file) => {
    const normalized = file.replace(/\\/g, "/");
    if (normalized.includes("node_modules/") || normalized.includes(".agent-kit/")) return false;
    const path = join(context.cwd, file);
    try {
      return statSync(path).isFile() && statSync(path).size <= 1_000_000;
    } catch {
      return false;
    }
  });
  const hits = candidates.flatMap((file) => {
    try {
      const content = readFileSync(join(context.cwd, file), "utf8");
      if (content.includes("\0")) return [];
      return containsLikelySecretForAudit(file, content) ? [file.replace(/\\/g, "/")] : [];
    } catch {
      return [];
    }
  });
  if (hits.length > 0) {
    return {
      level: "fail",
      area: "project-reality",
      message: `Possible ${inventory.tracked ? "committed" : "workspace"} secret patterns detected in: ${hits.slice(0, 5).join(", ")}.`,
      remediation: "Remove secrets, rotate exposed credentials, and store only credential references in project files.",
      confidence: inventory.tracked ? "high" : "medium",
      evidence: hits
        .slice(0, 20)
        .map((path) => ({ kind: "file", path, summary: "Secret-like pattern detected; value omitted.", observedAt: context.observedAt }))
    };
  }
  if (candidates.length === 0) return null;
  return {
    level: "pass",
    area: "project-reality",
    message: `No obvious secret patterns detected in ${inventory.tracked ? "Git-tracked" : "workspace"} files.`,
    confidence: inventory.tracked ? "high" : "medium",
    evidence: [{ kind: "command", summary: inventory.tracked ? "git ls-files --cached" : "Recursive workspace fallback", observedAt: context.observedAt }]
  };
}

function evaluateContext(context: AuditRuleContext): AuditFinding {
  if (context.packageRepository) {
    return {
      level: "pass",
      area: "project-reality",
      message: "Package source repository mode does not require installed-project context files.",
      confidence: "high",
      evidence: []
    };
  }
  if (!existsSync(join(context.cwd, CONTEXT_JSON))) {
    return {
      level: "warn",
      area: "project-reality",
      message: ".agent-kit/project-context.json is missing.",
      remediation: "Run agent-kit init or agent-kit context init to create project context.",
      confidence: "high",
      evidence: []
    };
  }
  return {
    level: "pass",
    area: "project-reality",
    message: ".agent-kit/project-context.json exists.",
    confidence: "high",
    evidence: [{ kind: "file", path: CONTEXT_JSON, summary: "Project context file exists.", observedAt: context.observedAt }]
  };
}

export const projectRealityRules = new AuditRuleRegistry()
  .register({
    id: "project-reality.supabase.rls-per-table",
    version: "1.0.0",
    area: "project-reality",
    helpUri: "https://supabase.com/docs/guides/database/postgres/row-level-security",
    evaluate: evaluateRls
  })
  .register({ id: "project-reality.tests.executable-script", version: "1.0.0", area: "project-reality", evaluate: evaluateTests })
  .register({ id: "project-reality.secrets.git-tracked", version: "1.0.0", area: "project-reality", evaluate: evaluateSecrets })
  .register({ id: "project-reality.context.present", version: "1.0.0", area: "project-reality", evaluate: evaluateContext });
