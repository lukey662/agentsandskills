# Roadmap And Delivery Tracker

This file tracks the phased work needed to turn the kit into a maintained open-source project standard.

Status legend:

- `[x]` Done
- `[ ]` Not started
- `[~]` In progress or partially complete

## Phase 1: Bootstrap Package Repo

- `[x]` Create TypeScript npm package for `@agent-skills/next-supabase-kit`.
- `[x]` Add `agent-kit` CLI entrypoint.
- `[x]` Add installable asset folders: `templates`, `agents`, `skills`, `prompts`, `checklists`, and `design-adapters`.
- `[x]` Add root docs: `README.md`, `DOCS.md`, `SECURITY.md`, `CONTRIBUTING.md`, and `CHANGELOG.md`.
- `[x]` Initialize local git repo on `main`.
- `[x]` Create initial local commit.
- `[x]` Create GitHub repo `lukey662/agentsandskills`.
- `[x]` Push local `main` to GitHub.

Acceptance:

- Local repo exists, package builds, and remote repo is connected.

## Phase 2: CLI Install, Audit, Diff, And Update

- `[x]` Implement `agent-kit init --stack next-supabase`.
- `[x]` Implement conflict-safe template writes.
- `[x]` Track installed state in `.agent-kit/manifest.json`.
- `[x]` Copy library assets into `.agent-kit/`.
- `[x]` Implement `agent-kit audit`.
- `[x]` Implement `agent-kit diff`.
- `[x]` Implement `agent-kit update`.
- `[x]` Implement `agent-kit add skill <name>`.
- `[x]` Implement `agent-kit doctor`.
- `[x]` Add richer stale-template detection using template hashes.
- `[x]` Add machine-readable audit output with `--json`.

Acceptance:

- Existing projects can install the kit without overwriting local docs.
- Audit reports missing docs, security gaps, frontend-design gaps, and testing gaps.

## Phase 3: Core Templates, Agents, Skills, And Checklists

- `[x]` Add downstream templates for `AGENTS.md`, `AGENT_ROSTER.md`, `COUNCIL.md`, `SKILLS.md`, `SPEC.md`, `DECISIONS.md`, `DOCS.md`, `DESIGN.md`, `QUALITY_GATES.md`, `STYLE_GUIDE.md`, `SECURITY.md`, `TESTING.md`, and `DEPLOYMENT.md`.
- `[x]` Add core agents: architect, Next.js, Supabase/Postgres, security, frontend design, QA, docs, deployment, and research.
- `[x]` Add core skills: Next.js App Router, Supabase Auth/RLS, Postgres migrations, OWASP review, content-first design, frontend design, accessibility, testing, docs, and deployment.
- `[x]` Add checklists for OWASP, RLS, brand/content, frontend quality, accessibility, testing, and deployment.
- `[x]` Add example installed output for a sample Next.js/Supabase project.
- `[x]` Add compatibility profiles for SaaS, marketplace, admin app, and content app.

Acceptance:

- A downstream project receives a practical agent/skills/docs setup that another engineer or agent can use immediately.

## Phase 4: Frontend Design Differentiation Foundation

- `[x]` Add anti-generic-AI-site frontend design skill.
- `[x]` Add provider-neutral design adapters for Google Stitch, Claude, Figma, and human designers.
- `[x]` Add frontend-quality checklist.
- `[x]` Add example design briefs for SaaS, admin dashboards, marketplaces, content apps, and tools.
- `[x]` Add audit checks for missing design tokens, missing states, and generic landing-page patterns.
- `[x]` Add screenshot-review prompt for finished UIs.

Acceptance:

- The kit actively prevents generic AI-generated UI defaults and provides reusable design-review workflows.

## Phase 4B: Content-First Creative Design Maturity

- `[x]` Run a focused second-pass review of design identity, visual QA, content-first guidance, and agent-readable design-system repos.
- `[x]` Add `DESIGN.md` as a first-class installed root document.
- `[x]` Add content-first design skill.
- `[x]` Add brand/content intake and creative-direction matrix prompts.
- `[x]` Add brand/content checklist.
- `[x]` Expand vertical design briefs for ecommerce, portfolio/venue, education/course, community/social, and AI workflow products.
- `[x]` Wire Frontend Design Lead to content-first design and creative-direction ownership.
- `[x]` Add audit checks for `DESIGN.md`, content-first style-guide language, and frontend workflow creative-direction outputs.

Acceptance:

- Frontend changes cannot pass as best-practice setup solely because they have tokens, states, and a screenshot prompt; they must also have brand/content inputs and creative-direction evidence.

