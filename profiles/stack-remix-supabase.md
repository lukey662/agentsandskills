# Stack Profile: Remix And Supabase

Use this profile when adapting the kit to Remix projects using Supabase Auth, Postgres, Storage, Realtime, or Edge Functions.

## Replace Next.js-Specific Checks

- Replace App Router checks with Remix loader, action, route module, error boundary, and nested route checks.
- Keep Supabase Auth, RLS, service-role isolation, Postgres migrations, OWASP, accessibility, testing, deployment, and living-docs requirements.
- Treat loaders and actions as the main auth, validation, and mutation boundaries.

## Required Evidence

- Loaders and actions validate input, verify session state, and return safe errors.
- Supabase clients preserve request auth context.
- RLS protects user-owned and tenant-owned tables.
- Service-role access is isolated to trusted server modules.
- Route-level error boundaries cover loading, empty, failure, and permission-denied states.

## Agent Handoff

- Architect owns route/data boundaries and auth flow.
- Remix engineer owns loaders, actions, nested routes, and error boundaries.
- Supabase/Postgres engineer owns RLS, migrations, storage policies, and service-role access.
- Security reviewer owns IDOR, SSRF, injection, secrets, and dependency exposure.
