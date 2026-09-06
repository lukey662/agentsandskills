---
name: postgres-migrations
description: Use for schema changes, migrations, constraints, indexes, and rollback risk.
---

# Postgres Migrations

## Use when

Creating or changing tables, constraints, indexes, functions, triggers, or seed data.

## Checks

- Migrations are additive or have an explicit rollback path.
- Constraints protect integrity; indexes match real query paths.
- RLS is planned in the same change when the table holds user or tenant data.
- Generated types are refreshed after schema changes.

## Done when

Migration order and rollback risk are named. User data is not left unprotected.
