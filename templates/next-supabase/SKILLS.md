# Skills

Use these reusable skills when building or reviewing this project.

## Planning And Agent Council

Use for planning requests, roadmap work, ambiguous feature requests, core architecture changes, auth/data changes, release changes, and any task that needs multiple agent roles.

Required checks:
- Planner starts planning and ambiguous requests.
- Lead Architect reviews core changes before implementation.
- Security Reviewer joins auth, data mutation, external-call, dependency, secret, and release-risk changes.
- QA Engineer verifies behavior changes before completion.
- Documentation Maintainer updates living docs when behavior, architecture, release, or standards change.

## Best-Practice Maturity Review

Use for setup audits, release readiness, roadmap checkpoints, dogfood reviews, and any claim that work is best-practice rather than merely functional.

Required checks:
- `QUALITY_GATES.md` names the target level: baseline, strong, or best-practice.
- Affected areas are mapped across council, architecture, Supabase/RLS, security, frontend, accessibility, testing, release, docs, and repo health.
- Evidence is named for each affected area.
- Missing evidence is treated as incomplete, not as a passing caveat.
- Research findings are promoted into templates, skills, checklists, audit checks, tests, release gates, or decisions before they count as kit behavior.

## Agent Handoff Tracing

Use for meaningful multi-agent work, core changes, security-sensitive changes, frontend acceptance reviews, release work, and any task where a decision should survive beyond the chat thread.

Required checks:
- Select the workflow from `.agent-kit/agent-roster.json`.
- Select or confirm the model profile from `MODEL_ROUTING.md` and `.agent-kit/model-routing.json`.
- Record council-session evidence in `COUNCIL.md` or `.agent-kit/council-sessions/*.json` records that follow `.agent-kit/schemas/council-session.schema.json`.
- Capture each agent decision, risk, next handoff, and evidence.
- Mark required outputs as missing, partial, complete, or not applicable.
- Record verification commands, results, and skipped-test rationale.

## Upgrade Maintenance

Use for Agent Kit, Next.js, Supabase, UI library, testing tool, release workflow, or assistant-adapter upgrades.

Required checks:
- Read `UPGRADE.md` before accepting versioned behavior changes.
- Run `agent-kit diff` before accepting template changes.
- Run `agent-kit update` only on a branch where conflicts can be reviewed.
- Preserve valid local overrides in `.agent-kit/overrides.json`.
- Check Next.js upgrade guides and codemods when framework behavior changes.
- Check Supabase migration history, RLS impact, generated types, and rollback risk when data/auth behavior changes.
- Record package versions, migration order, rollback notes, verification commands, owner, and date.

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
- `DESIGN.md` has enough brand, content, user-need, and creative-direction context for the screen.
- Reference-set, anti-reference, source-safety, and distinctiveness evidence exists for significant frontend work.
- Frontend distinctiveness benchmark evidence exists for significant frontend work: first-screen proof, content fingerprint, reference benchmark, asset provenance, state proof, and visual QA proof.
- Frontend product-quality scorecard exists for significant frontend work.
- Interface is domain-specific and task-first.
- Design tokens and component patterns are consistent.
- Avoid generic AI-site defaults.
- Loading, empty, error, disabled, success, and mobile states are designed.
- Use the matching `.agent-kit/design-briefs/*` brief for SaaS, admin, marketplace, content, tool, ecommerce, portfolio/venue, education, community/social, or AI workflow surfaces.
- Review final desktop and mobile screenshots with `.agent-kit/prompts/screenshot-review.md`.

## Content-First Creative Direction

Use before designing or changing a user-facing site, product screen, dashboard, tool, marketplace, content experience, ecommerce flow, portfolio, venue page, education product, community surface, or AI workflow UI.

Required checks:
- Audience, user needs, product category, and content inventory are explicit.
- Brand personality, visual constraints, category references, and non-goals are captured.
- At least two creative directions are considered before implementation.
- The chosen direction affects tokens, layout, copy, imagery, density, and interaction tone.
- Missing real content or assets are documented instead of hidden behind generic placeholders.

## Reference-Led Design Critique

Use before accepting significant frontend work, especially when the product risks looking like a generic AI-generated site.

