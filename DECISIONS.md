# Decisions

This file records package-level architectural and research decisions for the agent kit.

## 2026-06-02 - Track Research Evidence In Git

### Context

The kit is intended to become a reusable internal standard, not a one-time prompt bundle. Research findings and summaries must be available to future contributors who need to understand why templates and checklists changed.

### Decision

Track `research/repo-candidates.json`, `research/findings/*.md`, `research/summaries/*.md`, and `research/proposed-updates.md` in git. Continue ignoring `research/workdir/` because it contains temporary shallow clones.

### Consequences

Future changes can cite evidence from committed research artifacts. The repository becomes larger, but the added size is acceptable for a 100-repo benchmark.

## 2026-06-02 - Combine Search Discovery With Curated Seeds

### Context

GitHub search alone underfilled security and testing categories and missed several high-signal production, security, and design-system repositories.

### Decision

Use category-balanced GitHub search plus explicit `seedRepos` in `research/scan-config.json`. Keep `excludeRepos` for obvious false positives.

### Consequences

The benchmark remains repeatable while allowing deliberate curation. Curated seeds must be reviewed periodically so the list does not become stale.

## 2026-06-02 - Promote Explicit Inventories Into Templates

### Context

The 100-repo scan found repeated gaps around Supabase/Auth/RLS discoverability, agent handoffs, accessibility signals, and security expectations.

### Decision

Update downstream templates to require explicit inventories for RLS policies, security controls, component states, accessibility checks, tests, and deployment gates.

### Consequences

Installed projects get more operationally useful docs. The templates are slightly more demanding, but the added structure reduces ambiguity for humans and agents.

## 2026-06-02 - Gate Public NPM Publishing Behind Verified Release Checks

### Context

The package is intended to be consumed across multiple projects through a public scoped npm package. Publishing must not happen from normal CI pushes, and first-release validation must prove the workflow can run without long-lived package credentials.

### Decision

Use a dedicated `Release` GitHub Actions workflow. The workflow runs install, typecheck, tests, build, dependency audit, install smoke, and package dry run before publishing. `npm publish --access public` runs only for a published GitHub Release or a manual workflow dispatch with `dry_run=false`.

### Consequences

The release path is repeatable and can be dry-run safely before npm publishing is configured. Actual package publication remains blocked until npm allows the configured release workflow to publish the package.

## 2026-06-03 - Use One Shared Release Readiness Command

### Context

The repo now has local checks, CI checks, release workflow checks, public-readiness tests, install smoke, JSON contracts, and package dry-run requirements. Duplicating those gates across workflow files makes it easier for CI and release behavior to drift.

### Decision

Add `npm run release:check` as the canonical proof command. The command validates key JSON assets, runs typecheck, tests, build, install smoke, dependency audit, and package dry run. CI and release workflows call the same command before publish-sensitive steps.

### Consequences

Maintainers can reproduce the release gate locally before pushing, and workflow changes have a smaller surface area. Any future required publish gate should be added to `scripts/release-check.mjs` first, then covered by public-readiness tests.

## 2026-06-02 - Use NPM Trusted Publishing For CI Releases

### Context

The first npm release attempt reached `npm publish` but failed because token-based CI publishing requires two-factor handling. npm warns that bypass-2FA tokens carry security risk for automation.

### Decision

Use npm Trusted Publishing through GitHub Actions OIDC for package writes. The `Release` workflow grants `id-token: write`, runs from the `npm-publish` environment, publishes without `NODE_AUTH_TOKEN`, and verifies public install with `npx`.

### Consequences

The release process no longer depends on a long-lived npm publish token. The npm package owner must configure a trusted publisher for `lukey662/agentsandskills`, workflow `release.yml`, environment `npm-publish`, and allowed action `npm publish`. If npm requires the package to exist before trusted publishing can be configured, the first package creation still needs a one-time manual publish with OTP or another npm-approved bootstrap path.

## 2026-06-02 - Make Agent Council Routing Auditable

