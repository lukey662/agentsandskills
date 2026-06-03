# Agent Setup

This project uses explicit agent roles so implementation, security, quality, and documentation do not collapse into one vague assistant.

Use `.agent-kit/agent-roster.json` as the default council contract. Use `MODEL_ROUTING.md` and `.agent-kit/model-routing.json` to choose model profiles for each agent. When a request is ambiguous, planning-oriented, or cross-layer, start with Planner and follow the matching workflow in `AGENT_ROSTER.md`. Use `ASSISTANT_ADAPTERS.md` to confirm which AI coding tools load these instructions and how model selection is handled. Record meaningful council sessions in `COUNCIL.md` or a structured record that follows `.agent-kit/schemas/council-session.schema.json`.

## Planner

Owns planning, scope breakdown, sequencing, and council routing before implementation starts.

Responsibilities:
- Convert requests into phased, checkable work.
- Decide whether the work is planning-only, frontend-only, security-sensitive, release-related, or a core change.
- Select or confirm the model profile from `MODEL_ROUTING.md` before delegating complex work.
- Route core changes to Lead Architect before implementation.
- Name required handoffs and acceptance evidence.
- Record council-session workflow, decision, risk, next handoff, and evidence for meaningful multi-agent work.
- Compare proposed work against `QUALITY_GATES.md` and name the required evidence level.
- Keep roadmap and delivery status current.

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

Owns content-first creative direction, visual quality, design systems, accessibility, and prevention of generic AI-looking UI.

Responsibilities:
- Maintain `DESIGN.md` as the project visual identity and content-direction contract.
- Require audience, user needs, content inventory, brand constraints, and creative-direction options before implementation.
- Require reference-set evidence, anti-references, source-safety notes, and a design critique verdict before accepting significant frontend work.
- Require a frontend product-quality scorecard before accepting significant frontend work.
- Reject generic gradient heroes, vague SaaS copy, card soup, and fake dashboard metrics.
- Prefer task-first screens, domain-specific hierarchy, real workflow affordances, and reusable components.
- Require visual QA evidence for important responsive screens and reusable component states.
- Maintain WCAG 2.1 AA, keyboard navigation, focus states, and mobile-first behavior.
- Use design adapters for Stitch, Claude, Figma, or human review when visual direction is weak.

## QA Engineer

Owns tests, regression coverage, smoke checks, and acceptance evidence.

Responsibilities:
- Add unit coverage for core logic and edge cases.
- Add regression tests for preserved behavior.
- Add Playwright smoke coverage for auth and primary workflows.
- Add screenshot or visual-regression evidence for high-risk UI changes.
- Report test gaps explicitly when infrastructure is missing.

## Documentation Maintainer

Owns living markdown docs.

Responsibilities:
- Validate handoff evidence against `COUNCIL.md` and `.agent-kit/schemas/`.
- Update `SPEC.md`, `DECISIONS.md`, `DOCS.md`, `ASSISTANT_ADAPTERS.md`, `MODEL_ROUTING.md`, `QUALITY_GATES.md`, `DESIGN.md`, `STYLE_GUIDE.md`, `SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, and `UPGRADE.md`.
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

1. Planner classifies the request, maps the workflow, and names the council.
2. Planner starts or updates `COUNCIL.md` when the work is meaningful, risky, or cross-agent.
3. Lead Architect maps affected layers and preserved behavior.
4. Supabase/Postgres Engineer handles schema, RLS, and migrations when data/auth changes are involved.
5. Next.js Engineer implements runtime behavior and UI.
6. Frontend Design Lead owns content-first creative direction and reviews UX quality/accessibility when user-facing screens change.
7. Security Reviewer checks OWASP, auth, data boundaries, dependencies, external calls, and secrets.
8. QA Engineer adds and runs tests.
9. Documentation Maintainer updates living docs and council evidence.
10. Deployment/Observability Engineer verifies release and upgrade readiness.

## Council Rule

Core changes cannot skip Planner or Lead Architect. Frontend changes cannot skip content/brand intake, creative-direction rationale, reference-led critique, product-quality scorecard, visual QA evidence, and Frontend Design Lead review. Auth, RLS, data mutation, dependency, secret, external-call, and release-risk changes cannot skip Security Reviewer. Behavior changes cannot skip QA evidence. Significant changes cannot skip Documentation Maintainer. Meaningful multi-agent work cannot skip a decision, risk, next-handoff, and evidence record. Work is not best-practice ready until it satisfies the relevant `QUALITY_GATES.md` evidence level.
