# Specification

## Package Purpose

`@agent-skills/next-supabase-kit` is a public reusable agent-kit package for Next.js and Supabase projects. It ships installable markdown templates, agents, skills, prompts, checklists, design adapters, assistant adapters, model-routing profiles, design briefs, stack profiles, agent rosters, and a CLI for installing, auditing, updating, and reviewing those assets.

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

## Upgrade Surface

Installed projects receive `UPGRADE.md` and `.agent-kit/` assets for upgrade review. Upgrade work must support:

- `agent-kit diff` before accepting template changes.
- `agent-kit update` with conflict-safe writes.
- `.agent-kit/overrides.json` for accepted local deviations.
- Next.js upgrade-guide and codemod review when framework behavior changes.
- Supabase migration history, RLS impact, generated types, and rollback review when data/auth behavior changes.
- `agent-kit audit --min-readiness baseline-setup` after upgrade.
- Rollback evidence and owner/date in `UPGRADE.md`.

## Default Agent Council

Installs must create `.agent-kit/agent-roster.json` from `rosters/next-supabase-default-council.json`.

Required default behavior:

- Planner owns planning, roadmaps, scope, ambiguous requests, and handoff routing.
- Lead Architect owns architecture and must review core changes before implementation.
- Supabase/Postgres Engineer, Next.js Engineer, Frontend Design Lead, Security Reviewer, QA Engineer, Documentation Maintainer, and Deployment/Observability Engineer join based on roster triggers.
- Core changes must use the `core-change` workflow and include Lead Architect in both sequence and council.
- Agent skill routing must include planning, upgrade maintenance, Next.js, Supabase/RLS, Postgres migrations, OWASP, frontend design, accessibility, testing, docs, and deployment skills.
- Frontend skill routing must include content-first design, reference-led design critique, frontend distinctiveness benchmark, frontend product-quality rubric, visual regression QA, and accessibility.

`agent-kit audit` must fail when the default roster is missing, invalid, lacks required agents, lacks required skill routing, or does not make Planner the default planning agent.

## Model Routing Surface

Installs must create `.agent-kit/model-routing.json` from `model-routing/default-model-routing.json` and install `MODEL_ROUTING.md`.

Required behavior:

- The model-routing contract maps every default council agent to a provider-neutral model profile.
- Profile names describe capability and operating mode, not permanent vendor promises.
- IDE-specific files may include dated June 2026 comments for Codex, Claude Code, Cursor, and GitHub Copilot.
- Audit warns when model routing is missing, malformed, incomplete, or not reflected in `ASSISTANT_ADAPTERS.md`.
- Audit does not fail solely because a downstream IDE cannot enforce per-agent model choice.

## Frontend Quality Surface

Installed projects receive frontend guidance that is stricter than a generic component checklist.

Required frontend evidence:

- `DESIGN.md` captures brand, content, user needs, creative direction, design tokens, reference set, anti-references, distinctiveness, design critique guidance, frontend distinctiveness benchmark, and a product-quality scorecard.
- Frontend-change workflow includes Frontend Design Lead, reference-set evidence, distinctiveness benchmark, design critique verdict, frontend product-quality scorecard, visual QA evidence, state coverage, accessibility checks, and desktop/mobile verification.
- `agent-kit audit` warns when `DESIGN.md` lacks content-first design direction, reference-led critique guidance, frontend distinctiveness benchmark evidence, or the product-quality scorecard.
- Provider-neutral design adapters must respect reference sets, anti-references, and source-safety notes.

## Release System

The package is published as a public npm package.

Release workflow requirements:

- GitHub Actions workflow: `.github/workflows/release.yml`
- GitHub environment: `npm-publish`
- Publish trigger: published GitHub Release or manual workflow dispatch with `dry_run=false`
- Publish authentication: npm Trusted Publishing through GitHub Actions OIDC
- Publish command: create a package tarball, attest the SBOM for that tarball, then run `npm publish <tarball> --access public`
- Public install verification: `npx @agent-skills/next-supabase-kit doctor`

The release workflow must run typecheck, tests, build, dependency audit, SBOM check, install smoke, and package dry run before publishing.

## Security Requirements

- Do not store long-lived npm publish tokens in GitHub Actions.
- Use least-privilege release credentials: OIDC for publish.
- Keep detailed per-repo research findings out of the public npm package unless separately reviewed.
- Run `npm audit --audit-level=moderate` before publishing.
- Generate a CycloneDX SBOM from `package-lock.json`, upload release evidence, and attest the SBOM for the published tarball.
