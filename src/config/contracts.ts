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

const projectEvidenceItem = z
  .object({
    source: z.string().min(1),
    note: z.string().min(1)
  })
  .strict();

export const ProjectContextContract = z
  .object({
    schemaVersion: z.literal(1),
    projectName: z.string(),
    productSummary: z.string(),
    productCategory: z.string(),
    primaryAudience: z.string(),
    primaryWorkflows: z.array(z.string()),
    businessCriticalBehavior: z.array(z.string()),
    architecture: z
      .object({
        packageManager: z.string().optional(),
        scripts: z.array(z.string()),
        frameworks: z.array(z.string()),
        uiLibraries: z.array(z.string()),
        hasSupabase: z.boolean(),
        supabaseSignals: z.array(z.string()),
        testTools: z.array(z.string()),
        envExampleKeys: z.array(z.string()),
        deployment: z.array(z.string())
      })
      .strict(),
    dataSensitivity: z.array(z.string()),
    authModel: z.string(),
    tenantModel: z.string(),
    integrations: z.array(z.string()),
    uiDirection: z
      .object({
        preferred: z.string(),
        avoid: z.string()
      })
      .strict(),
    messaging: z
      .object({
        valueProposition: z.string(),
        proof: z.array(z.string()),
        objections: z.array(z.string())
      })
      .strict(),
    qualityTarget: z.enum(["baseline-setup", "needs-improvement", "best-practice-candidate"]),
    knownConstraints: z.array(z.string()),
    openQuestions: z.array(z.string()),
    evidence: z.array(projectEvidenceItem),
    lastReviewedAt: z.string().datetime(),
    owners: z.array(z.string())
  })
  .strict();

export const CorrectionRuleContract = z
  .object({
    id: z.string().min(1),
    scope: z.enum(["session", "project", "agent", "upstream-proposal"]),
    status: z.enum(["active", "retired", "proposed"]),
    text: z.string().min(1),
    appliesToAgents: z.array(z.string()).optional(),
    agentId: z.string().min(1).optional(),
    sourceSessionId: z.string().min(1).optional(),
    createdAt: z.string().datetime(),
    reviewedAt: z.string().datetime().nullable().optional(),
    retiredAt: z.string().datetime().optional(),
    reason: z.string().optional()
  })
  .strict()
  .superRefine((rule, context) => {
    if (rule.scope === "agent" && !rule.agentId && (!rule.appliesToAgents || rule.appliesToAgents.length === 0)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "agent-scoped corrections require agentId or appliesToAgents",
        path: ["agentId"]
      });
    }
  });

export const CorrectionRulesContract = z
  .object({
    schemaVersion: z.literal(1),
    rules: z.array(CorrectionRuleContract)
  })
  .strict();

export const StudioSessionContract = z
  .object({
    schemaVersion: z.literal(1),
    sessionId: z.string().min(1),
    title: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    status: z.enum(["planned", "in-progress", "blocked", "complete"]),
    workflowId: z.string().min(1),
    request: z.string().min(1),
    affectedLayers: z.array(z.string()),
    activeAgentId: z.string().optional(),
    nextAgentId: z.string().optional(),
    qualityTarget: z.enum(["baseline-setup", "needs-improvement", "best-practice-candidate"]),
    requiredOutputs: z.array(
      z
        .object({
          name: z.string().min(1),
          status: z.enum(["missing", "partial", "complete", "not-applicable"]),
          evidence: z.string().optional()
        })
        .strict()
    ),
    renderedAt: z.string().datetime().optional()
  })
  .strict();

export const SessionEventContract = z
  .object({
    type: z.enum([
      "session_started",
      "project_context_loaded",
      "agent_message",
      "agent_decision",
      "handoff",
      "human_correction",
      "correction_promoted",
      "artifact_recorded",
      "command_recorded",
      "verification_recorded",
      "open_question",
      "session_status_changed",
      "session_rendered"
    ]),
    createdAt: z.string().datetime(),
    agentId: z.string().min(1).optional(),
    fromAgentId: z.string().min(1).optional(),
    toAgentId: z.string().min(1).optional(),
    text: z.string().optional(),
    decision: z.string().optional(),
    risk: z.string().optional(),
    evidence: z.array(z.string()).optional(),
    scope: z.enum(["session", "project", "agent", "upstream-proposal"]).optional(),
    correctionId: z.string().min(1).optional(),
    artifactPath: z.string().min(1).optional(),
    command: z.string().min(1).optional(),
    result: z.enum(["pass", "fail", "skipped"]).optional(),
    status: z.enum(["planned", "in-progress", "blocked", "complete"]).optional(),
    notes: z.string().optional()
  })
  .strict()
  .superRefine((event, context) => {
    if (event.type === "handoff") {
      for (const field of ["fromAgentId", "toAgentId", "decision", "risk"] as const) {
        if (!event[field]) {
          context.addIssue({ code: z.ZodIssueCode.custom, message: `${field} is required for handoff events`, path: [field] });
        }
      }
    }
    if (event.type === "human_correction" && (!event.text || !event.scope)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "human corrections require text and scope", path: ["text"] });
    }
    if (event.type === "verification_recorded" && (!event.command || !event.result)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "verification events require command and result", path: ["command"] });
    }
    if (event.type === "artifact_recorded" && !event.artifactPath) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "artifact events require artifactPath", path: ["artifactPath"] });
    }
  });

export type AgentRosterContractValue = z.infer<typeof AgentRosterContract>;
export type CouncilSessionContractValue = z.infer<typeof CouncilSessionContract>;
export type AuditReportContractValue = z.infer<typeof AuditReportContract>;
export type ModelRoutingContractValue = z.infer<typeof ModelRoutingContract>;
export type ProjectContextContractValue = z.infer<typeof ProjectContextContract>;
export type CorrectionRuleContractValue = z.infer<typeof CorrectionRuleContract>;
export type CorrectionRulesContractValue = z.infer<typeof CorrectionRulesContract>;
export type StudioSessionContractValue = z.infer<typeof StudioSessionContract>;
export type SessionEventContractValue = z.infer<typeof SessionEventContract>;

export function formatContractIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "<root>";
    return `${path}: ${issue.message}`;
  });
}
