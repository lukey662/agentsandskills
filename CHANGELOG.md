# Changelog

## 0.1.3

- Added Antigravity runtime adapter support with `agent-kit init --activate antigravity`, `antigravity/plugin.json`, native `/setup`, `/audit`, `/plan`, `/handoff`, `/frontend`, `/security`, `/copy`, `/ship`, and `/upgrade` command files, and portable `runtime-skills/*/SKILL.md` wrappers.
- Added `agent-kit adapter validate` and `agent-kit package validate` so runtime adapter assets, package allowlists, portable skills, examples, and source-package audit behavior are release-gated.
- Fixed package-source audit mode so the source repository validates shipped templates and package assets without requiring installed-project root docs such as `AGENTS.md` or `.agent-kit/manifest.json`.
- Updated development dependencies for TypeScript 6 and Node 25 type coverage, while preserving the package runtime floor at Node 20.
- Hardened GitHub CI by keeping OpenSSF Scorecard write scopes at job level and documenting Dependency Review's dependency-graph requirement.
- Added an `esbuild` override to clear the release-gate dependency audit without downgrading `tsup`.
- Added **`agent-kit init --activate`** for Claude Code (`.claude/agents/*.md`, `CLAUDE.md`), Copilot (`.github/copilot-instructions.md`), and Codex (`.codex/config.toml`) IDE parity.
- Plain **`agent-kit init`** now always creates `.agent-kit/project-context.json` and ships `.github/workflows/agent-kit-audit.yml`.
- Added code-aware audit tier (`project-reality` vs `docs-hygiene`): Supabase migration RLS parsing, test-script verification, and secret-pattern scanning.
- Added **`agent-kit session checkpoint --file`** batch API for council evidence logging.
- Reference `.agent-kit/agent-briefs.md` in all assistant adapters.
- Release workflow supports optional maintainer npm token fallback when trusted publishing returns 404.

## 0.1.2

- Added pixel **Agent Office** as the default `agent-kit setup` view with canvas agents, break-room amenities (coffee, water cooler), agent movement, and high-res floor rendering.
- Added local setup wizard form fallback at `/wizard`, progressive depth (Quick/Standard/Complete), resume state, and agent briefing drafts.
- Fixed setup routing so `/setup` serves the office; added form-to-office navigation, port-in-use CLI warnings, and `data-view` markers for debugging.
- Added **`agent-kit studio serve`** — localhost live session viewer with SSE event stream, speech bubbles, and transcript panel reusing the office canvas.

## 0.1.1

- Completed npm package rename from `@agent-skills/next-supabase-kit` to `@appsforgood/next-supabase-kit` across CLI defaults, shipped docs, templates, examples, tests, and release scripts.
- Fixed Windows post-publish verification to use `npm exec -- agent-kit` so public install checks work with an isolated npm cache.
- Regenerated committed install examples and audit output for the `@appsforgood` package identity.

## 0.1.0

- Initial public package scaffold.
- Added CLI commands for install, audit, diff, update, add skill, doctor, and research workflows.
- Added Next.js + Supabase markdown templates.
- Added core agent roles, skills, prompts, checklists, and provider-neutral design adapters.
- Added CI and public npm release workflows with dry-run validation.
- Added template-hash manifest tracking and `agent-kit audit --json`.
- Added compatibility profiles, product-specific design briefs, screenshot review prompt, and sample installed output.
- Promoted 100-repo research findings from `research/summaries/scan-overview.md` and `research/proposed-updates.md`.
- Promoted downstream dogfood findings from `dogfood/qrcode-audit.md` and `dogfood/ai-news-audit.md`.
- Added npm publish-token preflight and prepared draft GitHub Release `v0.1.0`.
- Fixed package bin metadata so `agent-kit` is preserved during npm publish.
- Replaced publish-token CI authentication with npm Trusted Publishing and optional read-token install verification.
- Added a Planner agent, Planning and Agent Council skill, and machine-readable default council roster enforced by audit.
- Rebranded package for public OSS as `@appsforgood/next-supabase-kit` with MIT license, citation policy, and public-readiness tests.
- Added content-first design, visual QA, schema-backed council traceability, and public OSS repo-health hardening.
- Added issue forms, PR template, CODEOWNERS, Dependabot, CodeQL, support, conduct, governance docs, and repo-health research signals.
- Added label source of truth, PR labeler workflow, and repository-settings checklist for branch protection, release environment, private vulnerability reporting, and required labels.
- Added shared `npm run release:check` gate for local, CI, and release readiness.
- Added version consistency validation for package metadata, lockfile, changelog section, and release tags.
- Added supply-chain hardening with `SUPPLY_CHAIN.md`, Dependency Review, OpenSSF Scorecard, workflow controls, provenance documentation, and supply-chain research signals.
- Added lockfile-derived CycloneDX SBOM validation and release-workflow SBOM attestation for the npm package tarball.
- Added committed example consistency validation so sample install output cannot drift from the current CLI.
- Added `QUALITY_GATES.md` maturity model with audit coverage for baseline, strong, and best-practice evidence.
- Added project-evidence placeholder warnings so fresh setup success is not confused with completed maturity evidence.
- Added audit readiness verdicts: `needs-setup`, `baseline-setup`, `needs-improvement`, and `best-practice-candidate`.
- Added `agent-kit audit --min-readiness <level>` so downstream projects can enforce readiness thresholds in CI.
- Added `schemas/audit-report.schema.json` and runtime audit-report contract tests for machine-readable audit consumers.
- Added `ASSISTANT_ADAPTERS.md` and provider-neutral assistant adapter templates for AGENTS.md-compatible tools, GitHub Copilot/VS Code, Cursor, and Claude Code.
- Added `UPGRADE.md`, upgrade-maintenance skill, upgrade checklist, upgrade-review prompt, and audit coverage for reviewable updates and rollback evidence.
- Added reference-led design critique skill, checklist, prompt, roster routing, and audit coverage so frontend work requires references, anti-references, source-safety notes, and a distinctiveness verdict.
- Added frontend product-quality rubric skill, checklist, prompt, roster routing, audit coverage, and `DESIGN.md` scorecard fields so significant UI work has a repeatable acceptance threshold.
- Added public-safe `DOGFOOD.md` and current read-only dogfood audit refreshes so downstream adoption evidence stays visible as the kit hardens.
- Added older-install upgrade regression coverage proving diff previews missing/conflicting assets, update preserves customized docs, writes conflicts, installs new baseline assets, and audits with zero failures.
- Added reusable post-publish verification script for `npm view`, public `npx doctor`, clean temp `init`, and `audit --json` with zero failures.
- Added model-routing docs, schema, adapter examples, install/update/diff support, and audit warnings for per-agent model-selection setup.
- Added Marketing Copy Lead, `MESSAGING.md`, copywriting skills, copy-review prompt, marketing-copy checklist, roster/model routing, and audit coverage for positioning, proof, objections, voice, and CTA evidence.
- Added automatic assistant adapter rule installation to `.cursor/rules/` during `agent-kit init`, plus activation guidance in `ASSISTANT_ADAPTERS.md`.
- Added `npm run smoke:audit-gate` and CI baseline readiness enforcement with `agent-kit audit --min-readiness baseline-setup`.
- Added [PUBLISH.md](PUBLISH.md) release runbook and [RUNTIME_ORCHESTRATION_SCOPE.md](RUNTIME_ORCHESTRATION_SCOPE.md) for deferred Milestone 9 orchestration work.
- Fixed Windows-safe npm/tar spawning in release and smoke scripts, cross-platform audit path handling for Agent Studio sessions, and cross-platform research scoring path normalization.
