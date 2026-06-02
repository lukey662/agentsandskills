import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT_DOCS } from "../config/defaults.js";
import type { AuditFinding } from "../config/types.js";
import { readManifest } from "./install.js";

function includesAny(text: string, values: string[]): boolean {
  const lower = text.toLowerCase();
  return values.some((value) => lower.includes(value.toLowerCase()));
}

function readDoc(cwd: string, file: string): string {
  const path = join(cwd, file);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

export function auditProject(cwd: string): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const manifest = readManifest(cwd);

  if (!manifest) {
    findings.push({
      level: "fail",
      area: "install",
      message: "Project has no .agent-kit/manifest.json.",
      remediation: "Run agent-kit init --stack next-supabase."
    });
  } else {
    findings.push({
      level: "pass",
      area: "install",
      message: `Agent kit installed at version ${manifest.packageVersion}.`
    });
  }

  for (const doc of ROOT_DOCS) {
    findings.push(
      existsSync(join(cwd, doc))
        ? { level: "pass", area: "docs", message: `${doc} exists.` }
        : {
            level: "fail",
            area: "docs",
            message: `${doc} is missing.`,
            remediation: `Run agent-kit init or restore ${doc} from the next-supabase template.`
          }
    );
  }

  const security = readDoc(cwd, "SECURITY.md");
  if (!includesAny(security, ["OWASP", "Top 10"])) {
    findings.push({
      level: "fail",
      area: "security",
      message: "SECURITY.md does not explicitly reference OWASP Top 10 review.",
      remediation: "Add OWASP Top 10 coverage to the security checklist."
    });
  }
  if (!includesAny(security, ["RLS", "row level security"])) {
    findings.push({
      level: "fail",
      area: "security",
      message: "SECURITY.md does not explicitly cover Supabase RLS.",
      remediation: "Require authorization to be enforced in Postgres RLS, not only in the UI."
    });
  }
  if (!includesAny(security, ["service-role", "service role"])) {
    findings.push({
      level: "warn",
      area: "security",
      message: "SECURITY.md does not mention service-role key isolation.",
      remediation: "Document that service-role keys are server-only and never exposed to client bundles."
    });
  }

  const styleGuide = readDoc(cwd, "STYLE_GUIDE.md");
  if (!includesAny(styleGuide, ["generic AI", "gradient", "design token"])) {
    findings.push({
      level: "warn",
      area: "frontend",
      message: "STYLE_GUIDE.md does not contain anti-generic-AI-site design guidance.",
      remediation: "Add rules for task-first screens, design tokens, real states, and non-generic visual direction."
    });
  }

  const testing = readDoc(cwd, "TESTING.md");
  if (!includesAny(testing, ["Playwright", "smoke"])) {
    findings.push({
      level: "warn",
      area: "testing",
      message: "TESTING.md does not require Playwright or smoke coverage.",
      remediation: "Define critical-path Playwright smoke tests for auth and primary workflows."
    });
  }

  return findings;
}
