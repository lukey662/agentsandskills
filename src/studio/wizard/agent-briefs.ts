import { ensureStudioDirs, nowIso, readJsonFile, writeJsonFile, writeTextFile } from "../shared.js";
import { loadProjectRosterAgents } from "./roster.js";

export const AGENT_BRIEFS_JSON = ".agent-kit/onboarding/agent-briefs.json";
export const AGENT_BRIEFS_MD = ".agent-kit/agent-briefs.md";

export interface AgentBriefsFile {
  schemaVersion: 1;
  updatedAt: string;
  briefs: Record<string, string>;
}

function emptyBriefs(): AgentBriefsFile {
  return { schemaVersion: 1, updatedAt: nowIso(), briefs: {} };
}

export function loadAgentBriefs(cwd: string): AgentBriefsFile {
  ensureStudioDirs(cwd);
  const existing = readJsonFile<AgentBriefsFile>(cwd, AGENT_BRIEFS_JSON);
  if (!existing || existing.schemaVersion !== 1 || typeof existing.briefs !== "object") {
    return emptyBriefs();
  }
  return existing;
}

export function saveAgentBriefs(cwd: string, briefs: Record<string, string>): AgentBriefsFile {
  const cleaned = Object.fromEntries(
    Object.entries(briefs)
      .map(([id, text]) => [id, String(text).trim()] as const)
      .filter(([, text]) => text.length > 0)
  );
  const next: AgentBriefsFile = { schemaVersion: 1, updatedAt: nowIso(), briefs: cleaned };
  writeJsonFile(cwd, AGENT_BRIEFS_JSON, next);
  writeTextFile(cwd, AGENT_BRIEFS_MD, renderAgentBriefsMarkdown(cwd, next));
  return next;
}

export function renderAgentBriefsMarkdown(cwd: string, file: AgentBriefsFile): string {
  const agents = loadProjectRosterAgents(cwd);
  const lines = [
    "# Agent Team Briefings",
    "",
    "Project-specific notes for each council agent. Specialists already know their domain — this file tells them what is unique about **this** project.",
    "",
    `Updated: ${file.updatedAt}`,
    ""
  ];
  let wroteAny = false;
  for (const agent of agents) {
    const text = file.briefs[agent.id]?.trim();
    if (!text) continue;
    wroteAny = true;
    lines.push(`## ${agent.name}`, "", `**Role:** ${agent.roleSummary}`, "", text, "");
  }
  if (!wroteAny) {
    lines.push("_No agent briefs recorded yet. Run `agent-kit setup` to brief your team._", "");
  }
  return lines.join("\n");
}
