import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PACKAGE_VERSION } from "../config/defaults.js";
import type { AuditFinding, AuditFindingV2, AuditReportV2 } from "../config/types.js";
import { auditProject, createAuditReadiness } from "./audit.js";

interface AuditSuppression {
  reason?: string;
  owner?: string;
  reviewedAt?: string;
  expiresAt?: string;
}

function fallbackRuleId(finding: AuditFinding): string {
  const area =
    finding.area
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "general";
  const digest = createHash("sha256").update(`${finding.area}\0${finding.message}`).digest("hex").slice(0, 12);
  return `legacy.${area}.${digest}`;
}

function loadSuppressions(cwd: string): Record<string, AuditSuppression> {
  const path = join(cwd, ".agent-kit", "overrides.json");
  if (!existsSync(path)) return {};
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { auditRules?: Record<string, AuditSuppression> };
    return parsed.auditRules ?? {};
  } catch {
    return {};
  }
}

function validSuppression(
  suppression: AuditSuppression | undefined,
  now: number
): suppression is Required<Pick<AuditSuppression, "reason" | "owner" | "reviewedAt">> & AuditSuppression {
  if (!suppression?.reason?.trim() || !suppression.owner?.trim() || !suppression.reviewedAt?.trim()) return false;
  if (suppression.expiresAt && Date.parse(suppression.expiresAt) <= now) return false;
  return true;
}

export function createAuditReportV2(cwd: string): AuditReportV2 {
  const generatedAt = new Date().toISOString();
  const suppressions = loadSuppressions(cwd);
  const findings: AuditFindingV2[] = auditProject(cwd).map((finding) => {
    const ruleId = finding.ruleId ?? fallbackRuleId(finding);
    const suppression = suppressions[ruleId];
    const suppressed = finding.level !== "pass" && validSuppression(suppression, Date.now());
    return {
      ...finding,
      ruleId,
      ruleVersion: finding.ruleVersion ?? "1.0.0",
      confidence: finding.confidence ?? "low",
      evidence: finding.evidence ?? [],
      ...(suppressed ? { suppressed: true, suppressionReason: suppression.reason } : {})
    };
  });
  const activeFindings = findings.filter((finding) => !finding.suppressed);
  const summary = { pass: 0, warn: 0, fail: 0, suppressed: findings.length - activeFindings.length };
  for (const finding of activeFindings) summary[finding.level] += 1;
  return {
    schemaVersion: 2,
    generatedAt,
    tool: { name: "agent-kit", version: PACKAGE_VERSION },
    root: ".",
    summary,
    readiness: createAuditReadiness(activeFindings, summary),
    findings
  };
}

interface SarifLocation {
  physicalLocation: {
    artifactLocation: { uri: string };
    region?: { startLine: number; startColumn?: number };
  };
}

export interface SarifLog {
  $schema: string;
  version: "2.1.0";
  runs: Array<{
    tool: { driver: { name: string; version: string; informationUri: string; rules: unknown[] } };
    results: unknown[];
  }>;
}

export function auditReportToSarif(report: AuditReportV2): SarifLog {
  const rules = [...new Map(report.findings.map((finding) => [finding.ruleId, finding])).values()].map((finding) => ({
    id: finding.ruleId,
    name: finding.ruleId,
    shortDescription: { text: finding.message },
    ...(finding.helpUri ? { helpUri: finding.helpUri } : {}),
    properties: { area: finding.area, ruleVersion: finding.ruleVersion, confidence: finding.confidence, fixable: Boolean(finding.fixable) }
  }));
  const results = report.findings
    .filter((finding) => finding.level !== "pass")
    .map((finding) => {
      const evidence = finding.evidence.find((item) => item.path);
      const locations: SarifLocation[] = evidence?.path
        ? [
            {
              physicalLocation: {
                artifactLocation: { uri: evidence.path.replace(/\\/g, "/") },
                ...(evidence.line ? { region: { startLine: evidence.line, ...(evidence.column ? { startColumn: evidence.column } : {}) } } : {})
              }
            }
          ]
        : [];
      return {
        ruleId: finding.ruleId,
        level: finding.level === "fail" ? "error" : "warning",
        message: { text: finding.message },
        ...(locations.length > 0 ? { locations } : {}),
        ...(finding.suppressed ? { suppressions: [{ kind: "external", justification: finding.suppressionReason }] } : {}),
        properties: { area: finding.area, confidence: finding.confidence, remediation: finding.remediation ?? "" }
      };
    });
  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "agent-kit",
            version: report.tool.version,
            informationUri: "https://github.com/lukey662/agentsandskills",
            rules
          }
        },
        results
      }
    ]
  };
}
