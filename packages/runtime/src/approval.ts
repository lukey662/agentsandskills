import { createHash } from "node:crypto";
import { interrupt } from "@langchain/langgraph";
import { z } from "zod";
import type { FileRunEventStore } from "./events.js";
import type { ApprovalDecision, ApprovalRequest, ApprovalRisk } from "./types.js";

const ResumeDecisionContract = z
  .object({
    approvalId: z.string().min(1),
    decision: z.enum(["approve", "reject"]),
    actor: z.string().min(1).optional(),
    note: z.string().max(2_000).optional()
  })
  .strict();

export class ApprovalRejectedError extends Error {
  constructor(
    readonly risk: ApprovalRisk,
    message: string
  ) {
    super(message);
    this.name = "ApprovalRejectedError";
  }
}

export function approvalId(runId: string, gate: string): string {
  return `approval-${createHash("sha256").update(`${runId}\0${gate}`).digest("hex").slice(0, 20)}`;
}

export function requestGraphApproval(
  events: FileRunEventStore,
  input: { runId: string; gate: string; risk: ApprovalRisk; title: string; detail: string }
): ApprovalDecision {
  const request: ApprovalRequest = {
    approvalId: approvalId(input.runId, input.gate),
    runId: input.runId,
    risk: input.risk,
    title: input.title,
    detail: input.detail,
    requestedAt: new Date().toISOString()
  };
  const record = events.read(input.runId);
  if (record.pendingApproval && record.pendingApproval.approvalId !== request.approvalId) {
    throw new Error(`Run already has a different pending approval: ${record.pendingApproval.approvalId}`);
  }
  if (!record.pendingApproval) {
    events.update(input.runId, { pendingApproval: request, status: "awaiting-approval" });
    events.append(input.runId, { type: "approval_requested", status: "awaiting-approval", approval: request, text: input.title });
  }
  const resumed = ResumeDecisionContract.parse(interrupt<ApprovalRequest, unknown>(record.pendingApproval ?? request));
  if (resumed.approvalId !== request.approvalId) throw new Error(`Approval response does not match the pending gate: ${request.approvalId}`);
  const decision: ApprovalDecision = {
    approvalId: resumed.approvalId,
    decision: resumed.decision,
    decidedAt: new Date().toISOString(),
    ...(resumed.actor ? { actor: resumed.actor } : {}),
    ...(resumed.note ? { note: resumed.note } : {})
  };
  if (!events.events(input.runId).some((event) => event.type === "approval_decided" && event.approval?.approvalId === decision.approvalId)) {
    events.append(input.runId, { type: "approval_decided", approval: decision, text: `${input.title}: ${decision.decision}` });
  }
  events.update(input.runId, { pendingApproval: undefined, status: decision.decision === "approve" ? "running" : "cancelled" });
  if (decision.decision === "reject") throw new ApprovalRejectedError(input.risk, `Approval rejected: ${input.title}`);
  return decision;
}
