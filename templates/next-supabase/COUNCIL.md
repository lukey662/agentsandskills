# Council Sessions

Use this file to record agent council evidence for meaningful planning, core-change, frontend-change, security-review, release, or research work.

The machine-readable roster lives at `.agent-kit/agent-roster.json`. Model profile routing lives at `.agent-kit/model-routing.json`. Schemas live in `.agent-kit/schemas/`. For structured session records, write JSON files under `.agent-kit/council-sessions/` and follow `.agent-kit/schemas/council-session.schema.json`. Machine-readable audit output follows `.agent-kit/schemas/audit-report.schema.json`.

## Session Template

```md
## YYYY-MM-DD - Short Request Name

- Workflow: planning | core-change | frontend-change | security-review | release | research
- Status: planned | in-progress | blocked | complete
- Request: What the user asked for
- Affected layers: data, business logic, presentation, auth, deployment, docs

### Required Outputs

| Output | Status | Evidence |
| --- | --- | --- |
| Phased checklist | Missing/Partial/Complete/N/A | Link or note |
| Architecture decision | Missing/Partial/Complete/N/A | Link or note |
| Security review | Missing/Partial/Complete/N/A | Link or note |
| Test evidence | Missing/Partial/Complete/N/A | Command or report |
| Visual QA evidence | Missing/Partial/Complete/N/A | Screenshot, Storybook, or visual diff |
| Docs impact | Missing/Partial/Complete/N/A | Updated file |

### Handoffs

| Agent | Decision | Risk | Next Handoff | Evidence |
| --- | --- | --- | --- | --- |
| Planner | TBD | TBD | Lead Architect | TBD |

### Verification

| Command Or Review | Result | Notes |
| --- | --- | --- |
| TBD | Pass/Fail/Skipped | TBD |
```

## Rules

- Every handoff must include decision, risk, next handoff, and evidence.
- Structured session JSON records must pass `agent-kit audit`.
- Missing required outputs must be explicitly marked missing or partial.
- Core changes must include Lead Architect evidence.
- Auth, data mutation, dependency, external-call, secret, and release-risk work must include Security Reviewer evidence.
- User-facing frontend work must include Frontend Design Lead, reference-set evidence, design critique verdict, creative direction, accessibility, and visual QA evidence.
- Behavior changes must include QA evidence or a documented test gap.