Required checks:
- `DESIGN.md` includes 3-5 references and 2-3 anti-references.
- References are used for hierarchy, density, state treatment, typography, content handling, or interaction learning without copying source designs.
- Source-safety notes name brand marks, layouts, copy, and protected assets that must not be copied.
- Distinctiveness is judged as weak, adequate, or strong.
- `.agent-kit/prompts/design-critique-gate.md` records required changes and missing evidence before acceptance.

## Frontend Product Quality Rubric

Use before accepting significant frontend work when a repeatable acceptance score is needed.

Required checks:
- User/task fit, content specificity, visual identity, information architecture, component states, accessibility and interaction, and source safety are scored `0-2`.
- Critical zeroes are rejected.
- Total score is at least `10/14` before acceptance.
- Best-practice frontend claim requires at least `12/14`, desktop/mobile review, and visual QA evidence.
- Best-practice frontend claim also requires passing distinctiveness benchmark evidence.

## Frontend Distinctiveness Benchmark

Use before accepting significant frontend work that could still be interchangeable with another product in the same category.

Required checks:
- The first viewport proves the real product object, task, workflow, content, or decision.
- Product nouns, labels, data shapes, records, actions, and edge cases are visible or documented.
- References are translated into lessons and anti-references without copied source design, brand identity, copy, or assets.
- Asset provenance is recorded for real, generated, licensed, and placeholder visuals.
- Important states and desktop/mobile evidence exist for the change risk.
- Reject work that would still look valid after only changing the logo or headline.

## Marketing Copy And Messaging

Use before writing or accepting public-facing pages, landing pages, pricing copy, CTAs, onboarding copy, empty states, product voice, or conversion-critical UX copy.

Required checks:
- `MESSAGING.md` identifies audience, pain, desired outcome, alternatives, differentiator, proof, objections, voice, and conversion goal.
- Missing positioning inputs are asked as explicit questions before final copy is written.
- Claims are supported by named proof or marked as assumptions.
- Headline, subhead, CTA, proof, and objection handling match the same value proposition.
- Copy uses real product nouns, workflows, constraints, and customer language.
- CTAs have one primary action and clear secondary actions.
- Risky pricing, privacy, security, compliance, performance, medical, financial, or legal claims are reviewed before release.
- Marketing Copy Lead hands off public-facing copy to Frontend Design Lead for layout and hierarchy review.

## Accessibility WCAG 2.1 AA

Use for forms, navigation, modals, menus, tables, dashboards, and any custom interaction.

Required checks:
- Semantic HTML is preferred.
- ARIA is used only when needed.
- Keyboard navigation and focus states work.
- Color contrast meets WCAG 2.1 AA.

## Testing And QA

Use for unit, integration, regression, Playwright smoke coverage, visual QA, and acceptance evidence.

Required checks:
- Core logic has unit tests.
- Preserved behavior has regression tests.
- Critical paths have smoke tests.
- Auth and data mutation paths are prioritized.
- High-risk UI changes have screenshot or visual-regression evidence.

## Visual Regression QA

Use when changing user-facing screens, reusable components, visual design tokens, responsive layouts, image-heavy pages, or any surface where appearance is part of acceptance.

Required checks:
- Visual QA tier is named: baseline screenshots, Playwright screenshots, Storybook visual tests, or visual-regression service.
- Component states and important responsive breakpoints are captured.
- Dynamic or volatile regions are mocked, masked, frozen, or excluded with rationale.
- Baseline updates require human review and a short rationale.
- Visual checks do not replace accessibility, keyboard, semantic, auth, or data-boundary tests.

## Documentation Maintenance

Use after every significant change.

Required checks:
- `SPEC.md` reflects current behavior.
- `DECISIONS.md` records important tradeoffs.
- `DOCS.md` explains workflows and integration points.
- `COUNCIL.md` captures required handoffs and evidence for meaningful multi-agent work.
- `MODEL_ROUTING.md` captures model profile and IDE enforcement evidence.
- `QUALITY_GATES.md`, `DESIGN.md`, `MESSAGING.md`, `STYLE_GUIDE.md`, `SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, and `UPGRADE.md` stay current.

## Compatibility Profiles

Use `.agent-kit/profiles/*` before feature planning when the project is a SaaS, marketplace, admin app, or content app.

Required checks:
- The project type's auth, data, design, testing, and handoff risks are named.
- Agent ownership matches the profile.
- Missing profile assumptions are recorded in `DECISIONS.md`.
