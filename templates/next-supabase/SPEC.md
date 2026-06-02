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

## UX Requirements

- Interfaces are mobile-first and accessible.
- Loading, empty, error, disabled, and success states are handled.
- Visual design is domain-specific and avoids generic AI-site defaults.

## Component And State Inventory

Track important UI surfaces so design quality is reviewable.

| Surface | Components | Loading | Empty | Error | Disabled | Success | Mobile Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Primary workflow | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## Open Questions

Track unresolved product or technical decisions here until they become entries in `DECISIONS.md`.
