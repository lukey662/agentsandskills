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
- Publish steps must scrub inherited npm token state before `npm publish`.
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
- Public-facing and conversion-facing copy changes route through Marketing Copy Lead before implementation.
- Agent-to-skill mappings live in `.agent-kit/agent-roster.json` and must stay machine-readable.
- Handoffs should name decision, risk, next owner, and required verification evidence.
- Audit failures for missing council routing are treated as setup failures, not optional style drift.

## Agent Studio And Context Style

- Keep Agent Studio local-first: JSON/JSONL files are the machine-readable source of truth, and generated Markdown is the human-readable interface.
- Do not require SQLite, a hosted database, a background daemon, or model API credentials for baseline context, session, correction, or rendering workflows.
- Treat session event logs as append-only. Corrections add new events and status changes; they do not silently rewrite prior agent messages.
- Record visible agent outputs, decisions, handoffs, risks, artifacts, verification, and user corrections. Do not claim to expose hidden model reasoning.
- Update required-output status through `agent-kit session output` so session JSON and append-only events stay in sync.
- Store human corrections with explicit scope: `session`, `project`, `agent`, or `upstream-proposal`.
- Redact secrets, raw environment values, access tokens, database URLs, private customer data, and other sensitive data before writing context, session, correction, or Markdown files.
- Generated Markdown should be deterministic, link back to source JSON/JSONL files, and include Mermaid graphs only when they remain readable in common Markdown previewers.
- Static Studio exports must remain self-contained, use export-time redacted data, avoid external assets, and never read live files from the browser.
- Do not mark an Agent Studio item complete until automated coverage exists for its schema, CLI path, renderer or audit behavior, and relevant security edge cases.

## Messaging And Copy Style

- Keep `MESSAGING.md` current when positioning, value proposition, voice, CTAs, onboarding, empty states, pricing, or public-facing copy changes.
- Prefer product-specific nouns, customer language, proof, constraints, and clear next steps over broad SaaS claims.
- Mark unknown audience, differentiator, proof, objections, or conversion assumptions as `TBD` instead of hiding gaps behind polished copy.
- Avoid unsupported superlatives, invented proof, dark patterns, forced urgency, and risky pricing, privacy, security, compliance, performance, medical, financial, or legal claims.

## Front-End Guidance For Installed Projects

Installed project docs should push teams away from generic AI-looking interfaces. Prefer product-specific layouts, explicit component states, accessible interactions, real content structure, reference-led critique, frontend distinctiveness benchmarking, and design briefs tailored to SaaS, admin, marketplace, content, or tool workflows.

Significant frontend work should record references, anti-references, source-safety notes, a distinctiveness verdict, first-screen proof, content fingerprint, asset provenance, state proof, UI detector findings, visual QA proof, and a frontend product-quality scorecard in `DESIGN.md` before it is accepted as best-practice ready. The scorecard should reject work with critical zeroes or a total below `10/14`; reserve best-practice claims for `12/14` or higher plus a passing distinctiveness benchmark, desktop/mobile review, authenticated screen evidence when applicable, and visual QA evidence.