## Phase 4C: Visual QA And Regression Maturity

- `[x]` Run a focused review of Storybook, Playwright screenshot, Chromatic, Argos, Loki, and component-state testing patterns.
- `[x]` Add visual regression QA skill.
- `[x]` Add visual-regression checklist.
- `[x]` Add visual QA planning prompt.
- `[x]` Update `TESTING.md` with baseline, strong, and mature visual QA tiers.
- `[x]` Wire Frontend Design Lead and QA Engineer to visual QA evidence.
- `[x]` Add audit warning when `TESTING.md` lacks visual QA or visual-regression evidence.
- `[x]` Update research scanner seeds and heuristics for visual-regression signals.

Acceptance:

- Important frontend changes have a documented visual QA tier, and projects can move from screenshot review to Playwright, Storybook, Chromatic, Argos, Loki, or equivalent visual evidence without changing the agent operating model.

## Phase 4D: Schema-Backed Council Traceability

- `[x]` Add JSON Schema contracts for agent rosters and council-session records.
- `[x]` Add `COUNCIL.md` as the installed handoff and council-session evidence template.
- `[x]` Add Agent Handoff Tracing skill, council-session review prompt, and agent-council checklist.
- `[x]` Wire Planner, Lead Architect, and Documentation Maintainer to handoff tracing by default.
- `[x]` Copy `schemas/` into downstream `.agent-kit/` installs.
- `[x]` Add audit checks for missing schema contracts, weak handoff rules, and incomplete `COUNCIL.md` evidence.
- `[x]` Add runtime contract validation for `.agent-kit/agent-roster.json`.
- `[x]` Add optional runtime validation for `.agent-kit/council-sessions/*.json` records.
- `[x]` Add tests that prevent publishing without schema-backed council assets.

Acceptance:

- Multi-agent work is no longer only described in prose. The package installs a machine-readable roster, schema-backed session evidence format, and audit rules that validate roster shape, optional structured session records, and whether core handoff evidence can be captured.

## Phase 4E: Best-Practice Maturity Model

- `[x]` Run a focused follow-up review of production, repository-health, supply-chain, and visual-testing readiness guidance.
- `[x]` Add `QUALITY_GATES.md` as an installed downstream maturity model.
- `[x]` Define baseline, strong, and best-practice evidence levels.
- `[x]` Cover council routing, architecture, security, Supabase/RLS, frontend, accessibility, testing, release, and repo-health evidence.
- `[x]` Add audit checks for incomplete maturity-model coverage.
- `[x]` Add tests that warn when `QUALITY_GATES.md` is hollowed out.
- `[x]` Add project-evidence placeholder warnings so fresh setup is not mistaken for completed maturity evidence.
- `[x]` Add `agent-kit audit --min-readiness <level>` so downstream CI can enforce baseline or best-practice thresholds.
- `[x]` Add `schemas/audit-report.schema.json` so machine-readable audit output has a stable downstream contract.
- `[x]` Record maturity-model research summary and promoted updates.
- `[x]` Add `BEST_PRACTICE_EVIDENCE.md` mapping repeated research findings to concrete installed assets and validation gates.

Acceptance:

- The kit no longer relies on the claim that 100 repos were reviewed. Downstream projects receive an explicit evidence model for what still separates baseline setup from strong delivery and best-practice readiness, and audit warns when starter placeholders remain.

## Phase 4H: Assistant Adapter Activation

- `[x]` Review current AGENTS.md, GitHub Copilot/VS Code instructions, Cursor project rules, and Claude Code subagent surfaces.
- `[x]` Add `ASSISTANT_ADAPTERS.md` as an installed downstream activation tracker.
- `[x]` Add provider-neutral adapter templates in `assistant-adapters/`.
- `[x]` Copy assistant adapters into downstream `.agent-kit/` installs.
- `[x]` Add audit checks for missing adapter templates and weak tool-surface mapping.
- `[x]` Add public-readiness tests for adapter assets and package contents.

Acceptance:

- The kit no longer assumes that a machine-readable roster alone makes agents active. Downstream projects receive concrete adapter templates and an evidence file for verifying that their chosen AI tools load the canonical council instructions.

## Phase 4I: Upgrade Lifecycle Maturity

- `[x]` Review high-signal framework, migration, registry, and tooling upgrade patterns.
- `[x]` Add package-level `UPGRADE.md`.
- `[x]` Add installed downstream `UPGRADE.md`.
- `[x]` Add Upgrade Maintenance skill.
- `[x]` Add upgrade checklist and upgrade-review prompt.
- `[x]` Wire upgrade maintenance into the default council roster.
- `[x]` Add audit checks for diff/update flow, release notes, framework codemods, Supabase migration review, generated types, audit thresholds, and rollback evidence.
- `[x]` Add public-readiness tests for upgrade lifecycle assets.

