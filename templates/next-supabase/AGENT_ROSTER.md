# Agent Roster

This project uses `.agent-kit/agent-roster.json` as the default council contract. Agents should use it before planning, implementation, review, and handoff. Use `MODEL_ROUTING.md` and `.agent-kit/model-routing.json` to select model profiles for each agent. The roster contract is backed by `.agent-kit/schemas/agent-roster.schema.json`.

## Default Rule

Planner handles planning by default. Lead Architect reviews core changes before implementation. Frontend Design Lead owns content-first creative direction, reference-led critique, frontend distinctiveness benchmarking, product-quality scoring, and visual QA before significant frontend implementation is accepted. Marketing Copy Lead owns positioning, value proposition, public-facing copy, proof, objections, voice, and CTA hierarchy before conversion-facing copy is accepted. Security Reviewer, QA Engineer, Documentation Maintainer, and Deployment/Observability Engineer join when their trigger areas are touched. Meaningful multi-agent work records council-session evidence in `COUNCIL.md` or a structured record that follows `.agent-kit/schemas/council-session.schema.json`.

## Default Workflows

### Planning

Use when the request asks for a plan, roadmap, phases, scope, or a breakdown.

Handoff order:

1. Planner
2. Lead Architect
3. QA Engineer
4. Documentation Maintainer

### Core Change

Use when the request touches schema, auth, RLS, API behavior, Server Actions, Route Handlers, dependency changes, package behavior, upgrade workflows, release workflows, or cross-layer architecture.

Handoff order:

1. Planner
2. Lead Architect
3. Supabase/Postgres Engineer
4. Next.js Engineer
5. Security Reviewer
6. QA Engineer
7. Documentation Maintainer
8. Deployment/Observability Engineer

### Frontend Change

Use when the request touches screens, components, layout, visual design, accessibility, responsiveness, or screenshot review.

Handoff order:

1. Planner
2. Frontend Design Lead
3. Marketing Copy Lead when the surface is public-facing or conversion-facing
4. Next.js Engineer
5. QA Engineer
6. Documentation Maintainer

Required outputs:

- Brand/content intake
- Copy/value-proposition brief when public-facing or conversion-facing
- Creative-direction rationale
- Reference-set evidence
- Frontend distinctiveness benchmark
- Design critique verdict
- Frontend product-quality scorecard
- Domain-specific UI rationale
- Visual QA evidence
- State coverage
- Accessibility checks
- Desktop/mobile verification

### Marketing Copy

Use when the request touches copy, copywriting, marketing, positioning, messaging, value proposition, landing pages, headlines, CTAs, conversion, onboarding, empty states, or pricing.

Handoff order:

1. Planner
2. Marketing Copy Lead
3. Frontend Design Lead
4. QA Engineer
5. Documentation Maintainer

Required outputs:

- Discovery questions answered or explicitly marked unknown
- Audience and segment assumptions
- Problem, pain, desired outcome, and value proposition
- Differentiators, proof points, objections, and counter-messaging
- Voice/tone guidance
- Page or flow copy inventory
- CTA and conversion hypothesis
- Handoff notes for design and implementation

## Handoff Rules

- Each agent must state its decision, risk, and required next handoff.
- Each meaningful council session must record workflow, affected layers, required outputs, handoff decisions, risks, evidence, and verification status.
- Core changes cannot skip Lead Architect.
- Frontend changes cannot skip content/brand intake, creative-direction rationale, reference-set evidence, distinctiveness benchmark, design critique verdict, product-quality scorecard, visual QA evidence, or Frontend Design Lead review.
- Public-facing or conversion-facing copy cannot skip Marketing Copy Lead discovery questions, value proposition, proof, objection, voice/tone, and CTA review.
- Auth, data mutation, dependency, external-call, secret, and release-risk changes cannot skip Security Reviewer.
- Behavior changes cannot skip QA evidence.
- Significant changes cannot skip living docs.
- Upgrade changes cannot skip `UPGRADE.md`, conflict review, audit evidence, and rollback notes.
