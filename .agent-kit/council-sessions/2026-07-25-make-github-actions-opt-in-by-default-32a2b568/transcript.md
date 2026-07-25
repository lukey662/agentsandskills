# Transcript: Make GitHub Actions opt-in by default

Generated from `.agent-kit/council-sessions/2026-07-25-make-github-actions-opt-in-by-default-32a2b568/events.jsonl`.

## planner

- 2026-07-25T01:53:21.281Z `session_started`: Started core-change session: Make GitHub Actions opt-in by default
- 2026-07-25T02:02:49.785Z `handoff`: Treat hosted Actions as optional infrastructure and preserve local gates.

## lead-architect

- 2026-07-25T02:02:49.917Z `handoff`: Use an opt-in managed workflow with legacy upgrade handling.
- 2026-07-25T02:04:54.165Z `agent_decision`: Fresh installs keep GitHub Actions off; explicit opt-in installs a guarded advisory workflow; local verification remains authoritative; existing workflows are never silently deleted.

## security-reviewer

- 2026-07-25T02:02:50.041Z `handoff`: Approve after immutable action pins, exact scoped CLI version, no project lifecycle scripts, and off/advisory-only modes.

## qa-engineer

- 2026-07-25T02:02:50.166Z `handoff`: Focused tests and the full local release gate pass.

## docs-maintainer

- 2026-07-25T02:02:50.293Z `handoff`: Living docs and generated examples now define local-first verification and optional hosted CI.

## session

- 2026-07-25T02:02:50.419Z `verification_recorded`: npx vitest run tests/ide-activate.test.ts tests/update.test.ts tests/public-readiness.test.ts
- 2026-07-25T02:02:50.543Z `verification_recorded`: node scripts/refresh-examples.mjs
- 2026-07-25T02:02:50.668Z `verification_recorded`: npm run release:check
- 2026-07-25T02:02:50.815Z `required_output_updated`: architecture decision: complete
- 2026-07-25T02:02:50.938Z `required_output_updated`: maturity evidence: complete
- 2026-07-25T02:02:51.066Z `required_output_updated`: security review: complete
- 2026-07-25T02:02:51.192Z `required_output_updated`: test evidence: complete
- 2026-07-25T02:02:51.319Z `required_output_updated`: doc updates: complete
- 2026-07-25T02:02:51.446Z `required_output_updated`: upgrade evidence when applicable: complete
- 2026-07-25T02:02:51.577Z `required_output_updated`: release or rollback notes: complete