### Context

The kit already installed human-readable `AGENTS.md` and `SKILLS.md`, but that did not guarantee Planner, Lead Architect, Security Reviewer, QA, and documentation handoffs would be used by default.

### Decision

Ship a structured default council roster at `.agent-kit/agent-roster.json`, backed by `rosters/next-supabase-default-council.json`. Add Planner as a first-class agent, add the Planning and Agent Council skill, and make `agent-kit audit` fail when the roster, required agents, required skill routing, or architect-led core-change workflow is missing.

### Consequences

Installed projects now have a machine-readable agent-to-skill and workflow contract. Agents can read the roster to choose the default workflow, and audits can detect drift when a project removes the planner, skips architect review for core changes, or loses required skill routing.

## 2026-06-02 - Prepare A Neutral Public OSS Package

### Context

The kit is useful beyond one organization and should be publishable as a best-practice open-source package. Private package naming, restrictive license text, and detailed per-repo research findings are not appropriate defaults for public distribution.

### Decision

Rename the npm package to `@agent-skills/next-supabase-kit`, publish with public npm access, use the MIT license, and keep public research exposure to generalized summaries, scan methodology, and promoted decisions. Keep detailed per-repo findings out of the public npm package unless separately reviewed.

### Consequences

The package is easier for external projects to adopt and can be installed publicly with `npx`. Maintainers must create or claim the `@agent-skills` npm scope, configure Trusted Publishing for the new package identity, and keep public-readiness tests passing before release.

## 2026-06-02 - Use Template Hashes For Install Drift Detection

### Context

Downstream projects can customize installed markdown files. A simple file-diff check cannot distinguish intentional customization from a project still matching an older bundled template.

### Decision

Record `templateHashes` for every root markdown template in `.agent-kit/manifest.json` during install and update. Audit compares the installed hash, current bundled template hash, and local file hash.

### Consequences

Audits can now report current templates, stale installed templates, older manifests without hashes, and locally customized docs. Existing installs remain compatible, but they should run `agent-kit update` to add hash metadata.

## 2026-06-02 - Ship Project Profiles And Design Briefs As Installable Assets

### Context

The kit should prevent generic AI-generated UI and help agents adapt to different Next.js/Supabase product types without requiring bespoke prompting on every project.

### Decision

Add installable `profiles` for SaaS, marketplace, admin app, and content app projects. Add installable `design-briefs` for SaaS, admin dashboards, marketplaces, content apps, and tools, plus a screenshot-review prompt.

### Consequences

Downstream projects get reusable product-type guidance in `.agent-kit/`. Audit and templates now expect design tokens, component states, and anti-generic landing-page rules to be documented.

## 2026-06-02 - Gate Public Release On Package Verification

### Context

The kit now contains prompts, research summaries, installable assets, and downstream dogfood notes. Public release requires verified package metadata, public install evidence, security guidance, and citation policy.

### Decision

Proceed with public package setup after CI, release dry run, install smoke, and public-readiness tests pass. Keep detailed per-repo findings out of the public npm package unless separately reviewed.

### Consequences

The public package can ship once npm scope setup and post-publish `npx` verification succeed. Public release remains gated by evidence rather than by repository intent alone.

## 2026-06-03 - Make Creative Direction A First-Class Frontend Gate

### Context

The 100-repo scan promoted useful frontend practices around design tokens, component states, accessibility, screenshot review, and anti-generic UI checks. That was not enough to guarantee distinctive product-specific design because the scoring did not strongly require audience, content inventory, brand constraints, or multiple creative directions before implementation.

### Decision

Add `DESIGN.md` as an installed root document and treat it as the persistent design identity and content-direction contract. Add the Content-First Design skill, brand/content intake prompt, creative-direction matrix prompt, brand/content checklist, expanded vertical design briefs, and audit checks for `DESIGN.md` and frontend workflow outputs.

### Consequences

