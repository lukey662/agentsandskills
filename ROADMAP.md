# Roadmap And Delivery Tracker

This file is the source of truth for what to do next. Phases 1–9 are the historical record (package bootstrap through the 0.3 council OS and the 0.4 simplify). **Active work is Phase 10.**

Status legend:

- `[x]` Done
- `[ ]` Not started
- `[~]` In progress or partially complete

How to use this file:

1. Pick the first `[ ]` item in the current wave. Do not skip ahead to orchestration.
2. One item per PR when the change is a skill or agent playbook. Docs-only items can share a PR.
3. Every skill uplift uses the same bar: YAML `name` + `description`, Use when, Do/Checks, Reject, Done when. Tests lock the contract on `init`. Planner names who runs it.
4. Default `init` stays agents + skills + user guide. Do not restore session, Studio, research, or `orchestrate` as the default install.

Playbook bar (what “top class” means here): `nextjs-app-router`, `supabase-auth-rls`, `postgres-migrations`, `owasp-security-review`, `frontend-design`, `accessibility-wcag`, `browser-qa`, and `deslop` already meet it. Thin skills do not.

## Phase 10: 0.4 Kit Quality — Playbooks, Skill Use, Paste Handoff

Goal: the default pack is even. Every default skill is a playbook. Agents name the skill they must run. Workflows stay a **human-run relay** (Planner names the next specialist; you paste). Agents do not spawn each other.

Keep:

- Six default agents, twelve default skills, optional add-ons
- Screenshot fail-closed QA
- Kit charcoal desk off product apps
- One `frontend-design` skill, no design MCP/canvas OS
- Planner does not run the other agents

### Wave 0 — Finish what is in flight

Owner: this branch / PR #38. Merge before starting Wave 1.

- `[~]` Publish `frontend-design` modes (`setup` / `build` / `review` / `detect`), the new-repo **setup interview**, and the `accessibility-wcag` playbook (10.1). Files: `skills/frontend-design/SKILL.md`, `skills/accessibility-wcag/SKILL.md`, `agents/design/agent.md`, `agents/qa/agent.md`, `USER_GUIDE.md` / `USER_GUIDE.html`, tests, examples.
- `[ ]` Cut npm **0.4.4** after #38 merges (`changeset`, Version Packages, `npm run release:check`).
- `[x]` Rewrite this roadmap so remaining work is ticket-shaped (this change).

Acceptance: #38 merged, changelog 0.4.4 on npm, setup paste prompt in the user guide, `accessibility-wcag` playbook installed by `init`.

### Wave 1 — Playbook parity for remaining default skills

Do these in order. Same shape as the 2026-09-09 domain-skill uplift. Structure from public docs and GitHub skill scans; **no third-party skill bodies**.

#### 10.1 `accessibility-wcag` playbook

- **Owner:** Design (writes), QA (must run on screens)
- **Why:** 27-line checklist. Keyboard and contrast are named, but there is no Reject list, no Done-when that fails closed, and no mapping onto App Router forms / dialogs.
- **Do:** Use / Checks / Reject / Done-when. Name WCAG 2.1 AA. Require a keyboard pass in the running browser. Reject “contrast looks fine in the screenshot” without a keyboard pass. Point at `browser-qa` for visual proof.
- **Files:** `skills/accessibility-wcag/SKILL.md`, `agents/qa/agent.md`, `agents/design/agent.md`, `skills/planning/SKILL.md`, `tests/domain-skills.test.ts`, `checklists/` if the existing a11y checklist should match
- **Depends:** Wave 0 (landed on the same in-flight PR)
- **Status:** `[x]`

Acceptance: init installs the playbook; tests lock Reject + keyboard-in-browser; QA and Design still name the skill.

#### 10.2 `testing-qa` playbook

- **Owner:** QA
- **Why:** 29-line checklist. It already says it does not replace domain skills or `browser-qa`. It still lacks Reject, a required command shape, and RLS/auth fail-closed examples.
- **Do:** Use / Checks / Reject / Done-when. Name unit vs regression vs smoke. Reject `toBeVisible` as visual proof. Require auth/RLS tests to fail when another user can read the row. List commands actually run.
- **Files:** `skills/testing-qa/SKILL.md`, `agents/qa/agent.md`, `tests/domain-skills.test.ts`
- **Depends:** 10.1 can land in parallel; do not merge both without a shared test file rebase
- **Status:** `[ ]`

