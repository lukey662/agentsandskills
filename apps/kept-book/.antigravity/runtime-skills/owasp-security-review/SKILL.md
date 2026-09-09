---
name: owasp-security-review
description: Use when reviewing auth, Server Actions, Route Handlers, uploads, webhooks, SSRF, secrets, or data mutations in a Next.js + Supabase app.
---

# OWASP Security Review

Scan 2026-09-09: OWASP Top 10 mapped onto this pack (App Router + Supabase). Pair with `supabase-auth-rls`. Do not treat a UI walkthrough as access control.

## Use when

Auth, RLS, Server Actions, Route Handlers, uploads, webhooks, server-side `fetch`, new dependencies, or any mutation.

## Checks

Map each change to a concrete control. Skip rows that do not apply; do not skip access control when data is involved.

| Risk | In this pack |
| --- | --- |
| Broken access control / IDOR | RLS + server checks. Object IDs in params/body cannot reach another user’s row. |
| Cryptographic failures | No secrets in git, logs, or client bundles. Service role is server-only. |
| Injection | Schema-validate inputs. Parameterized queries / Supabase client. No string-built SQL. |
| Insecure design | Abuse case named (anon, other user, stolen cookie, replayed action). |
| Misconfiguration | CORS, env, debug flags, Storage public/private. |
| Vulnerable components | New deps reviewed; no known critical CVE waved through. |
| Auth failures | Login, logout, refresh, denied. `getUser()` on the server. |
| Integrity | Lockfile + CI. No postinstall scripts from untrusted packages. |
| Logging | Privileged actions log without tokens, cookies, or PII dumps. |
| SSRF | Server `fetch` / webhook URLs are allowlisted or parsed; no user-controlled hostname to cloud metadata. |

## Server Actions And Route Handlers

- Every mutation validates origin/input. Do not trust hidden form fields for `user_id` or `role`.
- CSRF: cookie-session apps use SameSite and origin checks on state-changing POST.
- File uploads: type, size, and Storage policy. Do not serve user files from a privileged bucket via a guessable path.

## Reject

- “RLS is enabled” without a policy that names the owner or tenant.
- Findings with no severity, no affected behavior, and no fix.
- Closing a user-visible auth bug from the SQL file alone (needs `browser-qa` for login/denied).

## Done when

Each finding has severity, affected behavior, and a concrete fix. Access control is in Postgres or the server, not only the UI. User-visible auth failures were seen in the browser.
