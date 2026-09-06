---
name: owasp-security-review
description: Use when reviewing auth, APIs, Server Actions, uploads, webhooks, dependencies, secrets, or data mutations.
---

# OWASP Security Review

## Use when

Auth, APIs, Server Actions, external fetches, uploads, webhooks, dependencies, or mutations.

## Checks

- Broken access control and IDOR are tested.
- Inputs are validated with safe schemas.
- Outputs are encoded; secrets are not logged or bundled.
- SSRF risk is addressed for server-side fetches.
- Dependencies are reviewed for known critical CVEs.
- Errors are explicit without leaking internals.

## Done when

Each finding has severity, affected behavior, and a concrete fix. User-visible auth failures were seen in the browser.
