import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { agentSourcePath, loadCatalog, parseFrontmatter } from "../catalog.js";
import { findPackageRoot } from "../utils/package-root.js";
import { renderedRequiredTools, validateHostAgentFile } from "./host-frontmatter.js";
import { isCouncilAgentFile, isCouncilContent, LEGACY_COUNCIL_SKILL_IDS } from "./prune-legacy.js";
import { agentTargetPath, type AgentHost } from "./roster-adapters.js";

const RENDERED_HOSTS: AgentHost[] = ["cursor", "claude", "copilot", "antigravity"];

export type DoctorLevel = "pass" | "warn" | "fail";

export interface DoctorFinding {
  level: DoctorLevel;
  area: string;
  message: string;
}

export interface DoctorReport {
  summary: Record<DoctorLevel, number>;
  findings: DoctorFinding[];
  ok: boolean;
}

/** Unique 0.3 council-OS files. Product SECURITY.md / DESIGN.md are not listed. */
export const LEGACY_LEFTOVER_PATHS = [
  "AGENT_ROSTER.md",
  "COUNCIL.md",
  "SKILLS.md",
  "QUALITY_GATES.md",
  "ASSISTANT_ADAPTERS.md",
  ".agent-kit/agent-roster.json",
  ".agent-kit/orchestrator.json"
] as const;

function summarize(findings: DoctorFinding[]): Record<DoctorLevel, number> {
  return {
    pass: findings.filter((item) => item.level === "pass").length,
    warn: findings.filter((item) => item.level === "warn").length,
    fail: findings.filter((item) => item.level === "fail").length
  };
}