Acceptance: tests lock “does not replace `browser-qa` / `supabase-auth-rls`” and a Reject line; QA agent still requires `testing-qa` plus `browser-qa`.

#### 10.3 `ship` playbook

- **Owner:** QA names it; App engineer / Security contribute env and RLS checks
- **Why:** 22-line checklist. No Reject, no rollback template, no “user-visible needs `browser-qa` evidence” as a fail.
- **Do:** Use / Checks / Reject / Done-when. Go/no-go. Name env, migration order, rollback, secrets, screenshot evidence. Reject “LGTM, ship it” without commands or screenshot paths for UI.
- **Files:** `skills/ship/SKILL.md`, `src/install/roster-adapters.ts` (`/ship`), `USER_GUIDE.md` skill table, `tests/`
- **Depends:** 10.2 (ship should point at the uplifted testing-qa language)
- **Status:** `[ ]`

Acceptance: `/ship` and the skill agree; tests lock rollback + `browser-qa` evidence.

Wave 1 done when: every **default** skill has Use / Reject / Done-when. `wc -l` is not the bar; Reject + Done-when + an init test is.

### Wave 2 — Optional skills: honest playbooks or stay stubs

Optional skills are 10–11 lines. Either uplift or say so in the YAML description (“stub: add only when you have a repeating job”).

#### 10.4 `debug`

- **Owner:** App engineer
- **Do:** Reproduce → localize → reduce → fix → guard. User-visible bugs require before/after `browser-qa`. Reject guessing from the stack trace alone.
- **Files:** `skills/optional/debug/SKILL.md`, `USER_GUIDE.md` “Adding more”
- **Status:** `[ ]`

#### 10.5 `docs`

- **Owner:** optional Docs agent
- **Do:** Update only `USER_GUIDE`, `CHANGELOG`, and the living file the change actually moved. Reject restoring the 17-doc OS.
- **Files:** `skills/optional/docs/SKILL.md`, `agents/optional/docs/agent.md`
- **Status:** `[ ]`

#### 10.6 `upgrade`

- **Owner:** optional
- **Do:** `agent-kit update` on a branch; local edits win; never delete user files. Point at `UPGRADE.md`. Reject `init --force` as the upgrade path.
- **Files:** `skills/optional/upgrade/SKILL.md`, `UPGRADE.md` (link only)
- **Status:** `[ ]`

#### 10.7 `ui-polish`

- **Owner:** Design
- **Do:** After `frontend-design`, not instead of it. If `DESIGN.md` is missing, send Design to `setup` first. Still desktop + mobile.
- **Files:** `skills/optional/ui-polish/SKILL.md`
- **Status:** `[ ]` (partial language already exists; finish Reject / Done-when)

Wave 2 done when: `agent-kit add skill <id>` installs a playbook, not a three-line reminder.

### Wave 3 — Agents know which skill to run, and the relay is paste-ready

This is the “talk to each other” work **without** an orchestrator. Handoff stays: specialist A finishes → user pastes Planner’s prompt into specialist B.

#### 10.8 Planner emits a paste-ready handoff

- **Owner:** Planner
- **Why:** Planner names an owner but does not give the user the prompt to paste. USER_GUIDE has prompts; the agent does not print them.
- **Do:** `planning` Done-when includes a fenced prompt for the owning agent (and extra reviewers). Example: if owner is Design and `DESIGN.md` is missing, print the setup prompt. If owner is QA, print the screenshot prompt.
- **Files:** `skills/planning/SKILL.md`, `agents/planner/agent.md`, `USER_GUIDE.md` (keep prompts in one place; planning copies them)
- **Status:** `[ ]`

Acceptance: a plan reply always contains a copy-paste block the next specialist can run.

#### 10.9 Each agent’s Handoff section names the next paste

- **Owner:** each default agent
- **Do:** After Done-when, say who gets the work next and which USER_GUIDE prompt to paste. App engineer → Security (if auth/data) and QA. Design → Copy (public words) and QA. Copy → Design (visual P0s) then QA. Security → QA.
- **Files:** `agents/*/agent.md`
- **Status:** `[ ]`

Acceptance: no default agent ends with “you do not run the others” without a next paste.

#### 10.10 Skill YAML descriptions that actually trigger

- **Owner:** docs + tests
- **Why:** Cursor matches skills from `description`. Weak descriptions (`Use for…`) lose to a generic chat.
- **Do:** Every default skill description includes the trigger phrases a user would type (`RLS`, “looks generic”, “is this done”, “ship”, “empty state”). Add a test that descriptions are unique and contain Use-when nouns.
- **Files:** each `skills/<id>/SKILL.md` frontmatter, `tests/agent-catalog.test.ts` or a new `tests/skill-frontmatter.test.ts`
- **Status:** `[ ]`

