import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  SessionEventContract,
  StudioSessionContract,
  type SessionEventContractValue,
  type StudioSessionContractValue,
  formatContractIssues
} from "../config/contracts.js";
import { DEFAULT_AGENT_ROSTER_TARGET } from "../config/defaults.js";
import { addCorrection } from "./corrections.js";
import {
  ACTIVE_SESSION_FILE,
  COUNCIL_SESSIONS_DIR,
  appendJsonLine,
  ensureStudioDirs,
  escapeMarkdownTableCell,
  escapeMarkdownText,
  listMarkdown,
  nowIso,
  readJsonFile,
  readJsonLines,
  readTextFile,
  redactSensitive,
  safeSlug,
  validateRelativeArtifactPath,
  writeJsonFile,
  writeTextFile
} from "./shared.js";

export interface StartSessionOptions {
  title: string;
  workflowId?: string;
  request?: string;
  affectedLayers?: string[];
  qualityTarget?: StudioSessionContractValue["qualityTarget"];
}

export interface HandoffOptions {
  fromAgentId: string;
  toAgentId: string;
  decision: string;
  risk: string;
  evidence?: string[];
}

export interface SessionCommandResult {
  sessionId: string;
  sessionPath: string;
}

function sessionDir(sessionId: string): string {
  return `${COUNCIL_SESSIONS_DIR}/${safeSlug(sessionId)}`;
}

function sessionJsonPath(sessionId: string): string {
  return `${sessionDir(sessionId)}/session.json`;
}

function eventsPath(sessionId: string): string {
  return `${sessionDir(sessionId)}/events.jsonl`;
}

function indexPath(sessionId: string): string {
  return `${sessionDir(sessionId)}/index.md`;
}

function transcriptPath(sessionId: string): string {
  return `${sessionDir(sessionId)}/transcript.md`;
}

function readDefaultWorkflowOutputs(cwd: string, workflowId: string): StudioSessionContractValue["requiredOutputs"] {
  const roster = readJsonFile<{ workflows?: Array<{ id?: string; requiredOutputs?: string[] }> }>(cwd, DEFAULT_AGENT_ROSTER_TARGET);
  const workflow = roster?.workflows?.find((item) => item.id === workflowId);
  return (workflow?.requiredOutputs ?? ["decision", "risk", "verification evidence"]).map((name) => ({
    name,
    status: "missing" as const
  }));
}

export function startSession(cwd: string, options: StartSessionOptions): SessionCommandResult {
  ensureStudioDirs(cwd);
  const datePrefix = new Date().toISOString().slice(0, 10);
  const sessionId = safeSlug(`${datePrefix}-${options.title}`);
  const now = nowIso();
  const workflowId = options.workflowId ?? "planning";
  const session: StudioSessionContractValue = {
    schemaVersion: 1,
    sessionId,
    title: options.title,
    createdAt: now,
    updatedAt: now,
    status: "in-progress",
    workflowId,
    request: options.request ?? options.title,
    affectedLayers: options.affectedLayers ?? [],
    activeAgentId: "planner",
    nextAgentId: undefined,
    qualityTarget: options.qualityTarget ?? "baseline-setup",
    requiredOutputs: readDefaultWorkflowOutputs(cwd, workflowId)
  };

  writeJsonFile(cwd, sessionJsonPath(sessionId), StudioSessionContract.parse(session));
  writeTextFile(cwd, ACTIVE_SESSION_FILE, `${sessionId}\n`);
  appendSessionEvent(cwd, sessionId, {
    type: "session_started",
    createdAt: now,
    agentId: "planner",
    text: `Started ${workflowId} session: ${options.title}`
  });
  return { sessionId, sessionPath: sessionDir(sessionId) };
}