Frontend work now has a stronger acceptance bar: content and brand inputs must exist before styling, the Frontend Design Lead must own creative direction, and audits can warn when projects have only generic style-guide rules. Existing installed projects should run `agent-kit update` and review the new `DESIGN.md` template.

## 2026-06-03 - Require Visual QA Evidence For High-Risk UI Changes

### Context

Screenshots and design review catch many frontend issues, but they are weak if they are one-off, happy-path, or disconnected from CI/review evidence. Mature design-system repos use Storybook stories, visual testing, browser screenshots, and baseline approval to keep UI states stable over time.

### Decision

Add the Visual Regression QA skill, visual-regression checklist, and visual QA planning prompt. Update downstream `TESTING.md` with baseline, strong, and mature visual QA tiers. Add `visual-regression-qa` to the default council routing and make audit warn when `TESTING.md` does not document visual QA or visual-regression evidence.

### Consequences

Projects can still start with manual desktop/mobile screenshot review, but high-risk UI changes now have a path toward Playwright screenshots, Storybook state stories, Chromatic, Argos, Loki, or equivalent visual evidence. Baseline updates must be reviewed intentionally instead of accepted as incidental test churn.

## 2026-06-03 - Make Council Evidence Schema-Backed

### Context

The 100-repo research pass identified useful patterns, but research volume does not prove the kit will behave well in downstream projects. The previous agent council contract was partly machine-readable, but council sessions and handoff evidence could still disappear into chat history.

### Decision

Ship JSON Schema contracts for the default roster and council-session records, install `COUNCIL.md` as the human-readable evidence log, add the Agent Handoff Tracing skill, and audit for schema presence, runtime roster shape, optional structured council-session records, complete handoff rules, and council-session evidence language.

### Consequences

Planner, Lead Architect, and Documentation Maintainer now have explicit handoff tracing responsibilities. Downstream installs receive a durable format for decision, risk, next-handoff, required-output, and verification evidence. Invalid roster shapes and malformed structured session records now fail audit. Existing projects should run `agent-kit update` to receive `COUNCIL.md` and `.agent-kit/schemas/`.

## 2026-06-03 - Add An Evidence-Based Maturity Model

### Context

The 100-repo scan was useful research, but it did not by itself prove that the kit had a best-practice setup. Follow-up review showed that mature projects make readiness visible through evidence across architecture, security, data access, frontend quality, accessibility, testing, release, repository health, and supply chain.

### Decision

Install `QUALITY_GATES.md` as a root downstream template. Define baseline, strong, and best-practice maturity levels, and add audit coverage so a project warns when the maturity model is missing core evidence areas.

### Consequences

Downstream projects have a concrete checklist for what is still missing after initial setup. Research volume no longer counts as completion unless the repeated practice is promoted into templates, skills, checklists, audit checks, tests, release gates, or documented decisions. Existing projects should run `agent-kit update` and review `QUALITY_GATES.md` alongside their local delivery process.

## 2026-06-03 - Treat Repo Health As Release Readiness

### Context

A package can pass build and install checks while still being weak as a public open-source repository. Mature public repos make contributor intake, review ownership, dependency updates, code scanning, support expectations, conduct, and governance discoverable.

### Decision

Add issue forms, PR template, CODEOWNERS, Dependabot, CodeQL, `CODE_OF_CONDUCT.md`, `SUPPORT.md`, and `GOVERNANCE.md`. Add public-readiness tests for these files and add repo-health scoring to the research scanner.

### Consequences

The repo is easier to maintain after publication and contributors have clearer paths for bug reports, reusable feature requests, and research-promotion proposals. Public release readiness now covers repository operations, not only npm packaging.

## 2026-06-03 - Treat Supply-Chain Provenance As Package Trust

### Context

Public npm packages need more than CI and a release workflow. Consumers need evidence that releases come from the expected repository and workflow, dependency changes are reviewed, repository security posture is monitored, and workflow edits are treated as release-risk changes.

### Decision

