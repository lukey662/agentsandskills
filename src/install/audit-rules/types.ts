import type { AuditFinding } from "../../config/types.js";

export interface AuditRuleContext {
  cwd: string;
  packageRepository: boolean;
  observedAt: string;
}

export interface AuditRule {
  id: string;
  version: string;
  area: string;
  helpUri?: string;
  evaluate(context: AuditRuleContext): AuditFinding | AuditFinding[] | null;
}

export class AuditRuleRegistry {
  private readonly rules = new Map<string, AuditRule>();

  register(rule: AuditRule): this {
    if (this.rules.has(rule.id)) throw new Error(`Duplicate audit rule id: ${rule.id}`);
    this.rules.set(rule.id, rule);
    return this;
  }

  evaluate(context: AuditRuleContext): AuditFinding[] {
    return [...this.rules.values()].flatMap((rule) => {
      const result = rule.evaluate(context);
      if (!result) return [];
      const findings = Array.isArray(result) ? result : [result];
      return findings.map((finding) => ({
        ...finding,
        area: finding.area || rule.area,
        ruleId: rule.id,
        ruleVersion: rule.version,
        ...(rule.helpUri ? { helpUri: rule.helpUri } : {})
      }));
    });
  }
}
