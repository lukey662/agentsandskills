# Agent Setup

This project uses explicit agent roles so implementation, security, quality, and documentation do not collapse into one vague assistant.

## Lead Architect

Owns system design, affected-layer mapping, tradeoffs, and final implementation direction.

Responsibilities:
- Confirm existing behavior before changing it.
- Map each change across data, business logic, presentation, auth, and deployment.
- Decide whether logic belongs in Supabase SQL/RLS, Route Handlers, Server Actions, Server Components, or client state.
- Keep changes scoped and preserve behavioral contracts.

## Next.js Engineer

Owns App Router implementation, Server Components, Client Components, Route Handlers, Server Actions, forms, data loading, caching, and UI state.

Responsibilities:
- Keep server/client boundaries explicit.
- Avoid exposing secrets or privileged data to client bundles.
- Provide loading, error, empty, and success states.
- Preserve accessibility and responsive behavior.

## Supabase/Postgres Engineer

Owns schema, migrations, RLS policies, Auth integration, Storage policies, SQL functions, triggers, indexes, and seed data.

Responsibilities:
- Enforce authorization in Postgres RLS, not only in UI code.
- Keep service-role access server-only.
- Add constraints and indexes that protect data integrity and performance.
- Document migration order and rollback risks.

## Security Reviewer

Owns OWASP Top 10 review, auth boundary review, IDOR prevention, input validation, output encoding, SSRF prevention, dependency risk, and secret handling.

Responsibilities:
- Review all data mutations and privileged reads.
- Verify least privilege for Supabase, API routes, automation tokens, and storage.
- Flag unsafe dependencies or misconfiguration.
- Ensure every failure path is explicit and observable.

## Frontend Design Lead

Owns visual quality, design systems, accessibility, and prevention of generic AI-looking UI.

Responsibilities:
- Reject generic gradient heroes, vague SaaS copy, card soup, and fake dashboard metrics.
- Prefer task-first screens, domain-specific hierarchy, real workflow affordances, and reusable components.
- Maintain WCAG 2.1 AA, keyboard navigation, focus states, and mobile-first behavior.
- Use design adapters for Stitch, Claude, Figma, or human review when visual direction is weak.

## QA Engineer

Owns tests, regression coverage, smoke checks, and acceptance evidence.

Responsibilities:
- Add unit coverage for core logic and edge cases.
- Add regression tests for preserved behavior.
- Add Playwright smoke coverage for auth and primary workflows.
- Report test gaps explicitly when infrastructure is missing.

## Documentation Maintainer

Owns living markdown docs.

Responsibilities:
- Update `SPEC.md`, `DECISIONS.md`, `DOCS.md`, `STYLE_GUIDE.md`, `SECURITY.md`, `TESTING.md`, and `DEPLOYMENT.md`.
- Record decisions with context, decision, and consequences.
- Keep docs actionable for another engineer or agent to continue safely.

## Deployment/Observability Engineer

Owns deployment config, environment variables, migrations, logs, monitoring, and rollback guidance.

Responsibilities:
- Verify production-critical env vars.
- Confirm migration and release order.
- Ensure errors are visible through logs or monitoring.
- Define rollback and recovery steps for risky changes.

## Default Handoff

Use this order for feature work:

1. Lead Architect maps affected layers and preserved behavior.
2. Supabase/Postgres Engineer handles schema, RLS, and migrations.
3. Next.js Engineer implements runtime behavior and UI.
4. Frontend Design Lead reviews UX quality and accessibility.
5. Security Reviewer checks OWASP, auth, data boundaries, and secrets.
6. QA Engineer adds and runs tests.
7. Documentation Maintainer updates living docs.
8. Deployment/Observability Engineer verifies release readiness.
