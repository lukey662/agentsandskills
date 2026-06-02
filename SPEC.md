# Specification

## Package Purpose

`@agent-skills/next-supabase-kit` is a public reusable agent-kit package for Next.js and Supabase projects. It ships installable markdown templates, agents, skills, prompts, checklists, design adapters, design briefs, stack profiles, agent rosters, and a CLI for installing and auditing those assets.

## CLI Surface

The package exposes the `agent-kit` binary from `dist/index.js`.

Supported commands:

- `init`
- `audit`
- `diff`
- `update`
- `add skill`
- `doctor`
- `research discover`
- `research scan`
- `research summarize`
- `research propose-updates`

Existing project files must not be overwritten by default. Template conflicts are written to `.agent-kit/conflicts/`, and installed template hashes are tracked in `.agent-kit/manifest.json`.

## Default Agent Council

Installs must create `.agent-kit/agent-roster.json` from `rosters/next-supabase-default-council.json`.

Required default behavior:

- Planner owns planning, roadmaps, scope, ambiguous requests, and handoff routing.
- Lead Architect owns architecture and must review core changes before implementation.
- Supabase/Postgres Engineer, Next.js Engineer, Frontend Design Lead, Security Reviewer, QA Engineer, Documentation Maintainer, and Deployment/Observability Engineer join based on roster triggers.
- Core changes must use the `core-change` workflow and include Lead Architect in both sequence and council.
- Agent skill routing must include planning, Next.js, Supabase/RLS, Postgres migrations, OWASP, frontend design, accessibility, testing, docs, and deployment skills.

`agent-kit audit` must fail when the default roster is missing, invalid, lacks required agents, lacks required skill routing, or does not make Planner the default planning agent.

## Release System

The package is published as a public npm package.

Release workflow requirements:

- GitHub Actions workflow: `.github/workflows/release.yml`
- GitHub environment: `npm-publish`
- Publish trigger: published GitHub Release or manual workflow dispatch with `dry_run=false`
- Publish authentication: npm Trusted Publishing through GitHub Actions OIDC
- Publish command: `npm publish --access public`
- Public install verification: `npx @agent-skills/next-supabase-kit doctor`

The release workflow must run typecheck, tests, build, dependency audit, and package dry run before publishing.

## Security Requirements

- Do not store long-lived npm publish tokens in GitHub Actions.
- Use least-privilege release credentials: OIDC for publish.
- Keep detailed per-repo research findings out of the public npm package unless separately reviewed.
- Run `npm audit --audit-level=moderate` before publishing.
