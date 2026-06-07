---
applyTo: "app/**/*.{ts,tsx},src/app/**/*.{ts,tsx},pages/**/*.{ts,tsx},src/pages/**/*.{ts,tsx},components/**/*.{ts,tsx},lib/**/*.{ts,tsx},utils/**/*.{ts,tsx},supabase/**/*,*.sql"
---

# Next.js + Supabase Agent Kit Instructions

Follow `AGENTS.md`, `AGENT_ROSTER.md`, `.agent-kit/agent-roster.json`, `MODEL_ROUTING.md`, `.agent-kit/model-routing.json`, `.agent-kit/project-context.json`, `.agent-kit/project-context.md`, `.agent-kit/corrections/project-rules.json`, `.agent-kit/corrections/agent-rules.json`, `COUNCIL.md`, `.agent-kit/council-sessions/`, and `QUALITY_GATES.md`.

## Next.js

- Keep Server Component, Client Component, Route Handler, and Server Action boundaries explicit.
- Do not expose secrets, service-role keys, privileged queries, or admin-only data to client bundles.
- Preserve loading, empty, error, disabled, success, focus, and mobile states for user-facing changes.

## Supabase

- Enforce authorization with Postgres RLS where applicable.
- Treat service-role access as server-only.
- Document migration order, rollback risk, indexes, constraints, and policy changes.

## Council Routing

- Schema, auth, RLS, API behavior, dependency, and release changes require Lead Architect and Security Reviewer handoff.
- UI changes require Frontend Design Lead evidence before implementation is accepted.
- Behavior changes require QA evidence and living-doc updates.
- Use the model profile in `MODEL_ROUTING.md`; treat Copilot model selection as advisory unless the active tool surface can enforce it.
- Read project context and active corrections before changing behavior.
- Record visible decisions, handoffs, human corrections, artifacts, and verification with Agent Studio session commands when available.