function read(cwd: string, relative: string): string | null {
  const path = join(cwd, relative);
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

export function listLegacyLeftovers(cwd: string): string[] {
  return LEGACY_LEFTOVER_PATHS.filter((relative) => existsSync(join(cwd, relative)));
}

export function createDoctorReport(cwd: string): DoctorReport {
  const catalog = loadCatalog();
  const findings: DoctorFinding[] = [];

  const agentsDoc = read(cwd, "AGENTS.md");
  findings.push(
    agentsDoc
      ? { level: "pass", area: "docs", message: "AGENTS.md is installed." }
      : { level: "fail", area: "docs", message: "AGENTS.md is missing. Run agent-kit init." }
  );

  const guide = read(cwd, "USER_GUIDE.md");
  if (!guide) {
    findings.push({ level: "fail", area: "docs", message: "USER_GUIDE.md is missing. Run agent-kit init." });
  } else if (!guide.includes(catalog.screenshotFailClosed) && !guide.includes("Do not review code alone")) {
    findings.push({
      level: "fail",
      area: "docs",
      message: "USER_GUIDE.md dropped the screenshot fail-closed rule."
    });
  } else {
    findings.push({ level: "pass", area: "docs", message: "USER_GUIDE.md includes the screenshot fail-closed rule." });
  }

  const htmlGuide = read(cwd, "USER_GUIDE.html");
  if (!htmlGuide) {
    findings.push({ level: "fail", area: "docs", message: "USER_GUIDE.html is missing. Run agent-kit init." });
  } else if (!htmlGuide.includes("Do not review code alone") || !htmlGuide.includes('data-view="user-guide"')) {
    findings.push({
      level: "fail",
      area: "docs",
      message: "USER_GUIDE.html dropped the screenshot fail-closed rule or assignment-desk layout."
    });
  } else {
    findings.push({ level: "pass", area: "docs", message: "USER_GUIDE.html is the visual field guide." });
  }

  const qaSkill = read(cwd, ".agents/skills/browser-qa/SKILL.md") ?? read(cwd, ".claude/skills/browser-qa/SKILL.md") ?? read(cwd, "skills/browser-qa/SKILL.md");
  if (!qaSkill) {
    findings.push({ level: "fail", area: "skills", message: "browser-qa skill is missing. Run agent-kit init." });
  } else if (!qaSkill.includes("Do not review code alone")) {
    findings.push({ level: "fail", area: "skills", message: "browser-qa no longer forbids code-only review." });
  } else {
    findings.push({ level: "pass", area: "skills", message: "browser-qa forbids code-only UI review." });
  }

  for (const id of catalog.defaultAgents) {
    const expectedRequired = packagedRequiredTools(id);
    const rendered = RENDERED_HOSTS.map((host) => ({ host, path: agentTargetPath(host, id), content: read(cwd, agentTargetPath(host, id)) })).filter(
      (item): item is { host: AgentHost; path: string; content: string } => item.content !== null
    );

    if (rendered.length === 0) {
      // The kit's own source tree has canonical files and may have no rendered layer yet.
      const canonical = read(cwd, `agents/${id}/agent.md`);
      if (!canonical) {
        findings.push({ level: "warn", area: "agents", message: `${id} agent is not installed. Run agent-kit init --activate <ide>.` });
        continue;
      }
      const meta = parseFrontmatter(canonical);
      const missing = expectedRequired.filter((tool) => !(meta.requiredTools ?? []).includes(tool));
      findings.push(
        missing.length > 0
          ? { level: "fail", area: "agents", message: `${id} dropped requiredTools: ${missing.join(", ")}.` }
          : { level: "pass", area: "agents", message: `${id} keeps required tools.` }
      );
      continue;
    }

    let failed = false;
    for (const item of rendered) {
      // A 0.3 council stub at a 0.4 path is what the IDE loads. It has no screenshot gate, so it
      // silently replaces the real agent. update never overwrote it.
      if (isCouncilAgentFile(item.content)) {
        findings.push({
          level: "fail",
          area: "agents",
          message: `${item.path} is a 0.3 council stub shadowing the 0.4 agent. Run agent-kit update --prune-legacy.`
        });
        failed = true;
        continue;
      }
      const problems = validateHostAgentFile(item.host, item.content);
      if (problems.length > 0) {
        findings.push({
          level: "fail",
          area: "agents",
          message: `${item.path} will not load in ${item.host}: ${problems.join("; ")}. Run agent-kit update --force.`
        });
        failed = true;
        continue;
      }
      const actual = renderedRequiredTools(item.content);
      const missing = expectedRequired.filter((tool) => !actual.includes(tool));
      if (missing.length > 0) {
        findings.push({ level: "fail", area: "agents", message: `${item.path} dropped requiredTools: ${missing.join(", ")}.` });
        failed = true;
      }
    }
    if (!failed) {
      findings.push({
        level: "pass",
        area: "agents",
        message:
          expectedRequired.length > 0
            ? `${id} keeps required tools on ${rendered.map((item) => item.host).join(", ")}.`
            : `${id} is installed on ${rendered.map((item) => item.host).join(", ")}.`
      });
    }
  }

  // The always-on Cursor rule is read in every chat. A 0.3 body routes UI work to
  // frontend-design-lead, which has no screenshot requiredTools, so this bypasses the gate.
  const cursorRule = read(cwd, ".cursor/rules/cursor-agent-kit.mdc");
  if (cursorRule && isCouncilContent(cursorRule)) {
    findings.push({
      level: "fail",
      area: "legacy",
      message: ".cursor/rules/cursor-agent-kit.mdc is the 0.3 council rule and routes around the 0.4 agents. Run agent-kit update --prune-legacy."
    });
  }

  const copilot = read(cwd, ".github/copilot-instructions.md");
  if (copilot && isCouncilContent(copilot)) {
    findings.push({
      level: "fail",
      area: "legacy",
      message: ".github/copilot-instructions.md is the 0.3 council version. Run agent-kit update --prune-legacy."
    });
  }

  const councilSkills = LEGACY_COUNCIL_SKILL_IDS.filter((id) => existsSync(join(cwd, ".cursor/skills", id)));
  if (councilSkills.length > 0) {
    findings.push({
      level: "warn",
      area: "legacy",
      message: `${councilSkills.length} 0.3 council skills still trigger on every UI task (${councilSkills.slice(0, 3).join(", ")}${councilSkills.length > 3 ? ", …" : ""}). Run agent-kit update --prune-legacy.`
    });
  }

  // 0.4 wrote skills to .cursor/skills/ and .antigravity/. 0.5 writes .agents/skills/. Both present
  // means Cursor surfaces every skill twice.
  const duplicateSkills = catalog.defaultSkills.filter((id) => existsSync(join(cwd, ".cursor/skills", id)) && existsSync(join(cwd, ".agents/skills", id)));
  if (duplicateSkills.length > 0 || existsSync(join(cwd, ".antigravity"))) {
    findings.push({
      level: "warn",
      area: "legacy",
      message: `0.4 skill copies remain (${duplicateSkills.length > 0 ? `.cursor/skills/${duplicateSkills[0]} …` : ".antigravity/"}). Cursor will list each skill twice. Run agent-kit update --prune-legacy.`
    });
  }

  const leftovers = listLegacyLeftovers(cwd);
  if (leftovers.length > 0) {
    const preview = leftovers.slice(0, 6).join(", ");
    const extra = leftovers.length > 6 ? `, +${leftovers.length - 6} more` : "";
    findings.push({
      level: "warn",
      area: "legacy",
      message: `0.3 leftover files are still here: ${preview}${extra}. 0.4 uses AGENTS.md + USER_GUIDE. update never deletes these unless you pass --prune-legacy.`
    });
  } else if (
    councilSkills.length === 0 &&
    duplicateSkills.length === 0 &&
    !existsSync(join(cwd, ".antigravity")) &&
    !(cursorRule && isCouncilContent(cursorRule)) &&
    !(copilot && isCouncilContent(copilot))
  ) {
    findings.push({
      level: "pass",
      area: "legacy",
      message: "No 0.3 council leftover files detected."
    });
  }

  return {
    findings,
    summary: summarize(findings),
    ok: findings.every((item) => item.level !== "fail")
  };
}

function packagedRequiredTools(id: string): string[] {
  try {
    const source = readFileSync(agentSourcePath(findPackageRoot(), id), "utf8");
    return parseFrontmatter(source).requiredTools ?? [];
  } catch {
    return [];
  }
}
