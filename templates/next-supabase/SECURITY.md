# Security

Security review is required for every auth, API, data access, upload, webhook, external request, or dependency change.

## OWASP Top 10 Checklist

- Broken access control: verify RLS, ownership checks, admin checks, and tenant boundaries.
- Cryptographic failures: never expose secrets or sensitive tokens.
- Injection: validate inputs and use parameterized queries or safe client APIs.
- Insecure design: document abuse cases before implementation.
- Security misconfiguration: verify env vars, CORS, headers, and deployment settings.
- Vulnerable components: review dependency additions and audit results.
- Identification and authentication failures: test login, logout, refresh, and protected routes.
- Software and data integrity failures: protect CI, package installs, and migrations.
- Security logging and monitoring failures: log privileged actions and operational failures.
- SSRF: restrict server-side fetches and validate external URLs.

## Supabase Requirements

- RLS must be enabled for user-owned, tenant-owned, or privileged tables.
- RLS policies must enforce ownership and tenant boundaries.
- UI checks are not authorization.
- Service-role keys must never be exposed to browser code.
- Storage buckets require explicit access policies.
- Migrations that change authorization must include review notes.
- `SPEC.md` must include an RLS policy inventory for every protected table and bucket.

## Security Control Inventory

Track project controls explicitly.

| Control | Location | Owner | Verification |
| --- | --- | --- | --- |
| Auth middleware | TBD | TBD | Protected-route smoke test |
| RLS policies | Supabase migrations | TBD | SQL/policy review |
| Input validation | Forms, Server Actions, Route Handlers | TBD | Unit/integration tests |
| Rate limiting | Public mutations and auth-sensitive routes | TBD | Abuse-case review |
| Service-role isolation | Server-only modules | TBD | Bundle and code review |

## Input And Output Boundaries

- Validate form, API, webhook, query string, and route param inputs.
- Encode or safely render user-controlled output.
- Do not leak stack traces, tokens, SQL, or internal IDs in user-facing errors.

## Secrets

- Store secrets in environment configuration, not source code.
- Keep `.env.example` documented with placeholder values only.
- Rotate secrets after suspected exposure.

## Optional Orchestrator

- Keep `.agent-kit/orchestrator.json` disabled until provider aliases, credential references, MCP allowlists, mutation roles, Docker policy, and approval gates are reviewed.
- Use `env:` or `keychain:` references only; never put resolved credentials in config, prompts, run records, or evidence.
- Treat model output, repository content, MCP metadata/output, and provider errors as untrusted.
- Require explicit host opt-in and approval for Cursor or stdio MCP execution.
- Keep provider/MCP redirects blocked, remote MCP hosts allowlisted, private-network access off by default, and Docker network disabled unless approved.
- Run `agent-kit audit` before orchestration. Sensitive-path and evidence-redaction controls do not replace repository secret scanning or data-classification review.
- Review the isolated worktree and scoped commit manually. The runtime must not merge, push, deploy, or apply migrations.

## Review Notes

Add security-sensitive decisions and exceptions to `DECISIONS.md`.