Acceptance:

- Existing projects have a safe path to adopt future kit, framework, assistant-adapter, and Supabase changes without treating updates as blind overwrites.

## Phase 4J: Reference-Led Frontend Critique

- `[x]` Run a focused follow-up review of design-system, component-primitive, accessibility, and visual-testing repos for frontend critique gaps.
- `[x]` Add Reference-Led Design Critique skill.
- `[x]` Add design-critique gate prompt and checklist.
- `[x]` Update `DESIGN.md` with reference set, anti-references, source-safety notes, and design critique verdict fields.
- `[x]` Wire Frontend Design Lead and frontend-change workflow to reference-set evidence and design critique verdict outputs.
- `[x]` Add audit warnings for missing reference-led critique guidance.
- `[x]` Add public-readiness tests for critique assets and routing.

Acceptance:

- Frontend work cannot be called best-practice merely because it has tokens, states, and screenshots. Significant UI changes must record what references taught, what must not be copied, what anti-references were rejected, and whether the final design is distinctive enough for the product.

## Phase 4K: Frontend Product-Quality Scorecard

- `[x]` Run a focused follow-up review of design-system, service-design, accessibility, component-state, and visual-testing guidance for repeatable frontend acceptance criteria.
- `[x]` Add Frontend Product Quality Rubric skill.
- `[x]` Add frontend product-quality checklist.
- `[x]` Add frontend product-quality scorecard prompt.
- `[x]` Update `DESIGN.md` with scored product-quality dimensions and acceptance thresholds.
- `[x]` Wire Frontend Design Lead and frontend-change workflow to require the scorecard.
- `[x]` Add audit warnings for missing product-quality scorecard guidance.
- `[x]` Add public-readiness tests for product-quality rubric assets and routing.

Acceptance:

- Significant frontend work now has a repeatable acceptance score across user/task fit, content specificity, visual identity, information architecture, component states, accessibility and interaction, and source safety. Best-practice frontend claims require a strong score plus desktop/mobile and visual QA evidence.

## Phase 4L: Frontend Distinctiveness Benchmark

- `[x]` Run a focused follow-up review of design-system, service-design, content, accessibility, and visual-testing guidance for product-specific frontend acceptance evidence.
- `[x]` Add Frontend Distinctiveness Benchmark skill.
- `[x]` Add frontend-distinctiveness checklist and benchmark prompt.
- `[x]` Update `DESIGN.md` with first-screen proof, content fingerprint, reference benchmark, creative divergence, asset provenance, state proof, and visual QA proof fields.
- `[x]` Wire Frontend Design Lead and frontend-change workflow to require distinctiveness benchmark evidence.
- `[x]` Add audit warnings for missing distinctiveness benchmark guidance.
- `[x]` Add public-readiness tests for distinctiveness assets and routing.

Acceptance:

- Significant frontend work cannot pass only because it has clean components, tokens, references, screenshots, and a numeric score. It must also prove the first screen, content, references, assets, states, and visual evidence are specific to the product and not interchangeable AI-site output.

## Phase 4F: Public OSS Repository Health

- `[x]` Review public repository health practices from GitHub docs and high-signal OSS repos.
- `[x]` Add issue forms for bugs, feature requests, and research-promotion proposals.
- `[x]` Add PR template requiring council scope, verification, security, docs, and citation evidence.
- `[x]` Add label source of truth and PR labeler workflow.
- `[x]` Add CODEOWNERS for default review ownership.
- `[x]` Add Dependabot updates for npm and GitHub Actions.
- `[x]` Add CodeQL JavaScript/TypeScript scanning workflow.
- `[x]` Add `CODE_OF_CONDUCT.md`, `SUPPORT.md`, and `GOVERNANCE.md`.
- `[x]` Add `REPOSITORY_SETTINGS.md` for branch protection, release environment, private vulnerability reporting, security settings, discussions, and labels.
- `[x]` Add public-readiness tests for repository health assets.
- `[x]` Add repo-health research scanner signals and refresh category.

Acceptance:

- The repo is maintainable as public OSS, not only publishable as an npm tarball. Contributor intake, labels, branch protection guidance, release environment settings, private vulnerability reporting, review ownership, dependency automation, code scanning, support, governance, and research-promotion flow are explicit and tested.

## Phase 4G: Supply-Chain And Provenance Hardening

