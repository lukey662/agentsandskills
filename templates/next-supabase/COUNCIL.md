# Council Sessions

Use this file to record agent council evidence for meaningful planning, core-change, frontend-change, security-review, release, or research work.

The machine-readable roster lives at `.agent-kit/agent-roster.json`. Model profile routing lives at `.agent-kit/model-routing.json`. Project-specific context lives in `.agent-kit/project-context.json` and `.agent-kit/project-context.md`. Durable corrections live in `.agent-kit/corrections/`. Schemas live in `.agent-kit/schemas/`. For structured Agent Studio records, write session metadata to `.agent-kit/council-sessions/<session-id>/session.json`, append visible events to `events.jsonl`, and render `index.md` plus `transcript.md`. Run `agent-kit studio export` when a self-contained local HTML view is useful for inspecting sessions. Legacy structured session JSON files should follow `.agent-kit/schemas/council-session.schema.json`. Machine-readable audit output follows `.agent-kit/schemas/audit-report.schema.json`.

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
- Meaningful multi-agent work should use `agent-kit session start`, `decision`, `handoff`, `correct`, `artifact`, `verify`, `output`, and `render` when the CLI is available.
- Static Studio export is optional, but exported HTML must be regenerated after session evidence changes and must not contain secrets.
- Structured session JSON records must pass `agent-kit audit`.
- Agent Studio `events.jsonl` rows must stay append-only, valid JSONL, and free of secrets.
- Required outputs must be explicitly marked `complete`, `not-applicable`, `missing`, or `partial`; do not close a session as complete while any required output is still missing or partial.
- Core changes must include Lead Architect evidence.
- Auth, data mutation, dependency, external-call, secret, and release-risk work must include Security Reviewer evidence.
- User-facing frontend work must include Frontend Design Lead, reference-set evidence, design critique verdict, creative direction, accessibility, and visual QA evidence.
- Public-facing or conversion-facing copy work must include Marketing Copy Lead evidence, discovery questions, value proposition, proof, objections, voice/tone, and CTA hierarchy.
- Behavior changes must include QA evidence or a documented test gap.
- Human corrections must be recorded before continuing work and promoted into durable project or agent rules when they should affect future sessions.
