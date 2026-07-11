import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/install/install.js";
import { buildOfficeStations } from "../src/studio/office/map.js";
import { wizardSectionForStation } from "../src/studio/office/section-map.js";
import { renderLiveStudioHtmlWithContext } from "../src/studio/office/render.js";
import { markSectionComplete } from "../src/studio/onboarding-state.js";
import { recordHandoff, recordNote, startSession } from "../src/studio/session.js";
import { startStudioServer } from "../src/studio/studio-server.js";
import { localMutation } from "./helpers/local-http.js";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function tempProject(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-studio-serve-"));
  roots.push(root);
  writeFileSync(
    join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "studio-serve-test",
        scripts: { test: "vitest run" },
        dependencies: { next: "15.0.0", react: "19.0.0" }
      },
      null,
      2
    )}\n`
  );
  initProject({ cwd: root });
  return root;
}

describe("agent-kit studio serve", () => {
  it("renders live studio html with studio boot mode", () => {
    const root = tempProject();
    const html = renderLiveStudioHtmlWithContext(root);
    expect(html).toContain("Live Agent Studio");
    expect(html).toContain('data-view="studio-v1"');
    expect(html).toContain('"mode":"studio"');
    expect(html).toContain("transcript-panel");
    expect(html).toContain('id="session-picker"');
    expect(html).toContain('id="studio-render-btn"');
    expect(html).toContain('id="studio-runtime-tab"');
    expect(html).toContain('id="runtime-start-form"');
    expect(html).toContain('id="runtime-start-btn" disabled');
    expect(html).toContain('id="runtime-approval"');
  });

  it("maps office stations to wizard section ids", () => {
    const stations = buildOfficeStations([]);
    const ide = stations.find((s) => s.id === "ide");
    const coffee = stations.find((s) => s.id === "coffee");
    expect(wizardSectionForStation(ide!)).toBe("ide");
    expect(wizardSectionForStation(coffee!)).toBeNull();
    expect(stations.some((s) => s.kind === "amenity")).toBe(true);
  });

  it("serves sessions list, events, and SSE stream on localhost", async () => {
    const root = tempProject();
    const session = startSession(root, { title: "Live council test", workflowId: "planning" });
    recordNote(root, "planner", "Kickoff note for studio serve test.");
    recordHandoff(root, {
      fromAgentId: "planner",
      toAgentId: "lead-architect",
      decision: "Review architecture.",
      risk: "Scope creep."
    });

    const server = await startStudioServer({ cwd: root, port: 0 });
    try {
      const home = await fetch(`${server.url}/`);
      expect(home.ok).toBe(true);
      const html = await home.text();
      expect(html).toContain("Live Agent Studio");

      const sessionsRes = await fetch(`${server.url}/api/sessions`);
      expect(sessionsRes.ok).toBe(true);
      const sessionsPayload = (await sessionsRes.json()) as { activeSessionId: string; sessions: unknown[] };
      expect(sessionsPayload.activeSessionId).toBe(session.sessionId);
      expect(sessionsPayload.sessions.length).toBeGreaterThan(0);

      const eventsRes = await fetch(`${server.url}/api/sessions/${session.sessionId}/events`);
      expect(eventsRes.ok).toBe(true);
      const eventsPayload = (await eventsRes.json()) as { events: Array<{ type: string }> };
      expect(eventsPayload.events.some((e) => e.type === "handoff")).toBe(true);

      const controller = new AbortController();
      const streamRes = await fetch(`${server.url}/api/events/stream?sessionId=${session.sessionId}`, {
        signal: controller.signal
      });
      expect(streamRes.ok).toBe(true);
      expect(streamRes.headers.get("content-type")).toContain("text/event-stream");
      const reader = streamRes.body?.getReader();
      let chunk = "";
      const deadline = Date.now() + 2000;
      while (!chunk.includes("event: snapshot") && Date.now() < deadline) {
        const { value, done } = await reader!.read();
        if (done) break;
        chunk += new TextDecoder().decode(value ?? new Uint8Array());
      }
      controller.abort();
      await reader?.cancel().catch(() => undefined);
      expect(chunk).toContain("event: snapshot");
    } finally {
      await server.close();
    }
  });

  it("POST note appends to events and POST render writes markdown files", async () => {
    const root = tempProject();
    const session = startSession(root, { title: "Note render test", workflowId: "planning" });
    const server = await startStudioServer({ cwd: root, port: 0 });
    try {
      const noteRes = await fetch(
        `${server.url}/api/sessions/${session.sessionId}/note`,
        localMutation(server, {
          method: "POST",
          body: JSON.stringify({ agent: "planner", text: "Studio note from API test." })
        })
      );
      expect(noteRes.ok).toBe(true);
      const noteBody = (await noteRes.json()) as { event: { text: string; type: string } };
      expect(noteBody.event.type).toBe("agent_message");
      expect(noteBody.event.text).toContain("Studio note");

      const renderRes = await fetch(`${server.url}/api/sessions/${session.sessionId}/render`, localMutation(server, { method: "POST" }));
      expect(renderRes.ok).toBe(true);
      const renderBody = (await renderRes.json()) as { rendered: boolean; files: string[] };
      expect(renderBody.rendered).toBe(true);
      expect(renderBody.files.some((f) => f.endsWith("index.md"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  it("POST note rejects invalid session id and oversized text", async () => {
    const root = tempProject();
    const session = startSession(root, { title: "Validation test", workflowId: "planning" });
    const server = await startStudioServer({ cwd: root, port: 0 });
    try {
      const badId = await fetch(
        `${server.url}/api/sessions/bad%2Fid/note`,
        localMutation(server, {
          method: "POST",
          body: JSON.stringify({ agent: "planner", text: "x" })
        })
      );
      expect(badId.status).toBe(400);

      const longText = "x".repeat(4000);
      const tooLong = await fetch(
        `${server.url}/api/sessions/${session.sessionId}/note`,
        localMutation(server, {
          method: "POST",
          body: JSON.stringify({ agent: "planner", text: longText })
        })
      );
      expect(tooLong.status).toBe(400);
    } finally {
      await server.close();
    }
  });

  it("starts and rejects a checkpointed runtime run through the secured API", async () => {
    const root = tempProject();
    const cache = mkdtempSync(join(tmpdir(), "agent-kit-runtime-studio-cache-"));
    roots.push(cache);
    const previousCache = process.env.XDG_CACHE_HOME;
    process.env.XDG_CACHE_HOME = cache;
    const configPath = join(root, ".agent-kit", "orchestrator.json");
    const config = JSON.parse(readFileSync(configPath, "utf8")) as Record<string, unknown>;
    config.enabled = true;
    config.providers = { local: { kind: "ollama" } };
    config.modelAliases = {
      balanced: { candidates: [{ provider: "local", model: "test-model" }], requiredCapabilities: ["text"] }
    };
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
    execFileSync("git", ["init", "-q"], { cwd: root });
    execFileSync("git", ["config", "user.name", "Agent Kit Test"], { cwd: root });
    execFileSync("git", ["config", "user.email", "agent-kit@example.invalid"], { cwd: root });
    execFileSync("git", ["add", "."], { cwd: root });
    execFileSync("git", ["commit", "-qm", "initial"], { cwd: root });

    const server = await startStudioServer({ cwd: root, port: 0 });
    try {
      const list = await fetch(`${server.url}/api/runtime/runs`);
      expect(list.ok).toBe(true);
      await expect(list.json()).resolves.toMatchObject({ enabled: true, runs: [] });

      const started = await fetch(
        `${server.url}/api/runtime/runs`,
        localMutation(server, {
          method: "POST",
          body: JSON.stringify({ goal: "Review project documentation", workflowId: "planning" })
        })
      );
      const startedBody = (await started.json()) as {
        run: { runId: string; status: string; pendingApproval?: { risk: string } };
        events: Array<{ type: string }>;
        error?: string;
      };
      expect(started.status, startedBody.error).toBe(201);
      expect(startedBody.run.status).toBe("awaiting-approval");
      expect(startedBody.run.pendingApproval?.risk).toBe("plan");
      expect(startedBody.events.some((event) => event.type === "approval_requested")).toBe(true);

      const detail = await fetch(`${server.url}/api/runtime/runs/${startedBody.run.runId}`);
      expect(detail.ok).toBe(true);

      const rejected = await fetch(
        `${server.url}/api/runtime/runs/${startedBody.run.runId}/decision`,
        localMutation(server, {
          method: "POST",
          body: JSON.stringify({ decision: "reject", actor: "studio-test" })
        })
      );
      expect(rejected.ok).toBe(true);
      const rejectedBody = (await rejected.json()) as { run: { status: string; pendingApproval?: unknown } };
      expect(rejectedBody.run.status).toBe("cancelled");
      expect(rejectedBody.run.pendingApproval).toBeUndefined();
    } finally {
      await server.close();
      if (previousCache === undefined) delete process.env.XDG_CACHE_HOME;
      else process.env.XDG_CACHE_HOME = previousCache;
    }
  });

  it("SSE stream works for explicit non-active sessionId", async () => {
    const root = tempProject();
    const first = startSession(root, { title: "First", workflowId: "planning" });
    recordNote(root, "planner", "First session note.");
    const second = startSession(root, { title: "Second", workflowId: "planning" });
    recordNote(root, "planner", "Second session note.");

    const server = await startStudioServer({ cwd: root, port: 0 });
    try {
      const controller = new AbortController();
      const streamRes = await fetch(`${server.url}/api/events/stream?sessionId=${first.sessionId}`, {
        signal: controller.signal
      });
      expect(streamRes.ok).toBe(true);
      const reader = streamRes.body?.getReader();
      let chunk = "";
      const deadline = Date.now() + 2000;
      while (!chunk.includes("First session note") && Date.now() < deadline) {
        const { value, done } = await reader!.read();
        if (done) break;
        chunk += new TextDecoder().decode(value ?? new Uint8Array());
      }
      controller.abort();
      await reader?.cancel().catch(() => undefined);
      expect(chunk).toContain("First session note");
      expect(second.sessionId).not.toBe(first.sessionId);
    } finally {
      await server.close();
    }
  });

  it("marks sections complete through setup PATCH completeSection", () => {
    const root = tempProject();
    markSectionComplete(root, "ide");
    const onboarding = markSectionComplete(root, "product");
    expect(onboarding.completedSections).toContain("ide");
    expect(onboarding.completedSections).toContain("product");
  });
});
