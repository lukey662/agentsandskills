# Stack Profile: Next.js And Postgres

Use this profile when adapting the kit to projects using Next.js with direct Postgres access through an ORM, query builder, or server-only database client.

## Replace Supabase-Specific Checks

- Replace Supabase RLS review with explicit application authorization, database constraints, and optional Postgres RLS.
- Replace Supabase Auth guidance with the project's auth provider and session verification model.
- Keep migration, schema, index, transaction, OWASP, accessibility, testing, deployment, and living-docs requirements.

## Required Evidence

- Server-only database access is enforced.
- User and tenant ownership checks are centralized and tested.
- Migrations are ordered, reversible where practical, and covered by rollback notes.
- Constraints and indexes protect integrity and expected access patterns.
- Integration tests cover auth, ownership, mutations, and failed authorization.

## Agent Handoff

- Architect owns domain model, tenancy, and service boundaries.
- Database engineer owns migrations, constraints, indexes, transactions, and query performance.
- Security reviewer owns IDOR, injection, auth/session checks, secrets, and dependency exposure.
- Frontend design lead owns task-first UX, states, accessibility, and screenshot review.
