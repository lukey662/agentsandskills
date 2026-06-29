import { CorrectionRulesContract, type CorrectionRuleContractValue, type CorrectionRulesContractValue, formatContractIssues } from "../config/contracts.js";
import {
  AGENT_RULES_JSON,
  PROJECT_RULES_JSON,
  UPSTREAM_PROPOSALS_JSON,
  ensureStudioDirs,
  nowIso,
  readJsonFile,
  redactSensitive,
  safeSlug,
  writeJsonFile
} from "./shared.js";

export interface AddCorrectionOptions {
  scope: CorrectionRuleContractValue["scope"];
  text: string;
  agentId?: string;
  sourceSessionId?: string;
  id?: string;
}

export interface CorrectionListResult {
  project: CorrectionRuleContractValue[];
  agent: CorrectionRuleContractValue[];
  upstream: CorrectionRuleContractValue[];
}

const VALID_CORRECTION_SCOPES = ["session", "project", "agent", "upstream-proposal"] as const;

function parseCorrectionScope(scope: unknown): CorrectionRuleContractValue["scope"] {
  if (typeof scope === "string" && (VALID_CORRECTION_SCOPES as readonly string[]).includes(scope)) {
    return scope as CorrectionRuleContractValue["scope"];
  }
  throw new Error(`Invalid correction scope: expected one of ${VALID_CORRECTION_SCOPES.join(", ")}`);
}

function fileForScope(scope: CorrectionRuleContractValue["scope"]): string {
  if (scope === "agent") return AGENT_RULES_JSON;
  if (scope === "upstream-proposal") return UPSTREAM_PROPOSALS_JSON;
  return PROJECT_RULES_JSON;
}

export function emptyCorrectionRules(): CorrectionRulesContractValue {
  return { schemaVersion: 1, rules: [] };
}

export function readCorrectionRules(cwd: string, relativePath: string): CorrectionRulesContractValue {
  const parsed = readJsonFile<unknown>(cwd, relativePath) ?? emptyCorrectionRules();
  const result = CorrectionRulesContract.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid ${relativePath}: ${formatContractIssues(result.error).join("; ")}`);
  }
  return result.data;
}

export function ensureCorrectionFiles(cwd: string): void {
  ensureStudioDirs(cwd);
  for (const path of [PROJECT_RULES_JSON, AGENT_RULES_JSON, UPSTREAM_PROPOSALS_JSON]) {
    if (!readJsonFile<unknown>(cwd, path)) writeJsonFile(cwd, path, emptyCorrectionRules());
  }
}

export function addCorrection(cwd: string, options: AddCorrectionOptions): CorrectionRuleContractValue {
  const scope = parseCorrectionScope(options.scope);
  ensureCorrectionFiles(cwd);
  const targetPath = fileForScope(scope);
  const rules = readCorrectionRules(cwd, targetPath);
  const id = options.id ?? safeSlug(options.text).slice(0, 48);
  const rule: CorrectionRuleContractValue = {
    id,
    scope,
    status: scope === "upstream-proposal" ? "proposed" : "active",
    text: redactSensitive(options.text),
    ...(options.agentId ? { agentId: options.agentId, appliesToAgents: [options.agentId] } : {}),
    ...(options.sourceSessionId ? { sourceSessionId: options.sourceSessionId } : {}),
    createdAt: nowIso(),
    reviewedAt: null
  };
  const parsed = CorrectionRulesContract.parse({ ...rules, rules: [...rules.rules.filter((item) => item.id !== id), rule] });
  writeJsonFile(cwd, targetPath, parsed);
  return rule;
}

export function listCorrections(cwd: string): CorrectionListResult {
  ensureCorrectionFiles(cwd);
  return {
    project: readCorrectionRules(cwd, PROJECT_RULES_JSON).rules,
    agent: readCorrectionRules(cwd, AGENT_RULES_JSON).rules,
    upstream: readCorrectionRules(cwd, UPSTREAM_PROPOSALS_JSON).rules
  };
}

export function applyCorrection(cwd: string, id: string): CorrectionRuleContractValue {
  ensureCorrectionFiles(cwd);
  for (const path of [PROJECT_RULES_JSON, AGENT_RULES_JSON, UPSTREAM_PROPOSALS_JSON]) {
    const rules = readCorrectionRules(cwd, path);
    const index = rules.rules.findIndex((rule) => rule.id === id);
    if (index === -1) continue;
    const current = rules.rules[index];
    if (!current) continue;
    const { retiredAt: _retiredAt, reason: _reason, ...base } = current;
    const updated: CorrectionRuleContractValue = {
      ...base,
      status: "active",
      reviewedAt: nowIso()
    };
    rules.rules[index] = updated;
    writeJsonFile(cwd, path, CorrectionRulesContract.parse(rules));
    return updated;
  }
  throw new Error(`Correction not found: ${id}`);
}

export function retireCorrection(cwd: string, id: string, reason: string): CorrectionRuleContractValue {
  ensureCorrectionFiles(cwd);
  for (const path of [PROJECT_RULES_JSON, AGENT_RULES_JSON, UPSTREAM_PROPOSALS_JSON]) {
    const rules = readCorrectionRules(cwd, path);
    const index = rules.rules.findIndex((rule) => rule.id === id);
    if (index === -1) continue;
    const current = rules.rules[index];
    if (!current) continue;
    const updated: CorrectionRuleContractValue = {
      ...current,
      status: "retired",
      retiredAt: nowIso(),
      reason
    };
    rules.rules[index] = updated;
    writeJsonFile(cwd, path, CorrectionRulesContract.parse(rules));
    return updated;
  }
  throw new Error(`Correction not found: ${id}`);
}

export function proposeCorrectionUpstream(cwd: string, id: string): CorrectionRuleContractValue {
  const all = listCorrections(cwd);
  const found = [...all.project, ...all.agent].find((rule) => rule.id === id);
  if (!found) throw new Error(`Correction not found: ${id}`);
  return addCorrection(cwd, {
    scope: "upstream-proposal",
    text: found.text,
    ...(found.agentId ? { agentId: found.agentId } : {}),
    ...(found.sourceSessionId ? { sourceSessionId: found.sourceSessionId } : {}),
    id: `${found.id}-upstream`
  });
}