#### 10.11 Copilot role prompts for every specialist

- **Owner:** Copilot adapter
- **Why:** Copilot has no `@agent` picker. Today the generated instructions only paste a QA prompt.
- **Do:** `.github/copilot-instructions.md` (from `roster-adapters.ts`) includes one paste block per default agent, matching USER_GUIDE.
- **Files:** `src/install/roster-adapters.ts`, `tests/ide-activate.test.ts`
- **Status:** `[ ]`

#### 10.12 USER_GUIDE workflow as one sequence

- **Owner:** Copy + Design (kit HTML)
- **Do:** Keep the charcoal desk. Make “New feature” show the relay: Plan → implement → Security if needed → Design if UI → Copy if public words → QA. Each step already has a paste; do not add a fourth ticket to the first viewport unless it is the next user action.
- **Files:** `USER_GUIDE.md`, `USER_GUIDE.html`, `npm run smoke:ui-screens`
- **Status:** `[ ]`

Wave 3 done when: a new user can run a feature without inventing prompts, and Copilot can play any specialist from the generated file.

### Wave 4 — Decision gate: stay a relay, or add optional auto-handoff

Do **not** start until Waves 1–3 are done. This is a product decision, not a default.

- `[ ]` **Decide and record in `DECISIONS.md`:** stay paste-relay (recommended) **or** ship optional auto-handoff.
- If paste-relay: stop. Wave 3 is the coordination model.
- If auto-handoff: optional only (`agent-kit add` or activate flag). Must not run on plain `init`. Must not restore Studio, session ledger, or LangGraph as the default. A thin runner that prints “now paste this to @qa” is in scope; spawning six subagents in one chat is out of scope unless a later decision says otherwise.

### Wave 5 — Later (after 10.1–10.11)

- `[ ]` Re-scan GitHub for `product-copy` / ship / a11y skill structure (structure only).
- `[ ]` Dogfood Wave 1–3 on one real Next.js + Supabase app: Planner → App engineer → Design setup or review → QA. Record where the model still skipped a named skill.
- `[ ]` Promote those skips into Reject lines or stronger descriptions.
- `[ ]` Keep npm Trusted Publisher records current; run `release:check` on the 0.4.4 cut.

### Not doing (unless Wave 4 says otherwise)

- Restoring 17 living docs, `QUALITY_GATES.md`, or `COUNCIL.md` on default `init`
- A design MCP, canvas CLI, or slash-command marketplace
- Splitting `frontend-design` back into six critique skills
- Making Planner implement, or making one chat play all six roles
- Treating `agent-kit orchestrate` as required for a “good kit”

## Historical record (Phases 1–9)

These phases built the package, the council OS, research, Studio, and the 0.4 simplify. They stay for traceability. Do not reopen them as current work.

## Phase 1: Bootstrap Package Repo

- `[x]` Create TypeScript npm package for `@appsforgood/next-supabase-kit`.
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
- `[x]` Pass `npm run release:check` locally with Cursor adapter install, baseline audit gate smoke, install smoke, and npm pack dry run.
- `[x]` Add [PUBLISH.md](PUBLISH.md) release runbook for GitHub Release, workflow dispatch, and maintainer-local fallback publish.
- `[x]` Publish public v0.1 package to npm as `@appsforgood/next-supabase-kit@0.1.0`.
- `[x]` Run `npm run publish:verify` after the package is visible on npm.

Acceptance:

- Every pushed change is verified before release through the same release-readiness command maintainers can run locally.
- Package version, lockfile version, changelog section, and release tag are validated before publish.
- Packaged examples are checked against a clean install from the current built CLI before release.
- The package can be installed with `npx @appsforgood/next-supabase-kit`.

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

## Phase 9: Guided Context And Markdown Agent Studio

