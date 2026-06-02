# Supabase Auth And RLS Skill

## Use When

Working on Supabase Auth, SSR clients, middleware, sessions, tables, policies, Storage, or service-role operations.

## Checklist

- RLS is enabled on user-owned and tenant-owned tables.
- Policies enforce ownership and tenant boundaries.
- Service-role key is never exposed to client code.
- Auth middleware handles session refresh safely.
- Storage buckets have explicit policies.
- IDOR attempts are considered and tested.

## Safe Default

If a table stores user-specific data, assume it needs RLS before it is queried from application code.
