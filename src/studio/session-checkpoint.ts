import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import {
  closeSession,
  recordArtifact,
  recordCorrection,
  recordDecision,
  recordHandoff,
  recordNote,
  recordRequiredOutput,
  recordVerification,
  renderActiveSession,
  startSession,
  getActiveSessionId,
  type HandoffOptions,
  type SessionCommandResult,
  type StartSessionOptions
} from "./session.js";

export interface SessionCheckpointPayload {
  start?: StartSessionOptions;
  notes?: Array<{ agent: string; text: string }>;
  decisions?: Array<{ agent: string; text: string; risk?: string }>;
  handoffs?: Array<HandoffOptions>;
  corrections?: Array<{ agent?: string; scope?: "session" | "project" | "agent" | "upstream-proposal"; text: string }>;
  artifacts?: Array<{ file: string; note?: string }>;
  verifications?: Array<{ command: string; result: "pass" | "fail" | "skipped"; notes?: string }>;
  outputs?: Array<{ name: string; status: "missing" | "partial" | "complete" | "not-applicable"; evidence?: string }>;
  render?: boolean;
  close?: boolean | "planned" | "in-progress" | "blocked" | "complete";
}

export interface SessionCheckpointResult extends SessionCommandResult {
  applied: {
    notes: number;
    decisions: number;
    handoffs: number;
    corrections: number;
    artifacts: number;
    verifications: number;
    outputs: number;
  };
  rendered: boolean;
  closed: boolean;
}

function parseCheckpointMarkdown(content: string): SessionCheckpointPayload {
  const payload: SessionCheckpointPayload = { notes: [], decisions: [], handoffs: [], outputs: [] };
  const sections = content.split(/^## /m).slice(1);
  for (const section of sections) {
    const [headingLine, ...bodyLines] = section.split("\n");
    if (!headingLine) continue;
    const heading = headingLine.trim().toLowerCase();
    const lines = bodyLines.map((line) => line.trim()).filter(Boolean);
    if (heading === "notes") {
      for (const line of lines) {
        const match = line.match(/^-?\s*@(\S+):\s*(.+)$/);
        if (match?.[1] && match[2]) payload.notes?.push({ agent: match[1], text: match[2] });
      }
    }
    if (heading === "decisions") {
      for (const line of lines) {
        const match = line.match(/^-?\s*@(\S+):\s*(.+?)(?:\s+\(risk:\s*(.+)\))?$/i);
        if (match?.[1] && match[2]) {
          payload.decisions?.push({ agent: match[1], text: match[2], ...(match[3] ? { risk: match[3] } : {}) });
        }
      }
    }
    if (heading === "handoffs") {
      for (const line of lines) {
        const match = line.match(/^-?\s*(\S+)\s*->\s*(\S+):\s*(.+?)\s+\|\s*risk:\s*(.+)$/i);
        if (match?.[1] && match?.[2] && match?.[3] && match?.[4]) {
          payload.handoffs?.push({
            fromAgentId: match[1],
            toAgentId: match[2],
            decision: match[3],
            risk: match[4]
          });
        }
      }
    }
    if (heading === "outputs") {
      for (const line of lines) {
        const match = line.match(/^-?\s*(.+?):\s*(missing|partial|complete|not-applicable)(?:\s+\|\s*(.+))?$/i);
        if (match?.[1] && match?.[2]) {
          payload.outputs?.push({
            name: match[1].trim(),
            status: match[2].toLowerCase() as "missing" | "partial" | "complete" | "not-applicable",
            ...(match[3] ? { evidence: match[3].trim() } : {})
          });
        }
      }
    }
    if (heading === "options") {
      if (lines.some((line) => /render:\s*true/i.test(line))) payload.render = true;
      if (lines.some((line) => /close:\s*true/i.test(line))) payload.close = true;
    }
  }
  return payload;
}

export function parseCheckpointFile(filePath: string): SessionCheckpointPayload {
  const content = readFileSync(filePath, "utf8");
  const ext = extname(filePath).toLowerCase();
  if (ext === ".json") {
    const parsed = JSON.parse(content) as SessionCheckpointPayload;
    if (!parsed || typeof parsed !== "object") throw new Error("Checkpoint JSON must be an object.");
    return parsed;
  }
  if (ext === ".md" || ext === ".markdown") return parseCheckpointMarkdown(content);
  throw new Error("Checkpoint file must be .json or .md");
}

export function applySessionCheckpoint(cwd: string, payload: SessionCheckpointPayload): SessionCheckpointResult {
  const applied = {
    notes: 0,
    decisions: 0,
    handoffs: 0,
    corrections: 0,
    artifacts: 0,
    verifications: 0,
    outputs: 0
  };

  if (payload.start) {
    startSession(cwd, payload.start);
  }

  for (const note of payload.notes ?? []) {
    recordNote(cwd, note.agent, note.text);
    applied.notes += 1;
  }

  for (const decision of payload.decisions ?? []) {
    recordDecision(cwd, decision.agent, decision.text, decision.risk);
    applied.decisions += 1;
  }

  for (const handoff of payload.handoffs ?? []) {
    recordHandoff(cwd, handoff);
    applied.handoffs += 1;
  }

  for (const correction of payload.corrections ?? []) {
    recordCorrection(cwd, {
      scope: correction.scope ?? "session",
      text: correction.text,
      ...(correction.agent ? { agentId: correction.agent } : {})
    });
    applied.corrections += 1;
  }

  for (const artifact of payload.artifacts ?? []) {
    recordArtifact(cwd, artifact.file, artifact.note);
    applied.artifacts += 1;
  }

  for (const verification of payload.verifications ?? []) {
    recordVerification(cwd, verification.command, verification.result, verification.notes);
    applied.verifications += 1;
  }

  for (const output of payload.outputs ?? []) {
    recordRequiredOutput(cwd, output.name, output.status, output.evidence);
    applied.outputs += 1;
  }

  let rendered = false;
  if (payload.render !== false) {
    renderActiveSession(cwd);
    rendered = true;
  }

  let closed = false;
  if (payload.close) {
    const status = payload.close === true ? "complete" : payload.close;
    closeSession(cwd, status);
    closed = true;
  }

  const sessionId = getActiveSessionId(cwd);
  return {
    sessionId,
    sessionPath: `.agent-kit/council-sessions/${sessionId}`,
    applied,
    rendered,
    closed
  };
}

export function checkpointSessionFromFile(cwd: string, filePath: string): SessionCheckpointResult {
  const absolute = join(cwd, filePath);
  if (!existsSync(absolute)) throw new Error(`Checkpoint file not found: ${filePath}`);
  return applySessionCheckpoint(cwd, parseCheckpointFile(absolute));
}
