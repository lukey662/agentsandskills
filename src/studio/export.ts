import { ProjectContextContract, type SessionEventContractValue, type StudioSessionContractValue } from "../config/contracts.js";
import { listCorrections } from "./corrections.js";
import { listSessions, readSessionEvents } from "./session.js";
import {
  ACTIVE_SESSION_FILE,
  CONTEXT_JSON,
  CONTEXT_MD,
  COUNCIL_SESSIONS_DIR,
  STUDIO_EXPORT_HTML,
  containsLikelySecret,
  ensureStudioDirs,
  nowIso,
  readJsonFile,
  readTextFile,
  redactSensitive,
  safeSlug,
  unique,
  writeTextFile
} from "./shared.js";

export interface StaticStudioExportResult {
  studioPath: string;
  sessionCount: number;
  exportedAt: string;
}

interface StaticStudioSession {
  session: StudioSessionContractValue;
  events: SessionEventContractValue[];
  indexPath: string;
  transcriptPath: string;
  agents: string[];
}

interface StaticStudioData {
  generatedAt: string;
  context: unknown | null;
  contextMarkdown: string | null;
  corrections: ReturnType<typeof listCorrections>;
  activeSessionId: string | null;
  sessions: StaticStudioSession[];
}

export function exportStaticStudio(cwd: string): StaticStudioExportResult {
  ensureStudioDirs(cwd);
  const exportedAt = nowIso();
  const context = readProjectContext(cwd);
  const contextMarkdown = readTextFile(cwd, CONTEXT_MD);
  const corrections = listCorrections(cwd);
  const sessions = listSessions(cwd).map((session) => {
    const events = readSessionEvents(cwd, session.sessionId);
    return {
      session,
      events,
      indexPath: `${COUNCIL_SESSIONS_DIR}/${safeSlug(session.sessionId)}/index.md`,
      transcriptPath: `${COUNCIL_SESSIONS_DIR}/${safeSlug(session.sessionId)}/transcript.md`,
      agents: unique(events.flatMap((event) => [event.agentId, event.fromAgentId, event.toAgentId].filter(Boolean) as string[]))
    };
  });
  const data: StaticStudioData = {
    generatedAt: exportedAt,
    context,
    contextMarkdown,
    corrections,
    activeSessionId: readTextFile(cwd, ACTIVE_SESSION_FILE)?.trim() ?? null,
    sessions
  };
  const redactedData = redactDeep(data) as StaticStudioData;
  const html = renderStaticStudioHtml(redactedData);
  if (containsLikelySecret(html)) {
    throw new Error("Refusing to write static Agent Studio export because the rendered HTML contains a secret-like value.");
  }
  writeTextFile(cwd, STUDIO_EXPORT_HTML, html);
  return { studioPath: STUDIO_EXPORT_HTML, sessionCount: sessions.length, exportedAt };
}

function readProjectContext(cwd: string): unknown | null {
  const raw = readJsonFile<unknown>(cwd, CONTEXT_JSON);
  if (!raw) return null;
  return ProjectContextContract.parse(raw);
}

function redactDeep(value: unknown): unknown {
  if (typeof value === "string") return redactSensitive(value);
  if (Array.isArray(value)) return value.map(redactDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactDeep(item)]));
  }
  return value;
}