export function listSessions(cwd: string): StudioSessionContractValue[] {
  const root = join(cwd, COUNCIL_SESSIONS_DIR);
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((entry) => entry !== "active")
    .map((entry) => join(root, entry, "session.json"))
    .filter((path) => existsSync(path) && statSync(path).isFile())
    .map((path) => StudioSessionContract.parse(JSON.parse(readFileSync(path, "utf8")) as unknown))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getActiveSessionId(cwd: string): string {
  const active = readTextFile(cwd, ACTIVE_SESSION_FILE)?.trim();
  if (!active) throw new Error("No active Agent Studio session. Run agent-kit session start first.");
  return safeSlug(active);
}

export function readSession(cwd: string, sessionId = getActiveSessionId(cwd)): StudioSessionContractValue {
  const parsed = readJsonFile<unknown>(cwd, sessionJsonPath(sessionId));
  const result = StudioSessionContract.safeParse(parsed);
  if (!result.success) throw new Error(`Invalid ${sessionJsonPath(sessionId)}: ${formatContractIssues(result.error).join("; ")}`);
  return result.data;
}

export function readSessionEvents(cwd: string, sessionId = getActiveSessionId(cwd)): SessionEventContractValue[] {
  return readJsonLines(cwd, eventsPath(sessionId)).map((event, index) => {
    const result = SessionEventContract.safeParse(event);
    if (!result.success) {
      throw new Error(`Invalid ${eventsPath(sessionId)} line ${index + 1}: ${formatContractIssues(result.error).join("; ")}`);
    }
    return result.data;
  });
}

function writeSession(cwd: string, session: StudioSessionContractValue): void {
  writeJsonFile(cwd, sessionJsonPath(session.sessionId), StudioSessionContract.parse(session));
}

export function appendSessionEvent(cwd: string, sessionId: string, event: SessionEventContractValue): SessionEventContractValue {
  const parsed = SessionEventContract.parse(redactEvent(event));
  appendJsonLine(cwd, eventsPath(sessionId), parsed);
  const session = readSession(cwd, sessionId);
  const updated: StudioSessionContractValue = {
    ...session,
    updatedAt: parsed.createdAt
  };
  if (parsed.agentId) updated.activeAgentId = parsed.agentId;
  if (parsed.type === "handoff" && parsed.toAgentId) {
    updated.activeAgentId = parsed.toAgentId;
    updated.nextAgentId = parsed.toAgentId;
  }
  if (parsed.type === "session_status_changed" && parsed.status) updated.status = parsed.status;
  writeSession(cwd, updated);
  return parsed;
}

function redactEvent(event: SessionEventContractValue): SessionEventContractValue {
  return {
    ...event,
    ...(event.text ? { text: redactSensitive(event.text) } : {}),
    ...(event.decision ? { decision: redactSensitive(event.decision) } : {}),
    ...(event.risk ? { risk: redactSensitive(event.risk) } : {}),
    ...(event.notes ? { notes: redactSensitive(event.notes) } : {}),
    ...(event.command ? { command: redactSensitive(event.command) } : {}),
    ...(event.outputName ? { outputName: redactSensitive(event.outputName) } : {}),
    ...(event.evidence ? { evidence: event.evidence.map(redactSensitive) } : {})
  };
}

export function recordNote(cwd: string, agentId: string, text: string): SessionEventContractValue {
  return appendSessionEvent(cwd, getActiveSessionId(cwd), { type: "agent_message", createdAt: nowIso(), agentId, text });
}

export function recordDecision(cwd: string, agentId: string, decision: string, risk?: string): SessionEventContractValue {
  return appendSessionEvent(cwd, getActiveSessionId(cwd), {
    type: "agent_decision",
    createdAt: nowIso(),
    agentId,
    decision,
    ...(risk ? { risk } : {})
  });
}

export function recordHandoff(cwd: string, options: HandoffOptions): SessionEventContractValue {
  return appendSessionEvent(cwd, getActiveSessionId(cwd), {
    type: "handoff",
    createdAt: nowIso(),
    fromAgentId: options.fromAgentId,
    toAgentId: options.toAgentId,
    decision: options.decision,
    risk: options.risk,
    evidence: options.evidence ?? []
  });
}

export function recordCorrection(
  cwd: string,
  options: { agentId?: string; scope: "session" | "project" | "agent" | "upstream-proposal"; text: string }
): SessionEventContractValue {
  const sessionId = getActiveSessionId(cwd);
  const correction =
    options.scope === "session"
      ? undefined
      : addCorrection(cwd, {
          scope: options.scope,
          text: options.text,
          ...(options.agentId ? { agentId: options.agentId } : {}),
          sourceSessionId: sessionId
        });
  return appendSessionEvent(cwd, sessionId, {
    type: "human_correction",
    createdAt: nowIso(),
    ...(options.agentId ? { agentId: options.agentId } : {}),
    scope: options.scope,
    text: options.text,
    ...(correction ? { correctionId: correction.id } : {})
  });
}

export function recordArtifact(cwd: string, file: string, note?: string): SessionEventContractValue {
  const artifactPath = validateRelativeArtifactPath(cwd, file);
  return appendSessionEvent(cwd, getActiveSessionId(cwd), {
    type: "artifact_recorded",
    createdAt: nowIso(),
    artifactPath,
    ...(note ? { notes: note } : {})
  });
}

export function recordVerification(cwd: string, command: string, result: "pass" | "fail" | "skipped", notes?: string): SessionEventContractValue {
  return appendSessionEvent(cwd, getActiveSessionId(cwd), {
    type: "verification_recorded",
    createdAt: nowIso(),
    command,
    result,
    ...(notes ? { notes } : {})
  });
}

export function recordRequiredOutput(
  cwd: string,
  name: string,
  status: "missing" | "partial" | "complete" | "not-applicable",
  evidence?: string
): SessionEventContractValue {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Required output name is required.");
  const sessionId = getActiveSessionId(cwd);
  const session = readSession(cwd, sessionId);
  const now = nowIso();
  const output = {
    name: trimmedName,
    status,
    ...(evidence ? { evidence: redactSensitive(evidence) } : {})
  };
  const outputIndex = session.requiredOutputs.findIndex((item) => item.name === trimmedName);
  const requiredOutputs =
    outputIndex === -1
      ? [...session.requiredOutputs, output]
      : session.requiredOutputs.map((item, index) => (index === outputIndex ? { ...item, ...output } : item));
  writeSession(cwd, { ...session, requiredOutputs, updatedAt: now });
  return appendSessionEvent(cwd, sessionId, {
    type: "required_output_updated",
    createdAt: now,
    outputName: trimmedName,
    outputStatus: status,
    ...(evidence ? { evidence: [evidence] } : {})
  });
}

export function closeSession(cwd: string, status: "planned" | "in-progress" | "blocked" | "complete"): StudioSessionContractValue {
  const sessionId = getActiveSessionId(cwd);
  appendSessionEvent(cwd, sessionId, {
    type: "session_status_changed",
    createdAt: nowIso(),
    status,
    text: `Session marked ${status}.`
  });
  return readSession(cwd, sessionId);
}

export function renderActiveSession(cwd: string): SessionCommandResult {
  return renderSession(cwd, getActiveSessionId(cwd));
}

export function renderSession(cwd: string, sessionId: string): SessionCommandResult {
  const session = readSession(cwd, sessionId);
  const events = readSessionEvents(cwd, sessionId);
  const renderedAt = nowIso();
  const updated = { ...session, renderedAt, updatedAt: renderedAt };
  writeTextFile(cwd, indexPath(sessionId), renderSessionIndex(updated, events));
  writeTextFile(cwd, transcriptPath(sessionId), renderSessionTranscript(updated, events));
  writeSession(cwd, updated);
  return { sessionId, sessionPath: sessionDir(sessionId) };
}

function renderSessionIndex(session: StudioSessionContractValue, events: SessionEventContractValue[]): string {
  const handoffs = events.filter((event) => event.type === "handoff");
  const decisions = events.filter((event) => event.type === "agent_decision" || event.type === "handoff");
  const corrections = events.filter((event) => event.type === "human_correction");
  const artifacts = events.filter((event) => event.type === "artifact_recorded");
  const verification = events.filter((event) => event.type === "verification_recorded");

  return `# Council Session: ${escapeMarkdownText(session.title)}

Generated from \`${sessionDir(session.sessionId)}/events.jsonl\` at ${session.renderedAt ?? session.updatedAt}.

## Current State

- Session: ${session.sessionId}
- Workflow: ${session.workflowId}
- Status: ${session.status}
- Active agent: ${session.activeAgentId ?? "none"}
- Next agent: ${session.nextAgentId ?? "none"}
- Quality target: ${session.qualityTarget}
- Request: ${escapeMarkdownText(session.request)}

## Handoff Graph

\`\`\`mermaid
${renderMermaidGraph(handoffs)}
\`\`\`

## Decisions

| Agent | Decision | Risk | Evidence |
| --- | --- | --- | --- |
${decisions.map(renderDecisionRow).join("\n") || "| None | None recorded | None recorded | None |"}

## Human Corrections

| Scope | Agent | Correction | Durable Rule |
| --- | --- | --- | --- |
${corrections.map((event) => `| ${event.scope ?? "session"} | ${escapeMarkdownTableCell(event.agentId ?? "all")} | ${escapeMarkdownTableCell(event.text)} | ${event.correctionId ?? "session-only"} |`).join("\n") || "| None | None | None recorded | None |"}

## Required Outputs

| Output | Status | Evidence |
| --- | --- | --- |
${session.requiredOutputs.map((output) => `| ${escapeMarkdownTableCell(output.name)} | ${output.status} | ${escapeMarkdownTableCell(output.evidence)} |`).join("\n")}

## Artifacts

${listMarkdown(artifacts.map((event) => `${event.artifactPath}${event.notes ? ` - ${event.notes}` : ""}`))}

## Verification

| Command | Result | Notes |
| --- | --- | --- |
${verification.map((event) => `| ${escapeMarkdownTableCell(event.command)} | ${event.result ?? "skipped"} | ${escapeMarkdownTableCell(event.notes)} |`).join("\n") || "| None recorded | skipped | Add verification before completion |"}

## Next Actions

${renderNextActions(session, verification)}
`;
}

function renderDecisionRow(event: SessionEventContractValue): string {
  if (event.type === "handoff") {
    return `| ${escapeMarkdownTableCell(`${event.fromAgentId ?? "unknown"} -> ${event.toAgentId ?? "unknown"}`)} | ${escapeMarkdownTableCell(event.decision)} | ${escapeMarkdownTableCell(event.risk)} | ${escapeMarkdownTableCell(event.evidence?.join(", "))} |`;
  }
  return `| ${escapeMarkdownTableCell(event.agentId ?? "unknown")} | ${escapeMarkdownTableCell(event.decision)} | ${escapeMarkdownTableCell(event.risk)} | ${escapeMarkdownTableCell(event.evidence?.join(", "))} |`;
}

function renderMermaidGraph(handoffs: SessionEventContractValue[]): string {
  if (handoffs.length === 0) return "flowchart LR\n  session[\"Session\"]";
  const lines = ["flowchart LR"];
  for (const handoff of handoffs) {
    const from = safeNodeId(handoff.fromAgentId ?? "unknown");
    const to = safeNodeId(handoff.toAgentId ?? "unknown");
    lines.push(`  ${from}["${safeMermaidLabel(handoff.fromAgentId ?? "unknown")}"] --> ${to}["${safeMermaidLabel(handoff.toAgentId ?? "unknown")}"]`);
  }
  return lines.join("\n");
}

function safeNodeId(value: string): string {
  const id = value.replace(/[^a-zA-Z0-9_]/g, "_");
  return id || "unknown";
}

function safeMermaidLabel(value: string): string {
  const label = redactSensitive(value)
    .replace(/[^a-zA-Z0-9 _./:-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return label || "unknown";
}

function renderNextActions(session: StudioSessionContractValue, verification: SessionEventContractValue[]): string {
  const missingOutputs = session.requiredOutputs.filter((output) => output.status === "missing" || output.status === "partial");
  const actions = [
    ...missingOutputs.map((output) => `Complete required output: ${output.name}.`),
    ...(verification.length === 0 ? ["Record verification evidence before closing the session."] : []),
    ...(session.nextAgentId ? [`Continue with ${session.nextAgentId}.`] : [])
  ];
  return listMarkdown(actions);
}

function renderSessionTranscript(session: StudioSessionContractValue, events: SessionEventContractValue[]): string {
  const byAgent = new Map<string, SessionEventContractValue[]>();
  for (const event of events) {
    const key = event.agentId ?? event.fromAgentId ?? "session";
    byAgent.set(key, [...(byAgent.get(key) ?? []), event]);
  }
  const sections = [...byAgent.entries()]
    .map(([agentId, agentEvents]) => {
      const rows = agentEvents.map((event) => {
        const detail =
          event.text ??
          event.decision ??
          event.command ??
          event.artifactPath ??
          (event.outputName ? `${event.outputName}: ${event.outputStatus ?? ""}` : undefined) ??
          event.status ??
          "";
        return `- ${event.createdAt} \`${event.type}\`: ${escapeMarkdownText(detail)}`;
      });
      return `## ${escapeMarkdownText(agentId)}\n\n${rows.join("\n")}`;
    })
    .join("\n\n");

  return `# Transcript: ${escapeMarkdownText(session.title)}

Generated from \`${sessionDir(session.sessionId)}/events.jsonl\`.

${sections || "No events recorded."}
`;
}
