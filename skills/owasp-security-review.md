# OWASP Security Review Skill

## Use When

Reviewing auth, APIs, Server Actions, external fetches, file uploads, webhooks, dependencies, or data mutations.

## Checklist

- Broken access control and IDOR are tested.
- Inputs are validated and parsed with safe schemas.
- Outputs are safely rendered or encoded.
- SSRF risk is addressed for server-side fetches.
- Secrets are not logged or bundled.
- Dependencies are reviewed for known critical CVEs.
- Errors are explicit without leaking internals.

## Output Format

Report severity, exploit path, affected behavior, and concrete remediation.
