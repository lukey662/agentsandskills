import { watch, type FSWatcher } from "node:fs";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { join } from "node:path";
import { getActiveSessionId, listSessions, readSession, readSessionEvents, recordSessionNote, renderSession } from "./session.js";
import { renderLiveStudioHtmlWithContext } from "./office/render.js";
import { COUNCIL_SESSIONS_DIR, ensureStudioDirs, readJsonBody } from "./shared.js";

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
  close: () => Promise<void>;
}

const DEFAULT_PORT = 9331;
const DEFAULT_HOST = "127.0.0.1";

type SseClient = ServerResponse;

const sseClients = new Set<SseClient>();
let activeWatcher: FSWatcher | null = null;
let watchedEventsPath: string | null = null;

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function sendHtml(response: ServerResponse, html: string): void {
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Security-Policy":
      "default-src 'none'; connect-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'self'"
  });
  response.end(html);
}

function broadcastSse(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

function stopWatcher(): void {
  if (activeWatcher) {
    activeWatcher.close();
    activeWatcher = null;
    watchedEventsPath = null;
  }
}

function watchSessionEvents(cwd: string, sessionId: string): void {
  const eventsPath = join(cwd, COUNCIL_SESSIONS_DIR, sessionId, "events.jsonl");
  if (watchedEventsPath === eventsPath && activeWatcher) return;
  stopWatcher();
  watchedEventsPath = eventsPath;
  try {
    activeWatcher = watch(eventsPath, () => {
      try {
        const events = readSessionEvents(cwd, sessionId);
        const latest = events.at(-1);
        if (latest) broadcastSse("event", { sessionId, event: latest, total: events.length });
      } catch {
        // file may be mid-write
      }
    });
  } catch {
    watchedEventsPath = null;
    activeWatcher = null;
  }
}

function safeSessionId(raw: string): string | null {
  if (!/^[a-z0-9-]+$/i.test(raw)) return null;
  return raw;
}

function handleRequest(cwd: string, request: IncomingMessage, response: ServerResponse): void {
  handleRequestAsync(cwd, request, response).catch((error) => {
    sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) });
  });
}

async function handleRequestAsync(cwd: string, request: IncomingMessage, response: ServerResponse): Promise<void> {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");

  if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/office")) {
    sendHtml(response, renderLiveStudioHtmlWithContext(cwd));
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
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive"
    });
    response.write(": connected\n\n");
    sseClients.add(response);
    watchSessionEvents(cwd, activeId);

    try {
      const events = readSessionEvents(cwd, activeId);
      response.write(`event: snapshot\ndata: ${JSON.stringify({ sessionId: activeId, events })}\n\n`);
    } catch {
      response.write(`event: snapshot\ndata: ${JSON.stringify({ sessionId: activeId, events: [] })}\n\n`);
    }

    request.on("close", () => {
      sseClients.delete(response);
      if (sseClients.size === 0) stopWatcher();
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
      broadcastSse("event", { sessionId, event, total: readSessionEvents(cwd, sessionId).length });
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
        files: [
          `${result.sessionPath}/index.md`,
          `${result.sessionPath}/transcript.md`
        ]
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
  const requestedPort = options.port ?? DEFAULT_PORT;
  ensureStudioDirs(options.cwd);

  const server = createServer((request, response) => {
    try {
      handleRequest(options.cwd, request, response);
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

  return {
    url: `http://${host}:${port}`,
    port,
    requestedPort,
    portFallback,
    close: () =>
      new Promise((resolve, reject) => {
        stopWatcher();
        for (const client of sseClients) {
          try {
            client.end();
          } catch {
            // ignore
          }
        }
        sseClients.clear();
        server.close((closeError) => {
          if (closeError) reject(closeError);
          else resolve();
        });
      })
  };
}