function renderStaticStudioHtml(data: StaticStudioData): string {
  const sessionCount = data.sessions.length;
  const correctionCount = data.corrections.project.length + data.corrections.agent.length;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'">
  <title>Agent Studio</title>
  <style>
    :root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #d9e2ec; --panel: #ffffff; --bg: #f5f7fa; --accent: #0f766e; --accent-2: #7c3aed; --warn: #b45309; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); background: var(--bg); line-height: 1.5; }
    header { padding: 28px clamp(16px, 4vw, 48px) 20px; background: #0b1f24; color: #f8fafc; }
    header h1 { margin: 0 0 8px; font-size: clamp(28px, 4vw, 44px); letter-spacing: 0; }
    header p { margin: 0; color: #cbd5e1; max-width: 980px; }
    main { display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; padding: 20px clamp(16px, 4vw, 48px) 48px; }
    section, details { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; }
    section { padding: 18px; }
    h2 { margin: 0 0 12px; font-size: 22px; letter-spacing: 0; }
    h3 { margin: 18px 0 10px; font-size: 17px; letter-spacing: 0; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 18px; }
    .metric { border: 1px solid rgba(255,255,255,.22); border-radius: 8px; padding: 12px; background: rgba(255,255,255,.08); }
    .metric strong { display: block; font-size: 24px; }
    .metric span { color: #cbd5e1; font-size: 13px; }
    .grid { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 18px; align-items: start; }
    .stack { display: grid; gap: 12px; }
    .muted { color: var(--muted); }
    .path { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; color: var(--muted); overflow-wrap: anywhere; }
    .pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 2px 9px; border: 1px solid var(--line); background: #f8fafc; font-size: 12px; margin: 2px 4px 2px 0; }
    .session-card { padding: 0; overflow: hidden; }
    .session-head { padding: 16px 18px; border-bottom: 1px solid var(--line); display: flex; gap: 10px; flex-wrap: wrap; align-items: baseline; justify-content: space-between; }
    .session-head h2 { margin: 0; }
    .session-body { padding: 18px; display: grid; gap: 18px; }
    .graph-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; background: #fbfdff; padding: 8px; }
    svg.agent-graph { width: 100%; min-width: 520px; max-height: 240px; }
    .event-list { margin: 0; padding-left: 20px; }
    .event-list li { margin: 7px 0; }
    details.agent-stream { padding: 0; }
    details.agent-stream > summary { cursor: pointer; padding: 12px 14px; font-weight: 700; }
    details.agent-stream[open] > summary { border-bottom: 1px solid var(--line); }
    details.agent-stream .stream-body { padding: 12px 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; border-bottom: 1px solid var(--line); padding: 8px; vertical-align: top; }
    th { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; background: #edf2f7; padding: 1px 4px; border-radius: 4px; }
    @media (max-width: 860px) { .grid { grid-template-columns: 1fr; } header { padding-top: 22px; } }
  </style>
</head>
<body>
  <header>
    <h1>Agent Studio</h1>
    <p>Static local export generated from Agent Kit JSON and JSONL files. It embeds a redacted snapshot at export time and does not connect to a server, database, or model API.</p>
    <div class="metrics">
      <div class="metric"><strong>${sessionCount}</strong><span>sessions</span></div>
      <div class="metric"><strong>${correctionCount}</strong><span>active correction files</span></div>
      <div class="metric"><strong>${escapeHtml(data.generatedAt)}</strong><span>generated at</span></div>
    </div>
  </header>
  <main>
    <section>
      <h2>Project Context</h2>
      ${renderContextSummary(data)}
    </section>
    <div class="grid">
      <aside class="stack">
        <section>
          <h2>Corrections</h2>
          ${renderCorrections(data)}
        </section>
        <section>
          <h2>Session Index</h2>
          ${renderSessionIndexLinks(data.sessions)}
        </section>
      </aside>
      <div class="stack">
        ${data.sessions.map(renderSessionSection).join("\n")}
      </div>
    </div>
  </main>
  <script type="application/json" id="agent-studio-data">${safeJsonForHtml(data)}</script>
</body>
</html>
`;
}

function renderContextSummary(data: StaticStudioData): string {
  const context = data.context as
    | {
        projectName?: string;
        productSummary?: string;
        primaryAudience?: string;
        qualityTarget?: string;
        architecture?: { frameworks?: string[]; testTools?: string[]; hasSupabase?: boolean };
        openQuestions?: string[];
      }
    | null;
  if (!context) return `<p class="muted">No project context found. Run <code>agent-kit onboard</code> or <code>agent-kit init --guided</code>.</p>`;
  return `<div class="stack">
    <p><strong>${escapeHtml(context.projectName || "TBD")}</strong> ${escapeHtml(context.productSummary || "No product summary recorded.")}</p>
    <p class="muted">Audience: ${escapeHtml(context.primaryAudience || "TBD")} | Quality target: ${escapeHtml(context.qualityTarget || "baseline-setup")}</p>
    <p>${renderPills([...(context.architecture?.frameworks ?? []), ...(context.architecture?.testTools ?? []), context.architecture?.hasSupabase ? "supabase" : ""].filter(Boolean))}</p>
    ${context.openQuestions?.length ? `<h3>Open Questions</h3>${renderList(context.openQuestions)}` : ""}
    <p class="path">Source: ${CONTEXT_JSON}${data.contextMarkdown ? ` and ${CONTEXT_MD}` : ""}</p>
  </div>`;
}

function renderCorrections(data: StaticStudioData): string {
  const rules = [...data.corrections.project, ...data.corrections.agent].filter((rule) => rule.status === "active");
  if (rules.length === 0) return `<p class="muted">No active durable corrections recorded.</p>`;
  return `<table>
    <thead><tr><th>Scope</th><th>Agent</th><th>Correction</th></tr></thead>
    <tbody>
      ${rules
        .map((rule) => `<tr><td>${escapeHtml(rule.scope)}</td><td>${escapeHtml(rule.agentId ?? rule.appliesToAgents?.join(", ") ?? "all")}</td><td>${escapeHtml(rule.text)}</td></tr>`)
        .join("\n")}
    </tbody>
  </table>`;
}

function renderSessionIndexLinks(sessions: StaticStudioSession[]): string {
  if (sessions.length === 0) return `<p class="muted">No sessions recorded yet.</p>`;
  return `<ol class="event-list">${sessions.map((item) => `<li><a href="#${htmlId(item.session.sessionId)}">${escapeHtml(item.session.title)}</a><br><span class="muted">${escapeHtml(item.session.status)} | ${escapeHtml(item.session.workflowId)}</span></li>`).join("")}</ol>`;
}

function renderSessionSection(item: StaticStudioSession): string {
  const verification = item.events.filter((event) => event.type === "verification_recorded");
  const corrections = item.events.filter((event) => event.type === "human_correction");
  const artifacts = item.events.filter((event) => event.type === "artifact_recorded");
  return `<section class="session-card" id="${htmlId(item.session.sessionId)}">
    <div class="session-head">
      <h2>${escapeHtml(item.session.title)}</h2>
      <div>
        <span class="pill">${escapeHtml(item.session.status)}</span>
        <span class="pill">${escapeHtml(item.session.workflowId)}</span>
        <span class="pill">${item.events.length} events</span>
      </div>
    </div>
    <div class="session-body">
      <p class="muted">Request: ${escapeHtml(item.session.request)}</p>
      <p class="path">Markdown: ${escapeHtml(item.indexPath)} | ${escapeHtml(item.transcriptPath)}</p>
      <div class="graph-wrap">${renderSvgGraph(item.events, item.agents)}</div>
      <div>
        <h3>Agent Streams</h3>
        ${renderAgentStreams(item)}
      </div>
      <div class="grid">
        <div>
          <h3>Verification</h3>
          ${verification.length ? renderEventList(verification) : `<p class="muted">No verification recorded.</p>`}
        </div>
        <div>
          <h3>Corrections And Artifacts</h3>
          ${corrections.length || artifacts.length ? renderEventList([...corrections, ...artifacts]) : `<p class="muted">No corrections or artifacts recorded.</p>`}
        </div>
      </div>
    </div>
  </section>`;
}

function renderAgentStreams(item: StaticStudioSession): string {
  if (item.events.length === 0) return `<p class="muted">No events recorded.</p>`;
  const byAgent = new Map<string, SessionEventContractValue[]>();
  for (const event of item.events) {
    const agent = event.agentId ?? event.fromAgentId ?? "session";
    byAgent.set(agent, [...(byAgent.get(agent) ?? []), event]);
  }
  return [...byAgent.entries()]
    .map(([agent, events]) => `<details class="agent-stream"><summary>${escapeHtml(agent)} (${events.length})</summary><div class="stream-body">${renderEventList(events)}</div></details>`)
    .join("\n");
}

function renderEventList(events: SessionEventContractValue[]): string {
  return `<ol class="event-list">${events.map((event) => `<li><time>${escapeHtml(event.createdAt)}</time> <code>${escapeHtml(event.type)}</code>: ${escapeHtml(eventDetail(event))}</li>`).join("\n")}</ol>`;
}

function eventDetail(event: SessionEventContractValue): string {
  if (event.type === "handoff") return `${event.fromAgentId ?? "unknown"} -> ${event.toAgentId ?? "unknown"}: ${event.decision ?? ""} Risk: ${event.risk ?? ""}`;
  if (event.type === "required_output_updated") return `${event.outputName ?? "output"}: ${event.outputStatus ?? "unknown"}`;
  return event.text ?? event.decision ?? event.command ?? event.artifactPath ?? event.status ?? "";
}

function renderSvgGraph(events: SessionEventContractValue[], knownAgents: string[]): string {
  const handoffs = events.filter((event) => event.type === "handoff");
  const agents = unique([...knownAgents, ...handoffs.flatMap((event) => [event.fromAgentId, event.toAgentId].filter(Boolean) as string[])]);
  if (agents.length === 0) {
    return `<svg class="agent-graph" viewBox="0 0 520 120" role="img" aria-label="No agent handoffs recorded"><text x="24" y="62" fill="#52606d">No handoffs recorded yet.</text></svg>`;
  }
  const width = Math.max(520, agents.length * 180);
  const y = 78;
  const positions = new Map(agents.map((agent, index) => [agent, { x: 74 + index * 170, y }]));
  const edges = handoffs
    .map((event) => {
      const from = positions.get(event.fromAgentId ?? "");
      const to = positions.get(event.toAgentId ?? "");
      if (!from || !to) return "";
      return `<line x1="${from.x + 34}" y1="${from.y}" x2="${to.x - 34}" y2="${to.y}" stroke="#7c3aed" stroke-width="2" marker-end="url(#arrow)" />`;
    })
    .join("\n");
  const nodes = agents
    .map((agent) => {
      const position = positions.get(agent);
      if (!position) return "";
      return `<g><circle cx="${position.x}" cy="${position.y}" r="34" fill="#ccfbf1" stroke="#0f766e" stroke-width="2" /><text x="${position.x}" y="${position.y + 56}" text-anchor="middle" fill="#1f2933" font-size="12">${escapeSvgText(agent)}</text></g>`;
    })
    .join("\n");
  return `<svg class="agent-graph" viewBox="0 0 ${width} 150" role="img" aria-label="Agent handoff graph">
    <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#7c3aed" /></marker></defs>
    ${edges}
    ${nodes}
  </svg>`;
}

function renderPills(values: string[]): string {
  const cleaned = values.filter(Boolean);
  return cleaned.length ? cleaned.map((value) => `<span class="pill">${escapeHtml(value)}</span>`).join("") : `<span class="muted">No stack signals recorded.</span>`;
}

function renderList(values: string[]): string {
  return `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
}

function htmlId(value: string): string {
  return `session-${safeSlug(value)}`;
}

function escapeHtml(value: string | number | undefined | null): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeSvgText(value: string): string {
  return escapeHtml(value).slice(0, 42);
}

function safeJsonForHtml(value: unknown): string {
  return JSON.stringify(value)
    .replace(/&/g, "\\u0026")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");
}