Document supply-chain controls in `SUPPLY_CHAIN.md`, keep npm Trusted Publishing/OIDC as the publish path, rely on npm's automatic provenance generation for trusted public publishes, add Dependency Review and OpenSSF Scorecard workflows, harden workflow checkout and concurrency behavior, and validate manual publish dispatches run from `main`.

### Consequences

The release path has clearer trust boundaries and public-readiness tests now verify supply-chain assets. Workflow changes require security review because they can affect package provenance and publish integrity.

## 2026-06-03 - Attest A Package SBOM Before Publish

### Context

The release workflow already used Trusted Publishing, dependency audit, Dependency Review, CodeQL, OpenSSF Scorecard, and post-publish `npx` verification. That proved origin and installability, but it did not produce a durable software bill of materials for the exact package artifact. A direct `npm sbom` check also exposed optional-platform dependency edge cases in the current npm dependency graph, so the release gate needed deterministic behavior rather than an opaque package-manager failure.

### Decision

Add `scripts/sbom-check.mjs` to generate and validate a CycloneDX SBOM from `package-lock.json`. Add `npm run sbom:check` to the shared release-readiness gate. Update the release workflow to pack the npm tarball, generate `release-artifacts/sbom.cdx.json`, upload tarball/SBOM/pack metadata as release evidence, attest the SBOM for the exact tarball with GitHub artifact attestations, and publish that same tarball to npm.

### Consequences

Package consumers and maintainers get a release artifact trail that covers provenance and dependency inventory. The SBOM generator fails unresolved required dependency links but permits missing optional-platform links when npm records optional package edges that are not present for the current target. Workflow edits now carry even more release risk because they affect both package provenance and SBOM attestation.

## 2026-06-03 - Treat Packaged Examples As Golden Evidence

### Context

The package includes a compact installed-output example with a roster, manifest, tree summary, and audit output. Those files help users understand what a clean install produces, but they can drift as templates, roster routing, audit messages, and manifest hashes change. JSON parsing and audit-contract tests prove shape, not truth.

### Decision

Add `scripts/example-check.mjs` and `npm run examples:check`. The check builds a clean temp install with the current `dist/index.js`, runs `agent-kit audit --json`, and compares the committed example roster, stable manifest fields, audit output, and tree summary against generated output. Add the check to `npm run release:check` and public-readiness tests.

### Consequences

Packaged examples are now executable release evidence, not hand-maintained illustrative snippets. Contributors who change templates, roster behavior, or audit output must refresh the example files or the shared release gate fails.

## 2026-06-03 - Validate Version Metadata Before Release

### Context

The package already had release workflow checks, changelog entries, a versioning policy in docs, and a draft release. Public npm releases still need an executable guard that catches mismatches between `package.json`, `package-lock.json`, `CHANGELOG.md`, and GitHub release tags before a package is published.

### Decision

Add `scripts/version-check.mjs` and `npm run version:check`. The check validates SemVer shape, package-lock root version alignment, a non-empty changelog section for the package version, and `v<version>` tag matching when the workflow runs from a tag. Add the check to `npm run release:check` and public-readiness tests.

### Consequences

Version and changelog discipline are now enforced locally, in CI, and during release workflows. Maintainers must update package metadata, lockfile metadata, changelog notes, and release tags together.

## 2026-06-03 - Treat Upgrades As A First-Class Lifecycle

### Context

The kit is meant to be reused like an installable package. Initial install and audit are not enough if existing projects cannot safely adopt future template, roster, schema, assistant-adapter, Next.js, or Supabase changes.

### Decision

Add root and downstream `UPGRADE.md` docs, an Upgrade Maintenance skill, upgrade checklist, upgrade-review prompt, and audit checks for diff/update flow, release notes, framework codemods, Supabase migration review, generated types, readiness audit, and rollback evidence.

### Consequences

Downstream projects get an explicit path for reviewing package updates without overwriting local decisions. Upgrade work now routes through planning, architecture, security, QA, docs, and deployment evidence. A project can pass baseline setup after install, but best-practice readiness requires replacing upgrade placeholders with real version, migration, rollback, and verification evidence.

