# Skills

Use these reusable skills when building or reviewing this project.

## Next.js App Router Architecture

Use for routing, Server Components, Client Components, Server Actions, Route Handlers, data fetching, caching, revalidation, metadata, and protected app layouts.

Required checks:
- Server/client boundary is explicit.
- Secrets never enter client bundles.
- Data loading preserves auth context.
- Loading, error, and empty states are handled.
- Caching and revalidation cannot leak user-specific data.

## Supabase Auth, SSR, And RLS

Use for Supabase Auth, SSR clients, middleware, sessions, Row Level Security, Storage policies, and service-role usage.

Required checks:
- RLS protects every user-owned or tenant-owned table.
- UI checks are not treated as authorization.
- Service-role keys are server-only.
- Auth redirects and session refreshes are tested.
- IDOR is prevented at the SQL policy boundary.

## Postgres Migrations And Schema

Use for schema changes, constraints, indexes, SQL functions, triggers, seed data, and rollback planning.

Required checks:
- Migrations are ordered and reversible where practical.
- Constraints protect integrity.
- Indexes support expected access patterns.
- Data migrations have failure and retry guidance.

## OWASP Security Review

Use for every auth change, API route, Server Action, data mutation, external call, file upload, or dependency addition.

Required checks:
- Injection, broken auth, IDOR, SSRF, insecure configuration, vulnerable dependencies, and unsafe deserialization are considered.
- Inputs are validated and outputs are safely rendered.
- Errors are explicit but do not leak secrets.

## Frontend Design System

Use for every user-facing screen and component.

Required checks:
- Interface is domain-specific and task-first.
- Design tokens and component patterns are consistent.
- Avoid generic AI-site defaults.
- Loading, empty, error, disabled, success, and mobile states are designed.
- Use the matching `.agent-kit/design-briefs/*` brief for SaaS, admin, marketplace, content, or tool surfaces.
- Review final desktop and mobile screenshots with `.agent-kit/prompts/screenshot-review.md`.

## Accessibility WCAG 2.1 AA

Use for forms, navigation, modals, menus, tables, dashboards, and any custom interaction.

Required checks:
- Semantic HTML is preferred.
- ARIA is used only when needed.
- Keyboard navigation and focus states work.
- Color contrast meets WCAG 2.1 AA.

## Testing And QA

Use for unit, integration, regression, and Playwright smoke coverage.

Required checks:
- Core logic has unit tests.
- Preserved behavior has regression tests.
- Critical paths have smoke tests.
- Auth and data mutation paths are prioritized.

## Documentation Maintenance

Use after every significant change.

Required checks:
- `SPEC.md` reflects current behavior.
- `DECISIONS.md` records important tradeoffs.
- `DOCS.md` explains workflows and integration points.
- `STYLE_GUIDE.md`, `SECURITY.md`, `TESTING.md`, and `DEPLOYMENT.md` stay current.

## Compatibility Profiles

Use `.agent-kit/profiles/*` before feature planning when the project is a SaaS, marketplace, admin app, or content app.

Required checks:
- The project type's auth, data, design, testing, and handoff risks are named.
- Agent ownership matches the profile.
- Missing profile assumptions are recorded in `DECISIONS.md`.
