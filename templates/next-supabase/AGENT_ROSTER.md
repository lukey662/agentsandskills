# Agent Roster

This project uses `.agent-kit/agent-roster.json` as the default council contract. Agents should use it before planning, implementation, review, and handoff.

## Default Rule

Planner handles planning by default. Lead Architect reviews core changes before implementation. Security Reviewer, QA Engineer, Documentation Maintainer, and Deployment/Observability Engineer join when their trigger areas are touched.

## Default Workflows

### Planning

Use when the request asks for a plan, roadmap, phases, scope, or a breakdown.

Handoff order:

1. Planner
2. Lead Architect
3. QA Engineer
4. Documentation Maintainer

### Core Change

Use when the request touches schema, auth, RLS, API behavior, Server Actions, Route Handlers, dependency changes, package behavior, release workflows, or cross-layer architecture.

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
3. Next.js Engineer
4. QA Engineer
5. Documentation Maintainer

## Handoff Rules

- Each agent must state its decision, risk, and required next handoff.
- Core changes cannot skip Lead Architect.
- Auth, data mutation, dependency, external-call, secret, and release-risk changes cannot skip Security Reviewer.
- Behavior changes cannot skip QA evidence.
- Significant changes cannot skip living docs.