- `[x]` Add `AGENT_STUDIO_PLAN.md` as the detailed implementation plan for project-context onboarding, council-session observability, human corrections, and optional local studio UI.
- `[x]` Add local-first project context contracts: `.agent-kit/project-context.json`, `.agent-kit/project-context.md`, and `schemas/project-context.schema.json`.
- `[x]` Implement guided onboarding commands: `agent-kit onboard`, `agent-kit context scan`, `agent-kit context ask`, `agent-kit context render`, and `agent-kit init --guided`.
- `[x]` Add correction contracts and commands for session, project, agent, and upstream-proposal scopes under `.agent-kit/corrections/`.
- `[x]` Add append-only council-session event logging under `.agent-kit/council-sessions/<session-id>/events.jsonl`.
- `[x]` Implement session commands: `start`, `list`, `active`, `note`, `decision`, `handoff`, `correct`, `artifact`, `verify`, `output`, `render`, and `close`.
- `[x]` Render session `index.md` and `transcript.md` from JSON/JSONL, including Mermaid handoff graphs, decisions, risks, human corrections, artifacts, verification, and next actions.
- `[x]` Update installed `AGENTS.md`, `ASSISTANT_ADAPTERS.md`, `COUNCIL.md`, `QUALITY_GATES.md`, `SKILLS.md`, and Agent Handoff Tracing skill so IDE agents read project context and corrections before meaningful work.
- `[x]` Add audit checks for missing or malformed project context, correction files, active sessions, unrendered session events, and completed sessions without required outputs or verification.
- `[x]` Add automated test coverage for schema validation, JSONL parsing, Markdown rendering, correction promotion, secret redaction, path traversal rejection, old-install update behavior, fixture projects, golden outputs, and smoke onboarding.
- `[x]` Add `npm run smoke:studio` and wire it into `npm run release:check` before any Agent Studio feature is marked complete.
- `[x]` Add optional `agent-kit studio export` static HTML view after the Markdown-first workflow is useful.
- `[x]` Add `agent-kit studio serve` — localhost live office with SSE session events, session picker, note/render POST endpoints, and interactive studio controls (Milestone 8 complete).
- `[x]` Ship optional direct orchestration as `@appsforgood/agent-kit-runtime`, reusing the roster and event contracts with LangGraph checkpoints, explicit approvals, isolated worktrees, Docker-first tools, provider/MCP adapters, bounded execution, and redacted evidence.

Acceptance:

- A new project can install the kit, answer a short guided intake, and produce useful local context without a database, hosted service, or model API key.
- A meaningful multi-agent task can be recorded as local JSON/JSONL and rendered to readable Markdown that shows agent messages, decisions, handoffs, risks, corrections, artifacts, verification, and next actions.
- Human corrections can be promoted into durable project or agent rules and loaded by future IDE-agent work.
- Audit can distinguish a generic baseline install from a context-aware install with active session evidence.
- The Markdown-first flow works without SQLite, a web server, or a separate AI orchestration runtime.
- Projects that opt into executable orchestration can validate, plan, run, pause, resume, cancel, and export a council workflow without changing the baseline IDE-driven contract.
- Every completed Phase 9 feature is covered by automated unit, regression, smoke, and security tests, and the shared release gate fails before users see broken context/session/correction behavior.

## Current Next Actions

Work Phase 10 in order. First open `[ ]` after this PR:

1. Merge PR #38 (frontend-design modes + setup interview + `accessibility-wcag` playbook), then cut npm 0.4.4.
2. **10.2** Uplift `testing-qa`.
3. **10.3** Uplift `ship`.
4. Then Wave 2 optional skills, then Wave 3 paste-ready handoff. Do not start Wave 4 (orchestrator decision) until then.

Historical next-actions below (Trusted Publisher, orchestrate dogfood, 0.3 council) are **not** the 0.4 default queue. See Wave 5 and Phase 6 evidence if you are cutting a release.

Latest release evidence:

- Package metadata targets public npm packages `@appsforgood/next-supabase-kit` and `@appsforgood/agent-kit-runtime`.
- Release workflow uses npm Trusted Publishing/OIDC instead of a long-lived automation token.
- Public verification installs the runtime, imports its API, then installs the root kit and proves clean `doctor`, `init`, `audit`, and `orchestrate validate` behavior.
- Separate CycloneDX SBOMs and attestations bind each published tarball to its own reachable dependency graph.

Latest dogfood evidence:

- `/Volumes/Mac eSSD/qrcode`: install created five missing root docs, preserved four existing docs as conflicts, audit returned 15 pass / 7 warn / 0 fail.
- `/Volumes/Mac eSSD/AI news`: install preserved all nine existing root docs as conflicts, audit returned 10 pass / 12 warn / 0 fail.
- Content/admin real-project Agent Studio dogfood: current CLI update/onboard/session/render/static export completed, rough edge promoted into `agent-kit session output`, final audit returned 52 pass / 19 warn / 0 fail with `baseline-setup`, completed rendered session, and 14 valid events.

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
