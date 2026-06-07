import { appendFileSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectContextContract, SessionEventContract, StudioSessionContract } from "../src/config/contracts.js";
import { createAuditReport } from "../src/install/audit.js";
import { initProject } from "../src/install/install.js";
import { initProjectContext, validateProjectContext } from "../src/studio/context.js";
import { addCorrection, applyCorrection, listCorrections, retireCorrection } from "../src/studio/corrections.js";
import { exportStaticStudio } from "../src/studio/export.js";
import {
  closeSession,
  recordArtifact,
  recordCorrection,
  recordDecision,
  recordHandoff,
  recordVerification,
  renderActiveSession,
  startSession
} from "../src/studio/session.js";

let roots: string[] = [];

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots = [];
});

function tempProject(): string {
  const root = mkdtempSync(join(tmpdir(), "agent-kit-studio-test-"));
  roots.push(root);
  writeFileSync(
    join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "studio-test-project",
        scripts: { test: "vitest run", build: "next build" },
        dependencies: { next: "15.0.0", react: "19.0.0", "@supabase/supabase-js": "2.0.0" },
        devDependencies: { vitest: "4.0.0", "@playwright/test": "1.0.0", tailwindcss: "4.0.0" }
      },
      null,
      2
    )}\n`
  );
  writeFileSync(join(root, ".env.example"), "NEXT_PUBLIC_SUPABASE_URL=\nSUPABASE_SERVICE_ROLE_KEY=\n");
  initProject({ cwd: root });
  return root;
}

describe("Agent Studio local workflow", () => {
  it("creates project context from a local scan and renders markdown", () => {
    const root = tempProject();

    const result = initProjectContext(root);
    const context = JSON.parse(readFileSync(join(root, ".agent-kit", "project-context.json"), "utf8")) as unknown;
    const markdown = readFileSync(join(root, ".agent-kit", "project-context.md"), "utf8");

    expect(ProjectContextContract.safeParse(context).success).toBe(true);
    expect(result.openQuestions).toContain("What does this product do in one concrete paragraph?");
    expect(markdown).toContain("studio-test-project");
    expect(markdown).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(markdown).not.toContain("SUPABASE_SERVICE_ROLE_KEY=");
    expect(validateProjectContext(root).contextPath).toBe(".agent-kit/project-context.json");
  });

  it("records, renders, and audits a session with durable project corrections", () => {
    const root = tempProject();
    const fakeSecret = "sk_test_fake_secret_value";
    initProjectContext(root);

    const session = startSession(root, { title: "Build checkout flow", workflowId: "frontend-change" });
    recordDecision(root, "planner", "Use the frontend-change workflow.", "Generic UI risk.");
    recordHandoff(root, {
      fromAgentId: "planner",
      toAgentId: "frontend-design-lead",
      decision: "Start content-first design intake.",
      risk: "Generic UI risk.",
      evidence: ["DESIGN.md"]
    });
    recordCorrection(root, {
      agentId: "frontend-design-lead",
      scope: "project",
      text: `Keep UI dense and operational. ${fakeSecret}`
    });
    recordArtifact(root, "DESIGN.md", "Design direction updated.");
    recordVerification(root, `npm test ${fakeSecret}`, "pass", "Smoke verification passed.");
    renderActiveSession(root);

    const sessionJson = JSON.parse(readFileSync(join(root, ".agent-kit", "council-sessions", session.sessionId, "session.json"), "utf8")) as unknown;
    const eventLines = readFileSync(join(root, ".agent-kit", "council-sessions", session.sessionId, "events.jsonl"), "utf8")
      .trim()
      .split(/\r?\n/)
      .map((line) => JSON.parse(line) as unknown);
    const index = readFileSync(join(root, ".agent-kit", "council-sessions", session.sessionId, "index.md"), "utf8");
    const transcript = readFileSync(join(root, ".agent-kit", "council-sessions", session.sessionId, "transcript.md"), "utf8");
    const corrections = listCorrections(root);
    const audit = createAuditReport(root);

    expect(StudioSessionContract.safeParse(sessionJson).success).toBe(true);
    expect(eventLines.every((event) => SessionEventContract.safeParse(event).success)).toBe(true);
    expect(index).toContain("Handoff Graph");
    expect(index).toContain("frontend-design-lead");
    expect(transcript).toContain("planner");
    expect(corrections.project).toHaveLength(1);
    expect(JSON.stringify(corrections)).not.toContain(fakeSecret);
    expect(index).not.toContain(fakeSecret);
    expect(transcript).not.toContain(fakeSecret);
    expect(audit.summary.fail).toBe(0);
    expect(audit.findings.some((finding) => finding.area === "studio")).toBe(true);
  });

  it("exports a static local studio without embedding secret-like values", () => {
    const root = tempProject();
    const fakeSecret = "sk_test_fake_secret_value";
    initProjectContext(root);

    const session = startSession(root, { title: "Static studio export", workflowId: "frontend-change" });
    recordDecision(root, "planner", "Use the frontend workflow.", "Need visible handoff evidence.");
    recordHandoff(root, {
      fromAgentId: "planner",
      toAgentId: "qa-engineer",
      decision: "Verify static export.",
      risk: `Secret must not leak: ${fakeSecret}`,
      evidence: ["tests/studio.test.ts"]
    });
    recordCorrection(root, {
      agentId: "qa-engineer",
      scope: "project",
      text: `Check static HTML for secrets. ${fakeSecret}`
    });
    recordVerification(root, `npm test ${fakeSecret}`, "pass", "Export verification passed.");
    renderActiveSession(root);

    const result = exportStaticStudio(root);
    const html = readFileSync(join(root, ".agent-kit", "studio", "index.html"), "utf8");
    const audit = createAuditReport(root);

    expect(result.studioPath).toBe(".agent-kit/studio/index.html");
    expect(result.sessionCount).toBe(1);
    expect(html).toContain("Agent Studio");
    expect(html).toContain("agent-studio-data");
    expect(html).toContain("<svg");
    expect(html).toContain("<details");
    expect(html).toContain(session.sessionId);
    expect(html).not.toContain(fakeSecret);
    expect(audit.summary.fail).toBe(0);
    expect(audit.findings.some((finding) => finding.message.includes(".agent-kit/studio/index.html is present"))).toBe(true);
  });

  it("applies and retires durable corrections without deleting review history", () => {
    const root = tempProject();
    initProjectContext(root);
    startSession(root, { title: "Correction lifecycle" });
    const correction = recordCorrection(root, {
      scope: "project",
      text: "Keep operational screens dense and specific."
    });
    if (!correction.correctionId) throw new Error("Expected project correction to be promoted into durable rules.");

    const retired = retireCorrection(root, correction.correctionId, "Superseded during review.");
    const applied = applyCorrection(root, correction.correctionId);
    const corrections = listCorrections(root);

    expect(retired.status).toBe("retired");
    expect(retired.reason).toBe("Superseded during review.");
    expect(applied.status).toBe("active");
    expect(applied.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(applied.reason).toBeUndefined();
    expect(corrections.project.find((rule) => rule.id === correction.correctionId)?.status).toBe("active");
  });

  it("escapes markdown, HTML, and Mermaid-sensitive labels in rendered sessions", () => {
    const root = tempProject();
    initProjectContext(root);
    const session = startSession(root, { title: "Unsafe ![title](javascript:bad)", request: "Use <script>bad()</script>" });
    recordDecision(root, "planner|lead", "Use | table\n![bad](javascript:alert)", "Risk <script>bad()</script>");
    recordHandoff(root, {
      fromAgentId: 'planner"] --> injected["bad',
      toAgentId: "qa|lead",
      decision: "Review | output\nwith newline",
      risk: "Avoid <img src=x onerror=bad()>",
      evidence: ["DESIGN.md|SPEC.md"]
    });
    recordCorrection(root, {
      agentId: "frontend|lead",
      scope: "session",
      text: "Do not render ![secret](javascript:alert)\nUse | tables"
    });
    recordArtifact(root, "DESIGN.md", "Contains <script>nope</script> and | pipes.");
    recordVerification(root, "npm test | tee log", "pass", "No <script> tags.");
    renderActiveSession(root);

    const index = readFileSync(join(root, ".agent-kit", "council-sessions", session.sessionId, "index.md"), "utf8");
    const transcript = readFileSync(join(root, ".agent-kit", "council-sessions", session.sessionId, "transcript.md"), "utf8");

    expect(index).not.toContain("![secret]");
    expect(index).not.toContain("<script>");
    expect(index).not.toContain("--> injected");
    expect(index).toContain("\\|");
    expect(index).toContain("<br>");
    expect(index).toContain("&lt;script&gt;");
    expect(index).toContain("\\!\\[secret\\]\\(javascript:alert\\)");
    expect(transcript).not.toContain("![bad]");
    expect(transcript).toContain("\\!\\[bad\\]\\(javascript:alert\\)");
  });

  it("rejects invalid correction scopes", () => {
    const root = tempProject();

    expect(() =>
      addCorrection(root, {
        scope: "global" as Parameters<typeof addCorrection>[1]["scope"],
        text: "Invalid scope should not be persisted."
      })
    ).toThrow(/Invalid enum value|Expected/);
  });

  it("rejects path traversal when recording artifacts", () => {
    const root = tempProject();
    initProjectContext(root);
    startSession(root, { title: "Unsafe artifact" });

    expect(() => recordArtifact(root, "../.env", "unsafe")).toThrow(/Unsafe path/);
  });

  it("fails audit for malformed session events", () => {
    const root = tempProject();
    initProjectContext(root);
    const session = startSession(root, { title: "Malformed event" });
    appendFileSync(join(root, ".agent-kit", "council-sessions", session.sessionId, "events.jsonl"), "{bad json}\n");

    const audit = createAuditReport(root);
    expect(audit.summary.fail).toBeGreaterThan(0);
    expect(audit.findings.some((finding) => finding.message.includes("not valid JSON"))).toBe(true);
  });

  it("fails audit when a completed session lacks verification and required outputs", () => {
    const root = tempProject();
    initProjectContext(root);
    startSession(root, { title: "Incomplete completion", workflowId: "frontend-change" });
    closeSession(root, "complete");

    const audit = createAuditReport(root);
    expect(audit.summary.fail).toBeGreaterThan(0);
    expect(audit.findings.some((finding) => finding.message.includes("complete but lacks required outputs"))).toBe(true);
  });

  it("installs Agent Studio schemas with normal init", () => {
    const root = tempProject();

    expect(existsSync(join(root, ".agent-kit", "schemas", "project-context.schema.json"))).toBe(true);
    expect(existsSync(join(root, ".agent-kit", "schemas", "correction-rules.schema.json"))).toBe(true);
    expect(existsSync(join(root, ".agent-kit", "schemas", "session-event.schema.json"))).toBe(true);
    expect(existsSync(join(root, ".agent-kit", "schemas", "studio-session.schema.json"))).toBe(true);
  });
});
