# Specification

This file is the living functional and technical specification for the project.

## Product Summary

Describe the product, primary users, core workflows, and business-critical behavior.

## Current Architecture

Document the current system shape:

- Next.js routing model
- Server Components and Client Components
- Route Handlers and Server Actions
- Supabase Auth flow
- Supabase tables, RLS policies, and Storage buckets
- Deployment target
- Observability and logging

## Behavioral Contracts

List behavior that must be preserved during changes:

- Agent council routing in `.agent-kit/agent-roster.json`
- Model profile routing in `MODEL_ROUTING.md` and `.agent-kit/model-routing.json`
- Council-session evidence in `COUNCIL.md`
- Agent, council-session, model-routing, and audit-report schema contracts in `.agent-kit/schemas/`
- Planner default ownership for planning and Lead Architect review for core changes
- Quality gate evidence in `QUALITY_GATES.md`
- Content-first design direction in `DESIGN.md`
- Reference-led design critique evidence in `DESIGN.md`
- Auth and session behavior
- User ownership and tenant boundaries
- Data mutation rules
- API response expectations
- UI workflows and critical paths

## Data Model

Document tables, relationships, constraints, indexes, and ownership rules.

## RLS Policy Inventory

Track authorization at the data boundary.

| Table/Bucket | Owner Boundary | Select | Insert | Update | Delete | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `example_table` | `user_id = auth.uid()` | Required | Required | Required | Optional | Replace with real policy names. |

## Security Requirements

- Authorization is enforced by Supabase RLS.
- Service-role keys are server-only.
- User input is validated at all boundaries.
- User-controlled output is safely rendered.
- Privileged operations are logged.

## Quality Gate Level

Record the current maturity target and evidence.

| Area | Baseline | Strong | Best-Practice | Evidence |
| --- | --- | --- | --- | --- |
| Council routing | TBD | TBD | TBD | `AGENT_ROSTER.md`, `COUNCIL.md` |
| Model routing | TBD | TBD | TBD | `MODEL_ROUTING.md`, `ASSISTANT_ADAPTERS.md` |
| Architecture | TBD | TBD | TBD | Affected-layer map, `DECISIONS.md` |
| Supabase/RLS | TBD | TBD | TBD | RLS inventory, migration tests |
| Frontend | TBD | TBD | TBD | `DESIGN.md`, reference-set evidence, design critique verdict, product-quality scorecard, screenshots, visual QA |
| Testing | TBD | TBD | TBD | Unit, regression, smoke, visual evidence |
| Release | TBD | TBD | TBD | `DEPLOYMENT.md`, logs, rollback notes |

## UX Requirements

- Interfaces are mobile-first and accessible.
- Loading, empty, error, disabled, and success states are handled.
- Visual design is domain-specific and avoids generic AI-site defaults.
- Audience, user needs, real content, brand constraints, and creative direction are documented before frontend implementation.
- Reference set, anti-references, source-safety notes, and design critique verdict are documented before accepting significant frontend work.
- Frontend product-quality scorecard is documented before accepting significant frontend work.
- First screens show the real product, task, object, content, or workflow.

## Brand And Content Inventory

Track the inputs that make the UI specific to this product.

| Area | Current Decision | Evidence |
| --- | --- | --- |
| Product category | TBD | `DESIGN.md` |
| Primary audience | TBD | User research, analytics, stakeholder input, or project brief |
| User needs | TBD | `DESIGN.md` and accepted stories |
| Real content/data | TBD | Seeds, CMS, database schema, product copy, assets |
| Brand constraints | TBD | Logo, colors, fonts, imagery, platform rules |
| Reference set | TBD | `DESIGN.md`, category references, source-safety notes |
| Anti-references | TBD | `DESIGN.md`, explicit non-goals |
| Chosen creative direction | TBD | Creative-direction matrix and screenshots |
| Design critique verdict | TBD | `DESIGN.md`, critique-gate review |
| Visual QA tier | TBD | `TESTING.md`, Storybook, Playwright report, visual-regression service, or screenshot artifacts |

## Component And State Inventory

Track important UI surfaces so design quality is reviewable.

| Surface | Components | Loading | Empty | Error | Disabled | Success | Mobile Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primary workflow | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## Open Questions

Track unresolved product or technical decisions here until they become entries in `DECISIONS.md`.
