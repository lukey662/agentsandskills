import { z } from "zod";

const stringList = z.array(z.string());

export const AgentRosterContract = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().min(1),
    stack: z.string().min(1),
    required: z.boolean(),
    defaultWorkflow: z.string().min(1),
    principle: z.string().optional(),
    agents: z
      .array(
        z
          .object({
            id: z.string().min(1),
            name: z.string().optional(),
            file: z.string().optional(),
            defaultFor: stringList.optional(),
            skills: z.array(z.string()).min(1),
            handsOffTo: stringList.optional()
          })
          .strict()
      )
      .min(1),
    workflows: z
      .array(
        z
          .object({
            id: z.string().min(1),
            triggers: stringList.optional(),
            sequence: z.array(z.string()).min(1),
            council: stringList,
            requiredOutputs: stringList
          })
          .strict()
      )
      .min(1),
    handoffRules: z.array(z.string()).min(1)
  })
  .strict();

export const CouncilSessionContract = z
  .object({
    schemaVersion: z.literal(1),
    sessionId: z.string().min(1),
    createdAt: z.string().datetime(),
    workflowId: z.string().min(1),
    status: z.enum(["planned", "in-progress", "blocked", "complete"]),
    request: z.string().min(1),
    affectedLayers: stringList.optional(),
    handoffs: z
      .array(
        z
          .object({
            agentId: z.string().min(1),
            decision: z.string().min(1),
            risk: z.string().min(1),
            nextHandoff: z.string().min(1),
            evidence: stringList.optional()
          })
          .strict()
      )
      .min(1),
    requiredOutputs: z.array(
      z
        .object({
          name: z.string().min(1),
          status: z.enum(["missing", "partial", "complete", "not-applicable"]),
          evidence: z.string().optional()
        })
        .strict()
    ),
    verification: z.array(
      z
        .object({
          command: z.string().min(1),
          result: z.enum(["pass", "fail", "skipped"]),
          notes: z.string().optional()
        })
        .strict()
    )
  })
  .strict();

export const AuditReportContract = z
  .object({
    summary: z
      .object({
        pass: z.number().int().min(0),
        warn: z.number().int().min(0),
        fail: z.number().int().min(0)
      })
      .strict(),
    readiness: z
      .object({
        level: z.enum(["needs-setup", "baseline-setup", "needs-improvement", "best-practice-candidate"]),
        summary: z.string().min(1),
        nextActions: z.array(z.string())
      })
      .strict(),
    findings: z.array(
      z
        .object({
          level: z.enum(["pass", "warn", "fail"]),
          area: z.string().min(1),
          message: z.string().min(1),
          remediation: z.string().min(1).optional()
        })
        .strict()
    )
  })
  .strict();

export const ModelRoutingContract = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().min(1),
    stack: z.string().min(1),
    reviewedAt: z.string().min(1),
    reviewCadence: z.string().min(1),
    principle: z.string().min(1),
    profiles: z
      .array(
        z
          .object({
            id: z.string().min(1),
            label: z.string().min(1),
            intent: z.string().min(1),
            reasoningEffort: z.enum(["low", "medium", "high", "varies"]),
            contextWindow: z.enum(["small", "medium", "large", "very-large", "varies"]),
            latency: z.enum(["low", "medium", "high", "varies"]),
            cost: z.enum(["low", "medium", "high", "varies"]),
            preferredFor: z.array(z.string()).min(1)
          })
          .strict()
      )
      .min(1),
    agentRoutes: z
      .array(
        z
          .object({
            agentId: z.string().min(1),
            profileId: z.string().min(1),
            defaultEffort: z.enum(["low", "medium", "high"]),
            escalationProfileId: z.string().optional(),
            notes: z.string().optional()
          })
          .strict()
      )
      .min(1),
    toolSurfaces: z
      .array(
        z
          .object({
            tool: z.string().min(1),
            instructionSurface: z.string().min(1),
            modelSelection: z.string().min(1),
            enforcement: z.enum(["enforced", "partial", "advisory", "manual"]),
            adapter: z.string().min(1)
          })
          .strict()
      )
      .min(1),
    updatePolicy: z.array(z.string()).min(1)
  })
  .strict();

export type AgentRosterContractValue = z.infer<typeof AgentRosterContract>;
export type CouncilSessionContractValue = z.infer<typeof CouncilSessionContract>;
export type AuditReportContractValue = z.infer<typeof AuditReportContract>;
export type ModelRoutingContractValue = z.infer<typeof ModelRoutingContract>;

export function formatContractIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "<root>";
    return `${path}: ${issue.message}`;
  });
}
