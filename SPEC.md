# Specification

## Package Purpose

`@appsforgood/next-supabase-kit` is a public reusable agent-kit package for Next.js and Supabase projects. It ships installable markdown templates, agents, skills, portable runtime skills, prompts, checklists, design adapters, assistant adapters, Antigravity runtime commands, model-routing profiles, design briefs, stack profiles, agent rosters, messaging/copy evidence templates, and a CLI for installing, auditing, updating, and reviewing those assets.

## CLI Surface

The package exposes the `agent-kit` binary from `dist/index.js`.

Supported commands:

- `init`
- `audit`
- `diff`
- `update`
- `add skill`
- `adapter validate`
- `package validate`
- `doctor`
- `research discover`
- `research scan`
- `research summarize`
- `research propose-updates`
- `init --guided`
- `onboard`
- `context init`
- `context scan`
- `context ask`
- `context render`
- `context validate`
- `context show`
- `session start`
- `session list`
- `session active`
- `session note`
- `session decision`
- `session handoff`
- `session correct`
- `session artifact`
- `session verify`
- `session output`
- `session render`
- `session close`
- `correction list`
- `correction add`
- `correction apply`
- `correction retire`
- `correction propose-upstream`
- `studio export`

Existing project files must not be overwritten by default. Template conflicts are written to `.agent-kit/conflicts/`, and installed template hashes are tracked in `.agent-kit/manifest.json`.

`update` performs a hash-aware merge using the manifest template hashes. Per file it reports one action:

- `created`: the file was missing locally.
- `unchanged`: the file already matches the current template.
- `updated`: the file was pristine (matched the installed template hash) and was auto-refreshed to the newer template.
- `kept-local`: the file is locally customized and the bundled template did not change; local edits win silently.
- `conflict`: the file is locally customized and the template changed; the new template is written to `.agent-kit/conflicts/` for review.
- `overwritten`: local customizations were replaced because `--force` was passed.

`update --dry-run` reports the same per-file plan without writing anything (it errors if no manifest exists). Running `update` without a previous install falls back to a conflict-safe `init`. After a real update, the manifest records `updatedAt` and refreshed `templateHashes`.

### Output And Exit-Code Contract

- Commands print human-readable output by default and accept `--json` for machine-readable output. Machine consumers (CI gates, scripts) must pass `--json`; the human output format is not a stable contract.
- Color output uses ANSI semantic colors only when stdout is a TTY and `NO_COLOR` is unset; output degrades to monochrome otherwise.
- Mutating commands support `--dry-run` where preview is meaningful: `init --dry-run`, `update --dry-run`, and `add skill --dry-run`.
- `init --guided` asks interactive project-context questions only when running on a TTY; in CI and scripts it falls back to the non-interactive context scan.
- Exit codes: `0` success; `1` for invalid input, failed audit gates (`--min-readiness` not met or any `fail` finding), and runtime errors. Errors print a single `error: <message>` line to stderr instead of a stack trace.

`init` also installs assistant adapter rules when absent:

- `.cursor/rules/cursor-agent-kit.mdc`
- `.cursor/rules/cursor-model-selection.mdc`

Downstream projects should record adapter activation evidence in `ASSISTANT_ADAPTERS.md`.

`init --activate antigravity` installs:

- `.antigravity/agent-kit/plugin.json`
- `.antigravity/agent-kit/commands/*.toml`
- `.antigravity/runtime-skills/*/SKILL.md`
- `.antigravity/agent-kit/README.md`

The Antigravity command layer exposes `/setup`, `/audit`, `/plan`, `/handoff`, `/frontend`, `/security`, `/copy`, `/ship`, and `/upgrade`. It also exposes focused UI improvement commands: `/ui-audit`, `/ui-polish`, `/layout-cleanup`, `/responsive-cleanup`, `/accessibility-pass`, `/distinctiveness-pass`, `/screenshot-critique`, and `/browser-qa`. These command files must wrap the existing council/session contracts and must not fork role definitions, security policy, quality gates, frontend detector policy, or model-routing policy.

`agent-kit adapter validate antigravity` validates the Antigravity manifest, command files, portable `SKILL.md` wrappers, source-of-truth references, package allowlist, and secret-safety. Native Antigravity CLI validation is optional because the package must remain usable where `agy` is not installed.

