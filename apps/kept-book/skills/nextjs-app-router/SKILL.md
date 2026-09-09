---
name: nextjs-app-router
description: Use for Next.js App Router — Server vs Client, Server Actions, Route Handlers, async params/cookies, caching, and proxy.ts. Smoke the changed route in the browser.
---

# Next.js App Router

Scan 2026-09-09 (structure only, no bodies copied): Next.js App Router docs, Next.js 16 async request APIs and `proxy.ts` rename. This pack’s auth is **Supabase**, not a marketplace auth vendor.

## Use when

`app/` routes, layouts, Server Components, Client Components, Server Actions, Route Handlers, `params` / `searchParams`, `cookies()` / `headers()`, caching, or request interception (`proxy.ts` / legacy `middleware.ts`).

## Do

1. Read the existing `app/` tree and match its conventions (`src/app` vs `app`).
2. Keep the work on the **server** unless the browser must hold state, events, or Web APIs.
3. Put mutations in Server Actions (forms) or Route Handlers (HTTP). Validate every input.
4. After a user-visible change, open the running route before handing to QA.

## Checks

- Server Components are the default. `"use client"` is only for browser-only behavior (event handlers, local state, browser APIs).
- Secrets, service-role keys, and privileged fetches never enter a Client Component or a client bundle.
- `cookies()`, `headers()`, `params`, and `searchParams` are **awaited** (Next.js 15+/16).
- Navigation uses `next/navigation`, not `next/router`. Metadata uses `metadata` / `generateMetadata`, not `next/head`.
- Pages Router APIs (`getServerSideProps`, `getStaticProps`, `pages/api`) stay out of new work.
- Next.js 16 request interception lives in `proxy.ts` (`proxy()`). If the repo still has `middleware.ts`, migrate or document why it stays.
- User-specific data is not stored in a shared/public cache. Tag invalidation uses the current two-argument `revalidateTag` API when tags are used.
- Route params, query strings, form fields, and JSON bodies are validated with a schema. Do not trust the URL or the client.
- `loading.tsx`, `error.tsx`, empty, and success exist for the changed route when the user can wait or fail.
- Authorization is enforced on the server **and** in RLS (`supabase-auth-rls`). Hiding a button is not access control.

## Reject

- “It’s a Client Component so we can use hooks” when the data could load on the server.
- Importing `@supabase/supabase-js` with the service-role key in a file that has `"use client"`.
- Switching this pack to Clerk / Auth0 / NextAuth as the default. Auth here is Supabase.
- Shipping a route from the diff without opening it.

## Done when

The server/client boundary is explicit, failure paths are named, and the changed route was opened in the running app. User-visible work then goes to QA with `browser-qa`.
