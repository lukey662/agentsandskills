# Security Policy

## Supported Versions

This project supports the latest published npm release and the current `main` branch.

## Reporting

Report vulnerabilities through a private security advisory or by contacting the maintainers directly. Do not publish secrets, exploit paths, or vulnerable downstream project details in public issues.

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