`agent-kit package validate` runs from the source repository and validates runtime adapter assets, portable skills, docs, example snapshots, package allowlists, and source-package audit behavior.

Release and CI gates include `npm run smoke:audit-gate`, which requires a fresh install to pass `agent-kit audit --min-readiness baseline-setup` with zero failures.

## Context And Session Surface

Phase 9 adds a local-first Agent Studio workflow. The baseline implementation must not require a database, hosted service, background daemon, or direct model API credentials.

Implemented commands:

- `init --guided`
- `onboard`
- `context init`
- `context scan`
- `context ask`
- `context render`
- `context validate`
- `context show`
- `session start`
- `session list`
- `session active`
- `session note`
- `session decision`
- `session handoff`
- `session correct`
- `session artifact`
- `session verify`
- `session output`
- `session render`
- `session close`
- `correction list`
- `correction add`
- `correction apply`
- `correction retire`
- `correction propose-upstream`
- `studio export`
- `adapter validate`
- `package validate`

Implemented local files:

- `.agent-kit/project-context.json`
- `.agent-kit/project-context.md`
- `.agent-kit/corrections/project-rules.json`
- `.agent-kit/corrections/agent-rules.json`
- `.agent-kit/corrections/upstream-proposals.json`
- `.agent-kit/council-sessions/<session-id>/session.json`
- `.agent-kit/council-sessions/<session-id>/events.jsonl`
- `.agent-kit/council-sessions/<session-id>/index.md`
- `.agent-kit/council-sessions/<session-id>/transcript.md`
- `.agent-kit/studio/index.html`

`project-context.json` is the machine-readable source for product, audience, workflows, sensitive data, auth model, tenant model, integrations, UI direction, messaging, quality target, known constraints, and open questions.

`events.jsonl` is the append-only source of truth for visible session events: agent messages, decisions, handoffs, risks, evidence, human corrections, artifacts, verification, required-output status updates, open questions, and session status changes.

Generated Markdown files are the primary human interface. They must include Mermaid handoff graphs, current status, agent streams, decision tables, correction summaries, required outputs, verification evidence, artifact links, and next actions.

The static Studio export is an optional visual interface generated from the same local files. It must embed only redacted export-time JSON, render an SVG handoff graph, provide clickable transcript panels, avoid external assets, and require no server or database.

Human corrections can be scoped to a session, the project, a specific agent, or an upstream proposal. Active project and agent corrections must be loaded by future IDE-agent work through installed assistant-adapter guidance. Invalid correction scopes must be rejected with a stable package-owned error before selecting or writing any durable correction file.

The package must not claim to expose private model reasoning. Agent Studio records visible work products, decisions, and evidence only.

Runtime command files and portable skills are adapter surfaces. They are allowed to summarize routing and required outputs, but the canonical source of truth remains `AGENTS.md`, `.agent-kit/agent-roster.json`, `QUALITY_GATES.md`, `.agent-kit/skills/`, and Agent Studio JSON/JSONL session records.

### Automated Verification Requirements

Every context, session, correction, renderer, adapter, audit, and studio feature must ship with automated tests before it is marked complete.

Required and current coverage:

- Unit tests for schema validation, scanner output, guided answer normalization, correction scope handling, JSONL parsing, event validation, graph generation, Markdown rendering, redaction, path safety, and audit findings.
- Fixture tests for empty projects, fresh installs, existing customized docs, old manifests, malformed context files, active corrections, unrendered sessions, incomplete completed sessions, and fake secret-looking values.
- CLI smoke tests for `init --guided`, context scan/render/validate, session start/decision/handoff/correct/artifact/verify/output/render, static studio export, and audit.
- Golden output tests for generated project context Markdown, session index Markdown, transcript Markdown, and expected audit output.
- Regression tests proving existing `init`, `update`, `diff`, conflict handling, examples, and public package file allowlist behavior do not regress.
- Runtime adapter tests proving Antigravity activation, native command structure, UI improvement command coverage, plugin manifest references, portable `SKILL.md` wrappers, adapter validation, package validation, and package-root audit mode do not regress.
- Security tests for path traversal, Markdown injection, secret redaction, malformed JSON/JSONL, unsafe static exports, and localhost-only live studio behavior when implemented.