- `[x]` Review npm Trusted Publishing/provenance, GitHub Dependency Review, and OpenSSF Scorecard guidance.
- `[x]` Add `SUPPLY_CHAIN.md` with publish identity, release gates, provenance, automation, and maintainer rules.
- `[x]` Add Dependency Review workflow for pull requests.
- `[x]` Add OpenSSF Scorecard workflow with SARIF upload.
- `[x]` Harden existing workflows with explicit concurrency and non-persistent checkout credentials.
- `[x]` Add manual publish ref validation for release workflow dispatches.
- `[x]` Add lockfile-derived CycloneDX SBOM validation to the shared release gate.
- `[x]` Add release-workflow SBOM attestation for the exact npm tarball being published.
- `[x]` Add supply-chain research scanner score and refresh category.
- `[x]` Add public-readiness tests for supply-chain assets and release controls.

Acceptance:

- The repo can explain and verify why the npm package is trustworthy: OIDC publishing, provenance expectations, SBOM attestation, release gates, dependency review, Scorecard, code scanning, dependency update automation, and workflow controls are explicit and tested.

## Phase 5: 100 Repo Research Engine

- `[x]` Add GitHub research config.
- `[x]` Implement `agent-kit research discover`.
- `[x]` Implement `agent-kit research scan`.
- `[x]` Implement static repo scoring.
- `[x]` Generate per-repo findings.
- `[x]` Generate summary stubs.
- `[x]` Generate proposed update brief.
- `[x]` Run discovery for 100 repositories with `GITHUB_TOKEN`.
- `[x]` Review and curate the final 100-repo candidate list.
- `[x]` Run the 100-repo scan.
- `[x]` Manually review generated findings.
- `[x]` Promote repeated patterns into templates, skills, and checklists.
- `[x]` Record research-backed decisions in `DECISIONS.md` or a research summary.

Acceptance:

- v0.1 recommendations are backed by reviewed findings from 100 active open-source repositories, then promoted into installable assets, audit checks, tests, release gates, or documented decisions. Research volume alone does not count as implementation evidence.

## Phase 6: CI, Release, And Package Publishing

- `[x]` Add GitHub Actions workflow.
- `[x]` CI runs `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke:install`, `npm audit --audit-level=moderate`, and `npm pack --dry-run`.
- `[x]` Add `npm run release:check` so local, CI, and release gates share one proof command.
- `[x]` Add `npm run version:check` so package metadata, lockfile metadata, changelog section, and release tag stay aligned.
- `[x]` Add `npm run examples:check` so committed installed-output examples cannot drift from the current built CLI.
- `[x]` Add public scoped package publishing config.
- `[x]` Configure public npm publishing workflow with Trusted Publishing.
- `[x]` Add release workflow and versioning policy.
- `[x]` Run release workflow dry run and confirm publish step is skipped.
- `[x]` Prepare draft GitHub Release `v0.1.0`.
- `[x]` Add reusable post-publish verification script for public `npx` doctor, clean init, and zero-failure audit.
- `[ ]` Publish public v0.1 package.

Acceptance:

- Every pushed change is verified before release through the same release-readiness command maintainers can run locally.
- Package version, lockfile version, changelog section, and release tag are validated before publish.
- Packaged examples are checked against a clean install from the current built CLI before release.
- The package can be installed with `npx @agent-skills/next-supabase-kit`.

## Phase 7: Dogfood On Real Projects

- `[x]` Install into one existing Next.js/Supabase project.
- `[x]` Run `agent-kit audit`.
- `[x]` Record gaps that the audit catches.
- `[x]` Improve templates and audit rules based on real project feedback.
- `[x]` Install into a second project to confirm improvements generalize.
- `[x]` Add contribution process for downstream projects to send improvements back to the kit.
- `[x]` Re-run current built audit read-only against both older installs after schema, adapter, upgrade, maturity, visual QA, and design-critique hardening.
- `[x]` Add public-safe `DOGFOOD.md` with current adoption evidence and keep local-path dogfood notes repo-only.
- `[x]` Add deterministic older-install upgrade regression test for diff preview, conflict-safe update, and zero-failure baseline audit.

Acceptance:

- At least two real projects have installed the kit and contributed improvements back to the base. Current dogfood evidence must also show whether older installs still meet the latest baseline or need an upgrade pass.

## Phase 8: Long-Term Maturity

- `[x]` Add quarterly research refresh workflow.
- `[x]` Add changelog entries tied to research findings.
- `[x]` Add more stack profiles beyond Next.js + Supabase.
- `[x]` Add stronger automation for template diffs and local overrides.
- `[x]` Decide whether and when to open-source the repo.
- `[x]` Complete public release review: license, security, prompts, legal, and third-party citations.

