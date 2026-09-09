---
name: supabase-auth-rls
description: Use for Supabase Auth, SSR clients, session refresh, RLS, Storage policies, and keeping the service role server-only. UI checks are not authorization.
---

# Supabase Auth And RLS

Scan 2026-09-09 (structure only, no bodies copied): Supabase SSR Auth, RLS, and Storage policy docs. Do not replace this pack with a non-Supabase auth vendor.

## Use when

Supabase Auth, cookie/SSR clients, `proxy.ts` / middleware session refresh, RLS, Storage, service-role usage, or any table that stores user or tenant data.

## Do

1. Name the table or bucket and who may read or write a row.
2. Use the **anon/user SSR client** in user requests. Use the **service role** only in a server-only module that never imports into Client Components.
3. Enable RLS and write policies in the **same change** as the table (`postgres-migrations`).
4. Prove a negative: another user (or anon) cannot read or write the row.

## Clients

| Client | Where | Key |
| --- | --- | --- |
| Browser / `'use client'` | Components that must talk to Supabase in the browser | `NEXT_PUBLIC_SUPABASE_ANON_KEY` only |
| SSR / Server Components / Actions / Route Handlers | Cookie session, `createServerClient` | Anon key + cookies |
| Service role | Server-only jobs, webhooks, migrations | `SUPABASE_SERVICE_ROLE_KEY` — never `NEXT_PUBLIC_` |

Auth decisions use `getUser()` (or equivalent server verification), not a client-trusted `getSession()` JWT.

If the app intercepts requests, refresh the session there (`proxy.ts` or existing `middleware.ts`) so Server Components see a current user.

## RLS And Storage

- `ENABLE ROW LEVEL SECURITY` on every user-owned, tenant-owned, or privileged table.
- Policies name ownership (`auth.uid()`) and tenant boundaries. An “authenticated” role is not ownership.
- Storage buckets have explicit policies. A private bucket with a public URL is a finding.
- Privileged bypass (service role, `security definer`) is listed, server-only, and as narrow as the job.

## Checks

- IDOR is tested at the **policy** (and server) boundary: object IDs in the URL or body cannot reach another user’s row.
- Login, logout, expired session, and denied are exercised when those states exist. User-visible ones need `browser-qa`.
- `.env.example` documents public anon URL/key placeholders only. Service role stays unnamed in client files.

## Reject

- “The button is hidden, so they cannot hit the API.”
- RLS deferred to a follow-up PR while the table is already queryable.
- Service role in `NEXT_PUBLIC_*`, in a Client Component, or in a file imported by one.
- Trusting `user_id` from the request body instead of `auth.uid()`.

## Done when

A second user (or anon) cannot read or write the protected row. UI checks are not treated as authorization. Hand user-visible auth states to QA with `browser-qa`.