## 2026-06-03 - Add Reference-Led Frontend Critique

### Context

The kit already required content-first design, creative-direction options, design tokens, component states, screenshot review, and visual QA. That reduced generic AI-site output, but a UI could still look derivative or bland if agents treated references as optional inspiration or skipped a written distinctiveness verdict.

### Decision

Add the Reference-Led Design Critique skill, design-critique gate prompt, and design-critique checklist. Update `DESIGN.md` to require a reference set, anti-references, source-safety notes, and a distinctiveness verdict. Wire the Frontend Design Lead and frontend-change workflow to require reference-set evidence and a design critique verdict. Add audit warnings and public-readiness tests so the critique gate remains part of the default setup.

### Consequences

Frontend work must now explain what it learned from references without copying them, what visual tropes it rejected, and why the result belongs to the product. This makes the kit stricter for UI work, but it creates a clearer path away from generic AI-generated pages and toward project-specific design quality.

## 2026-06-03 - Add A Frontend Product-Quality Scorecard

### Context

The kit already required content-first design, reference-led critique, visual QA, design tokens, and component states. That was much stronger than the initial frontend setup, but it still left acceptance too dependent on reviewer taste. A polished UI could satisfy the checklist while still being weak on real user task, content specificity, information architecture, accessibility, or source-safe reference use.

### Decision

Add the Frontend Product Quality Rubric skill, product-quality checklist, and scorecard prompt. Update `DESIGN.md` with a scored acceptance table for user/task fit, content specificity, visual identity, information architecture, component states, accessibility and interaction, and source safety. Wire the Frontend Design Lead and frontend-change workflow to require the scorecard. Add audit warnings and public-readiness tests so the scorecard remains part of the default install.

### Consequences

Frontend acceptance is now more repeatable. Significant UI work can be rejected for named scorecard failures rather than vague taste concerns, and best-practice frontend claims require a stronger score plus desktop/mobile and visual QA evidence. This adds one more evidence artifact for frontend work, but it directly addresses the risk that broad repo research produced guidance without a measurable acceptance threshold.

## 2026-06-03 - Publish Sanitized Dogfood Evidence

### Context

The package already had earlier dogfood notes from two downstream projects, but later hardening made those results stale. Current read-only audits now show both older installs fail the latest setup standard because they predate schema-backed council routing, assistant adapters, maturity gates, upgrade docs, visual QA, and reference-led design critique.

### Decision

Add `DOGFOOD.md` as a public-safe package asset that summarizes project archetypes, current audit counts, readiness levels, and generalized gaps. Keep detailed local-path dogfood notes in `dogfood/` and out of the public npm package. Add public-readiness tests that require dogfood evidence and prevent local paths from leaking into packaged docs.

### Consequences

Consumers can see adoption evidence without receiving private local project details. Stale downstream installs are treated as useful upgrade evidence rather than hidden failures. Public release still requires npm publication and post-publish `npx` verification before the package can claim full public adoption readiness.

## 2026-06-03 - Prove Older Install Upgrades With A Fixture

### Context

Read-only dogfood audits showed that two projects installed before later hardening now fail current setup checks. The docs already told users to run `agent-kit update`, but the package needed a deterministic regression test proving that update can safely move an older install toward the current baseline without overwriting project-owned docs.

### Decision

Add an older-install fixture test. The fixture creates a project with customized root docs and an older manifest that lacks current roster, schema, assistant-adapter, maturity, upgrade, and design-critique assets. The diff path must preview missing docs, changed docs, roster status, missing library folders, and update actions. Running the update path must preserve customized docs, write conflicts for changed templates, install missing baseline docs and `.agent-kit/` assets, refresh manifest metadata, and audit with zero failures.

### Consequences

The package now has executable proof for the upgrade path that real dogfood projects need next. This does not replace branch-based updates in the real projects, but it reduces the risk that current package upgrades break older installs.

