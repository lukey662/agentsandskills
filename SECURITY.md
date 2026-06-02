# Security Policy

## Supported Versions

This private package is supported only on the current `main` branch until versioned releases are introduced.

## Reporting

Report vulnerabilities privately to the AFG engineering owner. Do not open public issues for secrets, exploit paths, or vulnerable downstream project details.

## Package Security Requirements

- Do not commit credentials, GitHub tokens, Supabase service-role keys, database URLs, or customer data.
- Treat scanned repositories as untrusted input.
- Prevent path traversal when writing files into downstream projects.
- Never overwrite downstream project files unless the user passes an explicit force flag.
- Redact secrets before writing logs, findings, summaries, or prompts.
- Do not copy third-party source code from research targets into this package.

## Downstream Security Defaults

Installed templates require:

- OWASP Top 10 review for feature work.
- Supabase RLS for authorization at the data boundary.
- Service-role keys to remain server-only.
- Input validation at API and form boundaries.
- Output encoding and safe rendering for user-controlled content.
- Least privilege for database access, storage access, and automation tokens.
