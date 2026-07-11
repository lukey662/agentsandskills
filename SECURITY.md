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
- Keep npm lifecycle scripts deny-by-default where possible; pin reviewed approvals for required native/build packages and deny optional scripts that are not needed.

## Optional Runtime Threat Model

- Treat model output, repository files, MCP metadata, MCP output, and provider error text as untrusted input.
- Accept credential references only from environment variables or the OS keychain. Never persist resolved values.
- Reject provider/MCP redirects, embedded URL credentials, unsafe protocols, non-allowlisted MCP hosts, and private or special-use DNS results unless private access is explicit.
- Require explicit host opt-in and approval for Cursor and stdio MCP. Use argv spawning with no shell and a minimal environment.
- Reject path traversal, symlink escapes, Git internals, environment files, private keys, package-manager credentials, and runtime evidence paths from model file tools.
- Block worktree creation when sensitive filenames are tracked. Run the full audit before enabling runtime execution because filename checks do not replace content secret scanning.
- Keep Docker network off by default and require approval before configured network access. Resolve reviewed local images to immutable IDs.
- Never authorize an MCP action solely from server annotations or model intent. Empty tool allowlists expose nothing.
- Redact run records and event logs recursively. Redaction is defense in depth, not permission to send secrets or customer data to a provider.
- Never auto-merge, push, open pull requests, deploy, or apply migrations.

## Downstream Security Defaults

Installed templates require:

- OWASP Top 10 review for feature work.
- Supabase RLS for authorization at the data boundary.
- Service-role keys to remain server-only.
- Input validation at API and form boundaries.
- Output encoding and safe rendering for user-controlled content.
- Least privilege for database access, storage access, and automation tokens.
