import { watch, type FSWatcher } from "node:fs";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { join } from "node:path";
import { getActiveSessionId, listSessions, readSession, readSessionEvents, recordSessionNote, renderSession } from "./session.js";
import { renderLiveStudioHtmlWithContext } from "./office/render.js";
import { COUNCIL_SESSIONS_DIR, ensureStudioDirs, readJsonBody } from "./shared.js";
import {
  LocalHttpRequestError,
  assertSecureLocalRequest,
  baseSecurityHeaders,
  createLocalHttpSecurity,
  formatLocalUrl,
  secureLocalHtml,
  type LocalHttpSecurity
} from "./local-http-security.js";

export interface StudioServerOptions {
  cwd: string;
  port?: number;
  host?: string;
}

export interface StudioServerHandle {
  url: string;
  port: number;
  requestedPort: number;
  portFallback: boolean;
  csrfToken: string;
  close: () => Promise<void>;
}

const DEFAULT_PORT = 9331;
const DEFAULT_HOST = "127.0.0.1";

interface SessionStream {
  clients: Set<ServerResponse>;
  watcher: FSWatcher | null;
  lastEventKey: string;
}

class StudioEventHub {
  private readonly streams = new Map<string, SessionStream>();

  constructor(private readonly cwd: string) {}

  subscribe(sessionId: string, response: ServerResponse): () => void {
    const stream = this.getOrCreate(sessionId);
    stream.clients.add(response);
    this.watch(sessionId, stream);
    return () => {
      stream.clients.delete(response);
      if (stream.clients.size === 0) {
        stream.watcher?.close();
        this.streams.delete(sessionId);
      }
    };
  }

  broadcast(sessionId: string, event: unknown, total: number): void {
    const stream = this.streams.get(sessionId);
    if (!stream) return;
    const eventRecord = event && typeof event === "object" ? (event as { eventId?: unknown; sequence?: unknown }) : {};
    const eventKey = eventRecord.eventId ?? eventRecord.sequence;
    stream.lastEventKey = typeof eventKey === "string" || typeof eventKey === "number" ? String(eventKey) : String(total);
    const payload = `event: event\ndata: ${JSON.stringify({ sessionId, event, total })}\n\n`;
    for (const client of stream.clients) {
      try {
        client.write(payload);
      } catch {
        stream.clients.delete(client);
      }
    }
  }

  close(): void {
    for (const stream of this.streams.values()) {
      stream.watcher?.close();
      for (const client of stream.clients) {
        try {
          client.end();
        } catch {
          // The client may already have disconnected.
        }
      }
    }
    this.streams.clear();
  }

  private getOrCreate(sessionId: string): SessionStream {
    const existing = this.streams.get(sessionId);
    if (existing) return existing;
    const stream: SessionStream = { clients: new Set(), watcher: null, lastEventKey: "" };
    this.streams.set(sessionId, stream);
    return stream;
  }

  private watch(sessionId: string, stream: SessionStream): void {
    if (stream.watcher) return;
    const eventsPath = join(this.cwd, COUNCIL_SESSIONS_DIR, sessionId, "events.jsonl");
    try {
      stream.watcher = watch(eventsPath, () => {
        try {
          const events = readSessionEvents(this.cwd, sessionId);
          const latest = events.at(-1);
          if (!latest) return;
          const eventKey = String(latest.eventId ?? latest.sequence ?? events.length);
          if (eventKey === stream.lastEventKey) return;
          this.broadcast(sessionId, latest, events.length);
        } catch {
          // A partial trailing JSON line is ignored until the next complete write.
        }
      });
    } catch {
      stream.watcher = null;
    }
  }
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, {
    ...baseSecurityHeaders(),
    "Content-Type": "application/json; charset=utf-8",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'"
  });
  response.end(JSON.stringify(payload));
}

function sendHtml(response: ServerResponse, html: string, security: LocalHttpSecurity): void {
  const secured = secureLocalHtml(html, security);
  response.writeHead(200, {
    ...baseSecurityHeaders(),
    "Content-Type": "text/html; charset=utf-8",
    "Content-Security-Policy": secured.csp
  });
  response.end(secured.body);
}

function safeSessionId(raw: string): string | null {
  if (!/^[a-z0-9-]+$/i.test(raw)) return null;
  return raw;
}

type RuntimeService = InstanceType<(typeof import("@appsforgood/agent-kit-runtime"))["AgentKitRuntimeService"]>;

async function loadRuntimeService(cwd: string): Promise<RuntimeService> {
  try {
    const { AgentKitRuntimeService } = await import("@appsforgood/agent-kit-runtime");
    return new AgentKitRuntimeService(cwd);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("@appsforgood/agent-kit-runtime") || message.includes("Cannot find package")) {
      throw new Error("The optional orchestrator runtime is not installed.");
    }
    throw error;
  }
}

function handleRequest(cwd: string, request: IncomingMessage, response: ServerResponse, security: LocalHttpSecurity, eventHub: StudioEventHub): void {
  handleRequestAsync(cwd, request, response, security, eventHub).catch((error) => {
    sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) });
  });
}

