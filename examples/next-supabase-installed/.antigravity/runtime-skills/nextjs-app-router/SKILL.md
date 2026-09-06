---
name: nextjs-app-router
description: Use for Next.js App Router, Server Components, Client Components, Route Handlers, Server Actions, caching, forms, and metadata.
---

# Next.js App Router

## Use when

Routes, layouts, Server Components, Client Components, Server Actions, Route Handlers, data loading, caching, or revalidation.

## Checks

- Server Components are the default. Client Components are only for browser-only behavior.
- Secrets never enter client bundles.
- User-specific data is not stored in shared caches.
- Route params, query params, forms, and API bodies are validated.
- Loading, error, empty, and success states exist.
- Authorization is enforced on the server and in RLS, not only in the UI.

## Done when

The server/client boundary is explicit and the changed route can be opened in the browser.
