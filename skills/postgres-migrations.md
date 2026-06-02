# Postgres Migrations Skill

## Use When

Adding tables, columns, constraints, indexes, functions, triggers, seed data, or policy changes.

## Checklist

- Migration order is documented.
- Constraints protect data integrity.
- Indexes support expected queries.
- RLS changes are reviewed with auth assumptions.
- Backfills and destructive changes have rollback guidance.
- Local and production application order is clear.
