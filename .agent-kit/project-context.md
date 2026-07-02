# Project Context

Generated from `.agent-kit/project-context.json`.

## Summary

- Project: @appsforgood/next-supabase-kit
- Category: tool
- Audience: Engineers and AI coding agents working on Next.js + Supabase projects who want structured agent roles, quality gates, and living documentation installed into their repos.
- Quality target: best-practice-candidate
- Last reviewed: 2026-07-02T12:30:58.880Z

An npm package that installs an agent operating system into Next.js + Supabase projects. It ships the agent-kit CLI (init, audit, diff, update, add skill, doctor, onboard, context, session, correction, studio export, research) plus installable markdown templates, agent role definitions, skills, prompts, checklists, design briefs, stack profiles, assistant adapters, model-routing profiles, JSON Schemas, and a default council roster. It has no runtime LLM orchestration; all evidence is file- and CLI-based.

## Primary Workflows

- Install the kit into a downstream project with agent-kit init and audit readiness with agent-kit audit --min-readiness
- Upgrade an installed project with agent-kit diff and agent-kit update while preserving local docs through conflict files
- Record multi-agent council evidence locally with agent-kit session, correction, and studio export commands


## Architecture Signals

- Package manager: npm
- Frameworks: none detected
- UI libraries: none detected
- Test tools: vitest
- Supabase detected: yes
- Env example keys: GITHUB_TOKEN
- Deployment files: none detected

## Security And Data

- Auth model: None at runtime. The CLI is local-first and requires no accounts. Release authentication uses npm Trusted Publishing (OIDC) from GitHub Actions; the optional research commands use a GITHUB_TOKEN env var.
- Tenant model: Single local repository per install. This is a developer tool, not a hosted multi-tenant product.

Data sensitivity:

- No user data is stored; the CLI reads and writes local project files only
- GITHUB_TOKEN \(optional, research subsystem only\) must never be committed or written into generated files


## UI Direction

- Preferred: Terminal-first UX: human-readable summaries by default, stable --json output for machines, actionable error messages with documented exit codes.
- Avoid: Raw JSON dumps as the default human output, interactive prompts that break CI, and stack traces as user-facing errors.

## Messaging

- Value proposition: Install a complete, auditable agent operating system (roles, skills, quality gates, docs, and model routing) into a Next.js + Supabase repo with one command, and keep it upgradeable without losing local customizations.

Proof:

- Conflict-safe init/update behavior covered by vitest suites and smoke-install regression fixture
- Machine-readable audit with readiness gate used by this repo's own CI \(smoke:audit-gate\)
- Supply-chain hardening: Trusted Publishing, SBOM attestation, CodeQL, Scorecard, Dependabot


Objections:

- Package not yet published to npm; npx quick-start commands are prospective until publish completes
- Only the next-supabase stack profile ships today
- Docs-and-checklist enforcement is advisory; no runtime LLM orchestration exists yet


## Open Questions

- When will the @appsforgood npm scope and Trusted Publishing setup complete so the first publish can be verified?
- Which second stack profile \(next-prisma-postgres or vite-supabase\) should prove the multi-stack abstraction?


## Evidence

| Source | Note |
| --- | --- |
| agent-kit context scan | Scanned 472 files for package, Supabase, test, env example, and deployment signals. |
