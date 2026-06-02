# OWASP Checklist

- Broken access control: RLS, ownership, tenant boundary, admin checks.
- Cryptographic failures: secrets, tokens, PII, transport security.
- Injection: SQL, command, template, prompt, and header injection.
- Insecure design: abuse cases and missing security controls.
- Misconfiguration: env vars, CORS, headers, storage, public buckets.
- Vulnerable components: dependency additions and audit status.
- Auth failures: login, logout, refresh, session expiry, protected routes.
- Integrity failures: CI, package installs, migrations, webhooks.
- Logging failures: errors visible without leaking secrets.
- SSRF: external URL validation and egress restrictions.
