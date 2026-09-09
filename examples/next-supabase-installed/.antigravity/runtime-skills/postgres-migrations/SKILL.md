---
name: postgres-migrations
description: Use for schema, constraints, indexes, RLS in the same change, generated types, and rollback risk.
---

# Postgres Migrations

Scan 2026-09-09 (structure only, no bodies copied): Supabase migration + RLS docs. Pair every user-data table with `supabase-auth-rls`.

## Use when

Creating or changing tables, columns, constraints, indexes, functions, triggers, views, or seed data.

## Do

1. Name the migration, the tables, and whether existing rows must keep working.
2. Prefer additive changes. Destructive steps need an explicit rollback (or an expand/contract plan).
3. If the table holds user or tenant data, **RLS lands in this change**, not a later ticket.
4. Refresh generated DB types after the schema change.

## Checks

- Constraints protect integrity (PK, FK, unique, `NOT NULL` where the product requires it).
- Indexes match real `WHERE` / join paths, not speculative columns.
- `ENABLE ROW LEVEL SECURITY` + policies ship with the table when it is user-owned, tenant-owned, or privileged.
- `GRANT` is not a substitute for RLS. Revoking grants from `anon` / `authenticated` without policies is still incomplete if the service role is exposed.
- Functions that run as definer are listed and justified. Prefer invoker + RLS.
- Seed data does not insert other users’ rows as the current user.
- Migration order is safe on a non-empty database (backfill before `NOT NULL`, rename in steps).

## Reject

- “We’ll add RLS after launch.”
- Dropping a column or table in the same release that still reads it, with no expand/contract.
- Editing production by hand instead of a numbered migration.

## Done when

Migration order and rollback risk are named. User data is not left unprotected. Types used by the app match the new schema.
