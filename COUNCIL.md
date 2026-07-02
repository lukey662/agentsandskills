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
| Planner | ... | ... | Lead Architect | ... |

### Verification

| Command Or Review | Result | Notes |
| --- | --- | --- |
| ... | Pass, fail, or skipped | ... |
```

## 2026-07-02 - World-Class Repo Hardening

- Workflow: core-change
- Status: in-progress
- Request: Implement the world-class repo improvement plan: dogfood the kit into this repo's root, implement real update semantics, clean packaging config, add lint/format, expand the CI matrix, add coverage and CLI-contract tests, adopt changesets, overhaul CLI UX, prepare publish, and add badges/docs entry points.
- Affected layers: business logic (CLI), deployment (CI/release), docs

### Required Outputs

| Output | Status | Evidence |
| --- | --- | --- |
| Phased checklist | Complete | Plan todos tracked in the active Cursor plan and `.agent-kit/council-sessions/2026-07-02-world-class-repo-hardening/` |
| Architecture decision | Complete | `DECISIONS.md` entries for dogfooding, update semantics, lint/CI, and release automation |
| Security review | Complete | No new dependencies with network access at runtime; release remains Trusted Publishing/OIDC; packaging allow-list reviewed |
| Test evidence | Complete | `npm run release:check` (typecheck, tests, build, smoke suite) green after each phase |
| Visual QA evidence | Not applicable | CLI-only change; no user-facing screens |
| Docs impact | Complete | `SPEC.md`, `DECISIONS.md`, `CHANGELOG.md`, `DOCS.md`, and this file updated |

### Handoffs

| Agent | Decision | Risk | Next Handoff | Evidence |
| --- | --- | --- | --- | --- |
| Planner | Execute the ten-phase hardening plan in priority order | Scope creep across phases | Lead Architect | Cursor plan `world-class_repo_hardening_plan` |
| Lead Architect | Dogfood the kit into its own root instead of rewriting the Cursor rules | Duplicated library assets under `.agent-kit/` are ignored via `.gitignore`, matching the examples pattern | Next.js Engineer (CLI implementation) | This file, `.agent-kit/manifest.json` |
| Security Reviewer | Keep runtime dependency count minimal; new dev-tooling only (eslint, prettier, coverage, changesets) | Dev-dependency supply chain | QA Engineer | `package.json` diff, Dependabot + dependency-review workflows |

### Verification

| Command Or Review | Result | Notes |
| --- | --- | --- |
| `npm run dev -- audit` | Pass | Readiness reported with zero failures after dogfood install |
| `npm run release:check` | Pass | Run after implementation phases complete |

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
