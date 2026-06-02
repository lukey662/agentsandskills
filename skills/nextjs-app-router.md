# Next.js App Router Skill

## Use When

Working on routes, layouts, Server Components, Client Components, Server Actions, Route Handlers, data loading, caching, or revalidation.

## Checklist

- Server Components are the default.
- Client Components are used only for browser-only behavior.
- Secrets stay server-only.
- User-specific data is not stored in shared caches.
- Route params, query params, forms, and API bodies are validated.
- Loading, error, empty, and success states are present.

## Security Notes

Do not trust client-side checks for authorization. Client UI can hide controls, but server code and RLS must enforce permissions.