Acceptance:

- The kit becomes a maintained project operating system, not a one-time prompt bundle.

## Current Next Actions

1. Create or claim the npm scope `@agent-skills`.
2. Configure npm Trusted Publishing for package `@agent-skills/next-supabase-kit`: GitHub user `lukey662`, repository `agentsandskills`, workflow `release.yml`, environment `npm-publish`, allowed action `npm publish`.
3. If npm requires the package to exist before trusted publishing can be configured, complete a one-time manual OTP bootstrap publish from the verified `main` checkout.
4. Delete any legacy npm publish secrets after the trusted-publisher path is confirmed.
5. Dispatch the `Release` workflow with `dry_run=false`.
6. Verify public package install with `npm run publish:verify`.
7. Continue Phase 8 maturity work: scheduled research refresh, stronger local override automation, stack expansion, and public-release readiness.

Latest release evidence:

- Package metadata now targets public npm package `@agent-skills/next-supabase-kit`.
- Release workflow uses npm Trusted Publishing/OIDC instead of a long-lived publish token.
- Public install verification uses `npx` without a package token and requires clean temp init plus zero-failure audit.
- Public release remains blocked until the npm `@agent-skills` scope is created or claimed and post-publish install verification succeeds.

Latest dogfood evidence:

- `/Volumes/Mac eSSD/qrcode`: install created five missing root docs, preserved four existing docs as conflicts, audit returned 15 pass / 7 warn / 0 fail.
- `/Volumes/Mac eSSD/AI news`: install preserved all nine existing root docs as conflicts, audit returned 10 pass / 12 warn / 0 fail.

Latest maturity evidence:

- Quarterly research refresh workflow added at `.github/workflows/research-refresh.yml`.
- Public release review added at `PUBLIC_RELEASE_REVIEW.md`; current decision is public-ready after final npm scope and package publication.
- Stack-adaptation profiles added for Next/Firebase, Next/Postgres, and Remix/Supabase.
- Local override automation added through `.agent-kit/overrides.json`.
- Default agent council routing added through `.agent-kit/agent-roster.json`, Planner, Planning and Agent Council skill, and audit enforcement for architect-led core-change handoffs.
- Schema-backed council traceability added through `.agent-kit/schemas/`, `COUNCIL.md`, Agent Handoff Tracing skill, council-session review prompt, agent-council checklist, runtime contract validation, and audit enforcement for handoff evidence.
- Public OSS repo-health layer added through issue forms, PR template, labels, PR labeler, CODEOWNERS, Dependabot, CodeQL, repository settings, support, conduct, governance docs, public-readiness tests, and repo-health research signals.
- Supply-chain hardening added through `SUPPLY_CHAIN.md`, Dependency Review, OpenSSF Scorecard, workflow concurrency, non-persistent checkout credentials, manual publish ref validation, CycloneDX SBOM validation, SBOM attestation, supply-chain scanner scoring, and public-readiness tests.
- Release-readiness automation added through `npm run release:check`, used by CI and release workflows.
- Version discipline added through `npm run version:check`, which validates package metadata, lockfile metadata, changelog section, and release tags.
- Example consistency validation added through `npm run examples:check`, which compares committed example roster, stable manifest fields, audit output, and tree summary against a clean current-CLI install.
- Best-practice maturity model added through `QUALITY_GATES.md`, project-evidence placeholder warnings, minimum-readiness CI gates, audit-report schema contract, audit coverage, tests, and `research/summaries/maturity-model-patterns.md`.
- Upgrade lifecycle maturity added through `UPGRADE.md`, Upgrade Maintenance skill, upgrade checklist, upgrade-review prompt, audit coverage, and `research/summaries/upgrade-lifecycle-patterns.md`.
- Frontend product-quality scorecard added through rubric skill, checklist, prompt, `DESIGN.md` scorecard fields, audit coverage, roster routing, and `research/summaries/frontend-product-quality-rubric-patterns.md`.
- Agent model-routing mechanism added through `MODEL_ROUTING.md`, `.agent-kit/model-routing.json`, `schemas/model-routing.schema.json`, model-selection adapter examples, audit coverage, install/update/diff support, and public-readiness tests.
- Marketing copy maturity added through Marketing Copy Lead, `MESSAGING.md`, positioning/conversion/voice/onboarding copy skills, copy-review prompt, marketing-copy checklist, roster/model routing, and audit coverage for proof, objections, voice, and CTA evidence.