## 2026-06-03 - Script Post-Publish Verification

### Context

The release workflow verified the published package with a small inline `npx doctor` command. That proved the binary was reachable, but it did not prove a public install could initialize a clean downstream project and produce a zero-failure audit.

### Decision

Add `scripts/post-publish-verify.mjs` and `npm run publish:verify`. The script waits for `npm view`, runs public `npx doctor`, initializes a clean temp project with the published package, and requires `audit --json` to return zero failures. The release workflow uses this script after publishing.

### Consequences

Post-publish verification is now repeatable locally and in GitHub Actions. Public release remains externally blocked until the npm scope/package exists and the script can run against the registry version.

## 2026-06-03 - Add A Frontend Distinctiveness Benchmark

### Context

The 100-repo scan and follow-up frontend reviews had already promoted content-first design, reference-led critique, visual QA, and a product-quality scorecard. That still left a practical quality gap: a UI could pass many evidence checks while remaining interchangeable with another AI-generated product in the same category.

### Decision

Add the Frontend Distinctiveness Benchmark skill, checklist, and prompt. Update `DESIGN.md` to require first-screen proof, content fingerprint, reference benchmark, creative divergence, asset provenance, state proof, and visual QA proof. Wire the Frontend Design Lead and frontend-change workflow to require distinctiveness benchmark evidence, and add audit/public-readiness tests so the benchmark cannot be dropped silently.

### Consequences

Significant frontend work now has to prove product specificity in addition to polish, accessibility, references, screenshots, and scorecard totals. This makes frontend acceptance more demanding, but it directly addresses the risk that broad research became a checklist without enough force against generic AI-site output.

## 2026-06-03 - Add Agent Model Routing As An AI Mechanism

### Context

The package already installed agent rosters, skills, schemas, assistant adapters, and audit checks. It still lacked a durable way to help users choose models per agent across Codex, Claude Code, Cursor, and GitHub Copilot without pretending every IDE can enforce those choices from repository files.

### Decision

Add `MODEL_ROUTING.md`, `.agent-kit/model-routing.json`, `schemas/model-routing.schema.json`, runtime validation, audit warnings, and model-selection adapter examples. Keep the machine-readable routing provider-neutral and place dated June 2026 model-name comments in adapter setup files.

### Consequences

Downstream projects can now document model selection as a first-class mechanism alongside instructions, roster, skills, tools, hooks, audit, and CI gates. Audit warns when model routing is missing or unverified, but does not fail solely because an IDE only supports advisory model selection.

## 2026-06-07 - Add Marketing Copy As A Default Council Boundary

### Context

The kit already made frontend design stricter through content-first design, reference-led critique, distinctiveness benchmarking, visual QA, and product-quality scoring. Public-facing projects still had a gap: agents could produce generic or unsupported marketing copy while satisfying visual and technical gates.

### Decision

Add Marketing Copy Lead as a default council agent. Install `MESSAGING.md` as the positioning, value proposition, proof, objection, voice, and CTA contract. Add copywriting skills, a marketing-copy checklist, a copy-review prompt, roster routing, model routing, and audit checks for copy workflow coverage and messaging evidence.

### Consequences

Public-facing and conversion-facing copy now has an auditable owner and evidence path before implementation. The package becomes stricter for landing pages, onboarding, empty states, pricing, and CTA work, but it reduces the risk of vague SaaS language, invented proof, unsupported AI claims, dark patterns, or risky compliance and performance claims.

## 2026-06-07 - Make Agent Studio Local And Markdown-First

### Context

The kit installs a strong council roster, skills, assistant adapters, model routing, and council-session evidence templates. The remaining adoption risk is that agents can still be counterproductive when they lack project-specific context or when their collaboration disappears into transient chat windows. Users need to see what agents decided, how they handed work off, and how human corrections change future behavior.