async function handleRequestAsync(
  cwd: string,
  request: IncomingMessage,
  response: ServerResponse,
  security: LocalHttpSecurity,
  eventHub: StudioEventHub
): Promise<void> {
  try {
    assertSecureLocalRequest(request, security);
  } catch (error) {
    if (error instanceof LocalHttpRequestError) {
      sendJson(response, error.statusCode, { error: error.message });
      return;
    }
    throw error;
  }
  const url = new URL(request.url ?? "/", "http://127.0.0.1");

  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/office")) {
    sendHtml(response, renderLiveStudioHtmlWithContext(cwd), security);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/sessions") {
    ensureStudioDirs(cwd);
    let activeSessionId = "";
    try {
      activeSessionId = getActiveSessionId(cwd);
    } catch {
      activeSessionId = "";
    }
    const sessions = listSessions(cwd);
    sendJson(response, 200, { activeSessionId, sessions });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/runtime/runs") {
    try {
      const runtime = await loadRuntimeService(cwd);
      const validation = runtime.validate();
      sendJson(response, 200, { runs: runtime.status(), enabled: validation.enabled, warnings: validation.warnings });
    } catch (error) {
      sendJson(response, 503, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/runtime/plan") {
    try {
      const body = (await readJsonBody(request)) as { goal?: unknown; workflowId?: unknown };
      const goal = typeof body.goal === "string" ? body.goal.trim() : "";
      const workflowId = typeof body.workflowId === "string" && body.workflowId.trim() ? body.workflowId.trim() : undefined;
      if (!goal || goal.length > 20_000) {
        sendJson(response, 400, { error: "goal must be between 1 and 20000 characters." });
        return;
      }
      const runtime = await loadRuntimeService(cwd);
      sendJson(response, 200, { plan: runtime.plan(goal, workflowId) });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/runtime/runs") {
    try {
      const body = (await readJsonBody(request)) as { goal?: unknown; workflowId?: unknown; acknowledgeDirtyBase?: unknown };
      const goal = typeof body.goal === "string" ? body.goal.trim() : "";
      const workflowId = typeof body.workflowId === "string" && body.workflowId.trim() ? body.workflowId.trim() : undefined;
      if (!goal || goal.length > 20_000) {
        sendJson(response, 400, { error: "goal must be between 1 and 20000 characters." });
        return;
      }
      if (body.acknowledgeDirtyBase !== undefined && typeof body.acknowledgeDirtyBase !== "boolean") {
        sendJson(response, 400, { error: "acknowledgeDirtyBase must be boolean." });
        return;
      }
      const runtime = await loadRuntimeService(cwd);
      const run = await runtime.run(goal, {
        ...(workflowId ? { workflowId } : {}),
        ...(body.acknowledgeDirtyBase === true ? { acknowledgeDirtyBase: true } : {})
      });
      sendJson(response, 201, { run, events: runtime.events.events(run.runId) });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  const runtimeRunMatch = url.pathname.match(/^\/api\/runtime\/runs\/([^/]+)$/);
  if (request.method === "GET" && runtimeRunMatch) {
    const runId = safeSessionId(runtimeRunMatch[1] ?? "");
    if (!runId) {
      sendJson(response, 400, { error: "Invalid run id." });
      return;
    }
    try {
      const runtime = await loadRuntimeService(cwd);
      const run = runtime.status(runId);
      sendJson(response, 200, { run, events: runtime.events.events(runId) });
    } catch (error) {
      sendJson(response, 404, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  const runtimeDecisionMatch = url.pathname.match(/^\/api\/runtime\/runs\/([^/]+)\/decision$/);
  if (request.method === "POST" && runtimeDecisionMatch) {
    const runId = safeSessionId(runtimeDecisionMatch[1] ?? "");
    if (!runId) {
      sendJson(response, 400, { error: "Invalid run id." });
      return;
    }
    try {
      const body = (await readJsonBody(request)) as { decision?: unknown; actor?: unknown; note?: unknown };
      if (body.decision !== "approve" && body.decision !== "reject") {
        sendJson(response, 400, { error: "decision must be approve or reject." });
        return;
      }
      const actor = typeof body.actor === "string" && body.actor.trim() ? body.actor.trim().slice(0, 200) : "studio-operator";
      const note = typeof body.note === "string" && body.note.trim() ? body.note.trim().slice(0, 2_000) : undefined;
      const runtime = await loadRuntimeService(cwd);
      const current = runtime.status(runId);
      if (Array.isArray(current) || !current.pendingApproval) {
        sendJson(response, 409, { error: `Run ${runId} has no pending approval.` });
        return;
      }
      const run = await runtime.resume(runId, {
        approvalId: current.pendingApproval.approvalId,
        decision: body.decision,
        actor,
        ...(note ? { note } : {})
      });
      sendJson(response, 200, { run, events: runtime.events.events(runId) });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  const runtimeCancelMatch = url.pathname.match(/^\/api\/runtime\/runs\/([^/]+)\/cancel$/);
  if (request.method === "POST" && runtimeCancelMatch) {
    const runId = safeSessionId(runtimeCancelMatch[1] ?? "");
    if (!runId) {
      sendJson(response, 400, { error: "Invalid run id." });
      return;
    }
    try {
      const runtime = await loadRuntimeService(cwd);
      const run = runtime.cancel(runId);
      sendJson(response, 200, { run, events: runtime.events.events(runId) });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  const eventsMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/events$/);
  if (request.method === "GET" && eventsMatch) {
    const sessionId = safeSessionId(eventsMatch[1] ?? "");
    if (!sessionId) {
      sendJson(response, 400, { error: "Invalid session id." });
      return;
    }
    try {
      const session = readSession(cwd, sessionId);
      const events = readSessionEvents(cwd, sessionId);
      sendJson(response, 200, { session, events });
    } catch (error) {
      sendJson(response, 404, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/events/stream") {
    const sessionId = url.searchParams.get("sessionId") ?? "";
    let activeId = sessionId;
    if (!activeId) {
      try {
        activeId = getActiveSessionId(cwd);
      } catch {
        sendJson(response, 404, { error: "No active session." });
        return;
      }
    }
    if (!safeSessionId(activeId)) {
      sendJson(response, 400, { error: "Invalid session id." });
      return;
    }

    response.writeHead(200, {
      ...baseSecurityHeaders(),
      "Content-Type": "text/event-stream; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    response.write(": connected\n\n");
    const unsubscribe = eventHub.subscribe(activeId, response);

    try {
      const events = readSessionEvents(cwd, activeId);
      response.write(`event: snapshot\ndata: ${JSON.stringify({ sessionId: activeId, events })}\n\n`);
    } catch {
      response.write(`event: snapshot\ndata: ${JSON.stringify({ sessionId: activeId, events: [] })}\n\n`);
    }

    request.on("close", () => {
      unsubscribe();
    });
    return;
  }

  const noteMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/note$/);
  if (request.method === "POST" && noteMatch) {
    const sessionId = safeSessionId(noteMatch[1] ?? "");
    if (!sessionId) {
      sendJson(response, 400, { error: "Invalid session id." });
      return;
    }
    try {
      const body = (await readJsonBody(request)) as { agent?: string; text?: string };
      const agent = typeof body.agent === "string" ? body.agent.trim() : "";
      const text = typeof body.text === "string" ? body.text.trim() : "";
      if (!agent) {
        sendJson(response, 400, { error: "agent is required." });
        return;
      }
      if (!text) {
        sendJson(response, 400, { error: "text is required." });
        return;
      }
      if (text.length >= 4000) {
        sendJson(response, 400, { error: "text must be under 4000 characters." });
        return;
      }
      const event = recordSessionNote(cwd, sessionId, agent, text);
      eventHub.broadcast(sessionId, event, readSessionEvents(cwd, sessionId).length);
      sendJson(response, 200, { event });
    } catch (error) {
      sendJson(response, 404, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  const renderMatch = url.pathname.match(/^\/api\/sessions\/([^/]+)\/render$/);
  if (request.method === "POST" && renderMatch) {
    const sessionId = safeSessionId(renderMatch[1] ?? "");
    if (!sessionId) {
      sendJson(response, 400, { error: "Invalid session id." });
      return;
    }
    try {
      const result = renderSession(cwd, sessionId);
      sendJson(response, 200, {
        rendered: true,
        sessionId: result.sessionId,
        sessionPath: result.sessionPath,
        files: [`${result.sessionPath}/index.md`, `${result.sessionPath}/transcript.md`]
      });
    } catch (error) {
      sendJson(response, 404, { error: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  sendJson(response, 404, { error: "Not found." });
}

function listen(server: Server, host: string, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not determine studio server port."));
        return;
      }
      resolve(address.port);
    });
  });
}

export async function startStudioServer(options: StudioServerOptions): Promise<StudioServerHandle> {
  const host = options.host ?? DEFAULT_HOST;
  const security = createLocalHttpSecurity(host);
  const requestedPort = options.port ?? DEFAULT_PORT;
  ensureStudioDirs(options.cwd);
  const eventHub = new StudioEventHub(options.cwd);

  const server = createServer((request, response) => {
    try {
      handleRequest(options.cwd, request, response, security, eventHub);
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  });

  let port = requestedPort;
  let portFallback = false;
  try {
    port = await listen(server, host, requestedPort);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "EADDRINUSE") {
      portFallback = true;
      port = await listen(server, host, 0);
    } else {
      throw error;
    }
  }

  security.port = port;

  return {
    url: formatLocalUrl(host, port),
    port,
    requestedPort,
    portFallback,
    csrfToken: security.csrfToken,
    close: () =>
      new Promise((resolve, reject) => {
        eventHub.close();
        server.close((closeError) => {
          if (closeError) reject(closeError);
          else resolve();
        });
      })
  };
}
