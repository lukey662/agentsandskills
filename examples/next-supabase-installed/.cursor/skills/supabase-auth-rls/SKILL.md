---
name: supabase-auth-rls
description: Use for Supabase Auth, SSR clients, middleware, sessions, Row Level Security, Storage policies, and service-role usage.
---

# Supabase Auth And RLS

## Use when

Supabase Auth, SSR clients, middleware, sessions, tables, policies, Storage, or service-role operations.

## Checks

- RLS is enabled on user-owned and tenant-owned tables.
- Policies enforce ownership and tenant boundaries.
- Service-role keys stay server-only.
- Auth middleware refreshes sessions safely.
- Storage buckets have explicit policies.
- IDOR is considered and tested at the policy boundary.

## Done when

A table that stores user data cannot be read or written across users without a failing policy. UI checks are not treated as authorization.
