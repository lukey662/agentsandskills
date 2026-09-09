# Security — Kept Book

## Boundaries

- Session cookie is httpOnly, SameSite=lax, Secure in production, HMAC-SHA256 with `SESSION_SECRET`.
- Server Actions validate length and required fields. Errors are codes, not stack traces.
- Recipe access is filtered by `householdId` from the session. Missing or cross-kitchen ids are `notFound` (no existence leak).
- `GELATO_API_KEY` is server-only. It is never sent to the client. No user-controlled fetch URL (no SSRF from recipe fields).
- Service-role / Gelato keys must not land in Client Components.
- File store is single-process JSON. It is not multi-tenant durable storage. Vercel instances do not share it.

## OWASP notes for this pass

| Risk | Mitigation |
| --- | --- |
| Broken access control | Household filter on every read/write; tests cover it |
| Injection | Parameterized SQL in the future migration; JSON store is not SQL |
| XSS | React text encoding; no recipe HTML |
| Secrets | `.env*` gitignored; example file has no live keys |
| SSRF | No outbound fetch from user input |

When Supabase is attached, apply the migration RLS. Hiding a nav link is not access control.