The shared `npm run release:check` gate includes `npm run smoke:studio`. Broken context/session/correction behavior should fail in automation before reaching user testing.

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
- Supabase/Postgres Engineer, Next.js Engineer, Frontend Design Lead, Marketing Copy Lead, Security Reviewer, QA Engineer, Documentation Maintainer, and Deployment/Observability Engineer join based on roster triggers.
- Core changes must use the `core-change` workflow and include Lead Architect in both sequence and council.
- Agent skill routing must include planning, upgrade maintenance, Next.js, Supabase/RLS, Postgres migrations, OWASP, frontend design, marketing copy, accessibility, testing, docs, and deployment skills.
- Frontend skill routing must include content-first design, reference-led design critique, frontend distinctiveness benchmark, frontend product-quality rubric, UI improvement harness, visual regression QA, and accessibility.
- Marketing copy routing must include positioning, conversion copywriting, landing-page copy, product voice/tone, onboarding, and empty-state copy skills.

`agent-kit audit` must fail when the default roster is missing, invalid, lacks required agents, lacks required skill routing, or does not make Planner the default planning agent.

## Messaging And Copy Surface

Installed projects receive `MESSAGING.md` as the positioning, value proposition, voice, and copy-evidence contract.

Required behavior:

- Public-facing or conversion-facing copy changes route through Marketing Copy Lead.
- The marketing-copy workflow records discovery questions, audience, pain, desired outcome, alternatives, differentiator, proof, objections, voice/tone, page or flow copy inventory, CTA hierarchy, and design handoff notes.
- `agent-kit audit` fails when Marketing Copy Lead or the marketing-copy workflow is missing from the default roster.
- `agent-kit audit` warns when `MESSAGING.md` does not capture discovery questions, value-proposition evidence, claim/proof mapping, objections, and CTA hierarchy.
- Risky claims about pricing, privacy, security, compliance, performance, legal, medical, or financial outcomes must be reviewed before release.

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
- UI improvement workflows are defined by `.agent-kit/prompts/ui-command-index.md`, `.agent-kit/checklists/ui-detectors.md`, `.agent-kit/checklists/ui-acceptance-rubric.md`, and `.agent-kit/skills/ui-improvement-harness.md`.
- Meaningful UI audit or polish must classify detector findings by severity and require desktop/mobile screenshots.
- Authenticated or permission-gated UI changes must include signed-in, role, tenant, or permission-state evidence before acceptance.
- `agent-kit audit` warns when `DESIGN.md` lacks content-first design direction, reference-led critique guidance, frontend distinctiveness benchmark evidence, or the product-quality scorecard.
- Provider-neutral design adapters must respect reference sets, anti-references, and source-safety notes.

## Release System

The package is published as a public npm package.

Release workflow requirements:

- GitHub Actions workflow: `.github/workflows/release.yml`
- GitHub environment: `npm-publish`
- Publish trigger: published GitHub Release or manual workflow dispatch with `dry_run=false`
- Publish authentication: npm Trusted Publishing through GitHub Actions OIDC
- Publish command: create a package tarball, attest the SBOM for that tarball, scrub inherited npm token state, then run `npm publish <tarball> --access public` with a token-free npm config
- Public install verification: `npx @appsforgood/next-supabase-kit doctor`

The release workflow must run typecheck, tests, build, dependency audit, SBOM check, install smoke, and package dry run before publishing.

## Security Requirements

- Do not store long-lived npm publish tokens in GitHub Actions.
- Use least-privilege release credentials: OIDC for publish.
- Do not let inherited `NODE_AUTH_TOKEN` or setup-node user config become a publish fallback.
- Keep detailed per-repo research findings out of the public npm package unless separately reviewed.
- Run `npm audit --audit-level=moderate` before publishing.
- Generate a CycloneDX SBOM from `package-lock.json`, upload release evidence, and attest the SBOM for the published tarball.
- Do not record secrets, raw environment values, access tokens, database URLs, private customer data, or hidden model reasoning in project-context, correction, or session files.
- Redact common secret patterns from recorded command output and generated Markdown.