A hosted dashboard, database, or direct AI orchestration layer would add operational and security complexity before the file protocol is proven. It would also make the package harder to adopt in existing projects.

### Decision

Add Phase 9 for a local-first Agent Studio workflow. The first implementation will use `.agent-kit/project-context.json`, `.agent-kit/corrections/*.json`, append-only `.agent-kit/council-sessions/*/events.jsonl`, and generated Markdown session views. IDE agents remain the default actor: they read context and corrections, then record decisions, handoffs, artifacts, verification, and user corrections through CLI helpers or structured file writes.

Do not require SQLite, a hosted service, a background daemon, or model API credentials for the baseline workflow. Direct AI orchestration and live GUI/canvas views are deferred until the JSON/JSONL and Markdown contracts are useful by themselves.

Make automated testing part of the Phase 9 definition of done. The release gate must run the Agent Studio smoke path so guided onboarding, context generation, correction persistence, session logging, Markdown rendering, static export, redaction, and audit behavior are checked before users test changes manually.

### Consequences

Installed projects get faster context capture, inspectable agent collaboration, durable human corrections, and a static local Studio view without adopting another software stack. The package must keep schemas, CLI commands, renderers, adapter instructions, audit checks, and tests aligned so context/session/export files stay valid and secret-safe. The design is less flashy than a full live GUI at first, but it keeps the source of truth reviewable in Git and lets future live studio views render over the same local files.

## 2026-06-07 - Track Required Outputs As Session Events

### Context

Agent Studio sessions already stored required outputs in `session.json`, and audits failed completed sessions when outputs were still missing or partial. Dogfood showed a practical rough edge: users and IDE agents had no CLI command to mark a required output complete or not applicable, so a session could not be closed cleanly without manual JSON edits.

### Decision

Add `agent-kit session output <name...> --status <missing|partial|complete|not-applicable> --evidence <evidence>`. The command updates the matching required output in `session.json` and appends a `required_output_updated` row to `events.jsonl`. The CLI validates status before writing, and the session-event schema requires both `outputName` and `outputStatus` for the new event type.

### Consequences

Required-output status is now visible in rendered Markdown, the static Studio export, and audit evidence. Completed-session checks remain strict without forcing direct JSON edits. Future live UI work can build controls on top of the same command and event shape instead of inventing a separate state store.

## 2026-06-07 - Pin OpenSSF Scorecard And Gate It To Public Repos

### Context

The pushed `OpenSSF Scorecard` workflow failed before running because GitHub could not resolve `ossf/scorecard-action@v2`. After pinning the action, the private repository still failed with `Resource not accessible by integration` while Scorecard tried to inspect commits through GitHub GraphQL. This is a supply-chain workflow, so unresolved actions or private-repo permission failures block release confidence even when package code and CI pass.

### Decision

Pin the workflow to the current published upstream release tag `ossf/scorecard-action@v2.4.3`, and run the Scorecard job only when `github.repository_visibility == 'public'`.

### Consequences

The Scorecard workflow can resolve deterministically on GitHub-hosted runners and will stop failing private-repo pushes for a public-readiness check that cannot publish useful public results yet. When the repo is made public, Scorecard runs automatically again. Future Scorecard upgrades should be explicit workflow changes with normal release-gate review.

## 2026-06-07 - Gate CodeQL Until Code Scanning Is Available

### Context

The pushed `CodeQL` workflow reached analysis but failed because code scanning is not enabled for the private repository. The action reported `Resource not accessible by integration` against the workflow-run API and noted that code scanning must be enabled in repository settings.

### Decision

Run the CodeQL job only when `github.repository_visibility == 'public'`. Keep package security coverage active through `npm run release:check`, dependency audit, SBOM validation, local tests, and the release workflow while the repo remains private.

### Consequences

Private-repo pushes no longer fail on a GitHub code-scanning feature that is unavailable in the current repository settings. CodeQL starts running automatically once the repo is made public. If private GitHub Advanced Security/code scanning is enabled before publication, this gate can be revisited deliberately.
