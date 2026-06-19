# Maintainer Release Evidence

Use this checklist when shipping `@appsforgood/next-supabase-kit` releases. It aligns kit maintainer practice with the **Strong** tier in `QUALITY_GATES.md`: council sessions record workflow, decision, risk, next handoff, required outputs, and evidence.

For loop patterns and safe automation limits, see [LOOP_CODING.md](LOOP_CODING.md). For publish steps, see [PUBLISH.md](PUBLISH.md).

## When To Open A Session

Start `agent-kit session` (or a `COUNCIL.md` entry) when the release includes any of:

- CLI or install behavior changes
- New or changed IDE adapter surfaces (Cursor, Codex, Claude, Copilot, Antigravity)
- Audit, roster, schema, or Agent Studio contract changes
- Security-sensitive dependency or publish pipeline changes
- Multi-agent work spanning Planner → Architect → QA

Skip a formal session only for typo-only doc fixes with no behavioral impact.

## Bootstrap Maintainer Dogfood

Maintainers run the kit locally on BaseRepo without committing the overlay:

```bash
npm run dogfood:init
node dist/index.js adapter validate cursor
node dist/index.js adapter validate codex
```

Generated paths (`.agent-kit/`, `.cursor/`, `.codex/`, root council docs from init) are **gitignored**. Kit source stays in `templates/`, `assistant-adapters/`, and tracked root docs such as `DOCS.md` and `SPEC.md`.

## Release Session Workflow

```bash
agent-kit session start --workflow release --request "Release vX.Y.Z"
agent-kit session decision --agent planner --decision "..." --risk "..." --next "lead-architect" --evidence "..."
agent-kit session verify --command "npm run release:check" --result pass --notes "..."
agent-kit session verify --command "npm run smoke:audit-gate" --result pass
agent-kit session output changelog --status complete --evidence "CHANGELOG.md#X.Y.Z"
agent-kit session output test-evidence --status complete --evidence "vitest + smokes green"
agent-kit session output publish-evidence --status complete --evidence "npm run publish:verify or GitHub Release vX.Y.Z"
agent-kit session render
```

After publish, append a short evidence block to [DOGFOOD.md](DOGFOOD.md) (public-safe, no local paths).

## COUNCIL.md Mirror Template

When Agent Studio CLI is unavailable, paste this block into root `COUNCIL.md` (maintainer overlay, gitignored) or into the PR description:

```md
## YYYY-MM-DD - Release vX.Y.Z

- Workflow: release
- Status: complete
- Request: Ship @appsforgood/next-supabase-kit@X.Y.Z
- Affected layers: CLI, install, adapters, docs, CI, deployment

### Required Outputs

| Output | Status | Evidence |
| --- | --- | --- |
| Phased checklist | Complete | ROADMAP / PR scope |
| Architecture decision | Complete/N/A | DECISIONS.md or PR note |
| Security review | Complete | Dependency audit in release:check; no secret in adapters |
| Test evidence | Complete | npm run release:check; npm run smoke:audit-gate |
| Adapter validation | Complete | npm run adapter:validate (all IDE templates) |
| Docs impact | Complete | CHANGELOG.md, DOCS.md, PUBLISH.md if process changed |
| Publish verification | Complete | npm run publish:verify or Release workflow green |

### Handoffs

| Agent | Decision | Risk | Next Handoff | Evidence |
| --- | --- | --- | --- | --- |
| Planner | Release scope approved | Missed breaking change | Lead Architect / QA | PR + CHANGELOG |
| QA Engineer | release:check green | Residual flake | Documentation Maintainer | CI logs |
| Documentation Maintainer | CHANGELOG + DOGFOOD updated | Stale public evidence | Deployment/Observability | DOGFOOD.md entry |

### Verification

| Command Or Review | Result | Notes |
| --- | --- | --- |
| npm run release:check | Pass | Includes adapter:validate |
| npm run smoke:audit-gate | Pass | baseline-setup, 0 failures |
| npm run publish:verify | Pass/Skipped | Required after registry publish |
```

## Pre-Merge Gate (BaseRepo)

Every release PR must pass:

1. `npm run release:check` (tests, build, package validate, smokes, **adapter validate all**, audit, pack dry-run)
2. `npm run smoke:audit-gate`
3. CHANGELOG section for the target version
4. Session render or COUNCIL mirror with verification table filled in

## Post-Publish

1. Run `npm run publish:verify` after registry propagation (or confirm Release workflow verification).
2. Update `DOGFOOD.md` with publish verification snapshot (no machine paths).
3. Mark release items in `ROADMAP.md`.
