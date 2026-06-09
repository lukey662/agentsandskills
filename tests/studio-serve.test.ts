import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initProject } from "../src/install/install.js";
import { buildOfficeStations } from "../src/studio/office/map.js";
import { wizardSectionForStation } from "../src/studio/office/section-map.js";
import { renderLiveStudioHtmlWithContext } from "../src/studio/office/render.js";
import { markSectionComplete } from "../src/studio/onboarding-state.js";
import {
  recordHandoff,
  recordNote,
  startSession
} from "../src/studio/session.js";
import { startStudioServer } from "../src/studio/studio-server.js";

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
      const { value } = await reader!.read();
      controller.abort();
      await reader?.cancel().catch(() => undefined);
      const chunk = new TextDecoder().decode(value ?? new Uint8Array());
      expect(chunk).toContain("event: snapshot");
    } finally {
      await server.close();
    }
  });

  it("marks sections complete through setup PATCH completeSection", async () => {
    const root = tempProject();
    markSectionComplete(root, "ide");
    const onboarding = markSectionComplete(root, "product");
    expect(onboarding.completedSections).toContain("ide");
    expect(onboarding.completedSections).toContain("product");
  });
});
