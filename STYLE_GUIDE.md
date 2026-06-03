# Style Guide

## Code Style

- Use TypeScript with explicit command and service boundaries.
- Keep CLI handlers thin; put reusable behavior in dedicated modules under `src/`.
- Prefer structured parsing and validation over ad hoc string handling.
- Preserve existing file and command names unless a compatibility break is intentional and documented.

## Markdown Style

- Use clear headings and concise prose.
- Keep operational docs current with release, research, and dogfood evidence.
- Record architectural decisions in `DECISIONS.md` with context, decision, and consequences.
- Keep `ROADMAP.md` as the source of truth for phase status and next actions.

## Release Workflow Style

- Release workflows must be deterministic and credential-minimal.
- Publish steps must use npm Trusted Publishing, not bypass-2FA publish tokens.
- Private install verification may use a read-only npm token and must fail closed or skip explicitly when the token is absent.
- Dry runs must execute quality gates without requiring npm package credentials.

## Upgrade Workflow Style

- Treat package, framework, Supabase, assistant-adapter, and template updates as reviewable changes.
- Run diff before update when project-owned files may change.
- Preserve local decisions with `.agent-kit/overrides.json`.
- Record version changes, migration impact, rollback process, owner, date, and verification evidence in `UPGRADE.md`.
- Do not claim best-practice readiness when upgrade placeholders remain.

## Agent Council Style

- Planning requests start with Planner.
- Core changes route through Lead Architect before implementation.
- Agent-to-skill mappings live in `.agent-kit/agent-roster.json` and must stay machine-readable.
- Handoffs should name decision, risk, next owner, and required verification evidence.
- Audit failures for missing council routing are treated as setup failures, not optional style drift.

## Front-End Guidance For Installed Projects

Installed project docs should push teams away from generic AI-looking interfaces. Prefer product-specific layouts, explicit component states, accessible interactions, real content structure, reference-led critique, frontend distinctiveness benchmarking, and design briefs tailored to SaaS, admin, marketplace, content, or tool workflows.

Significant frontend work should record references, anti-references, source-safety notes, a distinctiveness verdict, first-screen proof, content fingerprint, asset provenance, state proof, visual QA proof, and a frontend product-quality scorecard in `DESIGN.md` before it is accepted as best-practice ready. The scorecard should reject work with critical zeroes or a total below `10/14`; reserve best-practice claims for `12/14` or higher plus a passing distinctiveness benchmark, desktop/mobile review, and visual QA evidence.
