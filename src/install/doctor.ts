import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadCatalog, parseFrontmatter } from "../catalog.js";

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

  const qaSkill =
    read(cwd, ".cursor/skills/browser-qa/SKILL.md") ??
    read(cwd, "skills/browser-qa/SKILL.md");
  if (!qaSkill) {
    findings.push({ level: "fail", area: "skills", message: "browser-qa skill is missing." });
  } else if (!qaSkill.includes("Do not review code alone")) {
    findings.push({ level: "fail", area: "skills", message: "browser-qa no longer forbids code-only review." });
  } else {
    findings.push({ level: "pass", area: "skills", message: "browser-qa forbids code-only UI review." });
  }

  for (const id of catalog.defaultAgents) {
    const content = read(cwd, `.cursor/agents/${id}.md`) ?? read(cwd, `agents/${id}/agent.md`);
    if (!content) {
      findings.push({ level: "warn", area: "agents", message: `${id} agent is not installed in .cursor/agents/.` });
      continue;
    }
    const meta = parseFrontmatter(content);
    if (!meta.tools || meta.tools.length === 0) {
      findings.push({ level: "fail", area: "agents", message: `${id} is missing a tools list.` });
    } else {
      findings.push({ level: "pass", area: "agents", message: `${id} declares tools.` });
    }
  }

  return {
    findings,
    summary: summarize(findings),
    ok: findings.every((item) => item.level !== "fail")
  };
}
