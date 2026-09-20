# Dogfood Evidence

This file is the public-safe summary of downstream adoption evidence. Detailed local-path notes live in `dogfood/` and are intentionally excluded from the npm package.

## Evidence Rule

- Dogfood evidence must run against the current built CLI, not an older remembered result.
- Real-project audits may fail. Failure is useful when it proves the kit catches setup drift.
- Public summaries use project archetypes instead of local paths or private project details.
- A dogfood item only counts as promoted when it leads to an installed asset, audit check, test, release gate, or documented decision.

## 2026-09-20 Source Cleanup And Native IDE Adapters (0.5.0, second pass)

Date: 2026-09-20
CLI source: this branch (0.5.0 changeset).
Commands: `npm run release:check` passed in 11s (was 22s with the runtime workspace build): typecheck, lint, format, 101 tests with coverage 83/65/86/86, build, package and adapter validation, example fixture check, `dogfood:check` (6 agents × 5 hosts, 12 skills), install smoke, doctor gate, audit, SBOM (2 components, was 32), pack dry run.

Removed from the source tree: `src/studio/`, `src/research/`, `src/install/{audit,audit-v2,diff,assistant-adapters-table}.ts`, `audit-rules/`, `config/contracts.ts`, 14 quarantined tests, 4 scripts, the research-refresh workflow, `packages/runtime` (tagged `runtime-0.1.3`), four runtime dependencies, root `checklists/ prompts/ profiles/ design-briefs/ design-adapters/ rosters/ model-routing/ schemas/ antigravity/ dogfood/ docs/`, 101 research findings, 20 dead templates, 14 dead adapter files, 7 council root docs. `ROADMAP.md` went from 663 lines to 27.

Install layout after this pass (`init --activate all` in a temp dir): `.agents/skills/` (12), `.claude/skills/` (12), `.cursor/agents/` (6, Planner `readonly: true`), `.claude/agents/` (6, real tool names, `skills:` preloaded, `effort: high` ×3), `.codex/agents/` (6), `.github/agents/*.agent.md` (6), `.agents/agents/*/agent.md` (6, `subagent: true`), `.agents/rules/agent-kit.md`. No `.cursor/skills/`, no `.antigravity/`, no repo-root `skills/`. `update --prune-legacy` on this repo removed the 0.4 `.cursor/skills/*` copies and `.antigravity/`.

Bug fixed that tests now guard: every 0.4 `.claude/agents/*.md` carried `tools: [repo, edit, terminal, browser]`, which Claude Code (v2.1.208+) refuses to launch because none resolve. `tests/adapter-frontmatter.test.ts` and `doctor` reject the kit vocabulary in a Claude file.

`USER_GUIDE.html` changed in the IDE section, the Start paragraph, and four troubleshooting rows. The rendered 0.5 QA subagent captured desktop and mobile with Playwright, read element crops of the IDE section, Copilot card, troubleshooting table, and first viewport on both viewports, and returned accept-with-nits: console none, same-origin none, skip link first with a visible 3px outline on all twelve tabbed elements, `copilot --agent=qa` unbroken at 390px. Nits are pre-existing (five cards in a two-column grid leave Antigravity alone; Copy buttons cannot reach the clipboard under `file://`) and were not fixed in this pass. Evidence: `qa-evidence/2026-09-20-user-guide-ide/desktop.png`, `mobile.png`, `notes.md`.

Not verified live: Cursor listing each agent once when `.cursor/agents`, `.claude/agents`, and `.codex/agents` all exist (Cursor reads all three); Claude, Codex, Copilot, and Antigravity actually launching the rendered agents. Their frontmatter matches the documented schemas by test. Both items are in `ROADMAP.md`.

## 2026-09-20 Council Residue Removed (0.5.0)

Date: 2026-09-20
CLI source: this branch (0.5.0 changeset).
Commands: `npm run release:check` (typecheck, lint, format, 93 tests with coverage gate, build, package validate, adapter validate, examples check, dogfood drift check, install smoke, doctor gate, audit, SBOM, pack dry runs) passed.

What this repo's Cursor session loaded for a design task, in words (tokens ≈ words × 1.35):

| Layer | Before | After |
| --- | --- | --- |
| Always-on rules (`.cursor/rules/*.mdc`) | 363 (0.3 council rule + model-selection rule) | 84 (0.4 rule) |
| Planner reached via `@planner` | 0.3 council stub that told the model to read seven council docs: ~5,440 words | 0.4 Planner: 380 |
| Design path: Design agent + `frontend-design` + `accessibility-wcag` + `browser-qa` (+ `deslop` for the P0 list) | 5,490 | 3,854 (`deslop` no longer needed for pixels) |
| 0.3 design skills also triggered (`content-first-design`, `frontend-design-system`, `frontend-distinctiveness-benchmark`, `frontend-product-quality-rubric`, `reference-led-design-critique`, `visual-regression-qa`) | ~2,200 (estimate from three files read before deletion; the tracked `runtime-skills/` copies were shorter wrappers) | 0 |
| Design task total, this repo | ~13,500 | ~4,300 |
| All 12 default skills + 6 default agents (what a fresh downstream install ships) | 11,754 | 10,388 |
| `frontend-design` alone | 2,581 | 1,944 |
| `AGENTS.md` template (loaded once per context) | 268 | 673 (adds the ask policy and eight payloads that used to be copied into nine files) |

Structural checks that now run on every `release:check`: rendered layers byte-equal canonical (`tests/rendered-drift.test.ts`), every payload and the ask policy equal `catalog.json` (`tests/payloads.test.ts`), no kit palette or scan notes in shipped files (`tests/no-kit-content.test.ts`), council stubs fail `doctor` and `--prune-legacy` removes only its allowlist (`tests/doctor-legacy.test.ts`), this repo's installed copies match canonical (`npm run dogfood:check`).

`update --prune-legacy` on this repo removed 60 paths, all on the allowlist; the plan is in `DECISIONS.md` (2026-09-20). `doctor` went from passing while `@planner` was a 0.3 stub, to passing with the 0.4 Planner installed.

`USER_GUIDE.html` changed in two skill-table rows and the update/troubleshooting text. Live dogfood: the 0.4 `planner` subagent named owner `copy` with Cursor Task type `"copy"`, reviewer `qa`, took the payload from `AGENTS.md` → Spawn payloads, and asked nothing the repo answered. The 0.4 `qa` subagent returned accept-with-nits from Playwright desktop and mobile captures, console none, same-origin none, skip link first with a visible 3px outline; the one nit (a `--prune-legacy` flag breaking after the dashes at 390px) was fixed with a scoped `code.flag { white-space: nowrap }` and the captures were redone. Evidence: `qa-evidence/2026-09-20-user-guide/desktop.png`, `mobile.png`, `notes.md`.

What this does not prove: output quality of the rewritten `frontend-design` on a real downstream product screen. That needs an external Next.js + Supabase dogfood, as before.

## 2026-09-18 Pack Status

Date: 2026-09-18
CLI source: public npm `@appsforgood/next-supabase-kit@0.4.9` plus this branch’s Wave 5 playbooks (0.4.10 changeset).

- Default `init` is agents, skills, and the user guide. After init, say the change once; the session launches specialists. Paste-relay is retired.
- Product-app dogfood (Planner → owner → Design → QA) runs **outside this repository**. Kit-repo-only: do not add product apps here. Skip-intake PRs wait for those findings.
- npm Trusted Publishing published 0.4.9 with provenance. GitHub release `v0.4.9` exists. Later Release runs must not republish a staged version.

## 2026-06-03 Read-Only Audit Snapshot (historical)

Date: 2026-06-03
CLI source: `dist/index.js` from that day. The `audit` command left the tree in 0.5.0; this table is not a current gate.
Command then: `node dist/index.js audit --json`
Mode: read-only audit; no downstream files were modified.

| Project Archetype | Summary | Readiness | Highest-Value Gaps Caught |
| --- | --- | --- | --- |
| SaaS/tool hybrid | 11 pass, 20 warn, 7 fail | `needs-setup` | Missing `.agent-kit/agent-roster.json`, schema contracts, `AGENT_ROSTER.md`, `ASSISTANT_ADAPTERS.md`, `COUNCIL.md`, `DESIGN.md`, `QUALITY_GATES.md`, `UPGRADE.md`, assistant adapters, visual QA evidence, reference-led design critique, and stale templates. |
| Content/admin hybrid | 11 pass, 20 warn, 7 fail | `needs-setup` | Missing `.agent-kit/agent-roster.json`, schema contracts, `AGENT_ROSTER.md`, `ASSISTANT_ADAPTERS.md`, `COUNCIL.md`, `DESIGN.md`, `QUALITY_GATES.md`, `UPGRADE.md`, assistant adapters, visual QA evidence, reference-led design critique, and stale/customized templates. |

## What The 2026-06 Audit Snapshot Proved Then

- The 0.3 `audit` CLI distinguished older valid installs from that day's best-practice setup.
- Those runs flagged schema-backed council routing, assistant activation, maturity gates, upgrade lifecycle, visual QA, and reference-led frontend critique. That command is gone; 0.5.0 uses `doctor`, adapter validate, and `release:check` instead.
- Real projects installed before later hardening still need `agent-kit update` and conflict review. Do not re-run `audit --json` against the current CLI.

## What This Does Not Prove

- These two 2026-06 projects are not yet best-practice candidates under the current 0.4 pack (they still reflect the older 17-doc audit).
- External Next.js + Supabase spawn-handoff dogfood is not recorded here yet. Skip-intake stays parked until those skips arrive.
- Historical snapshots below (0.1.x) stay for traceability. They do not describe the current default install.

## 2026-07-04 Publish @0.1.8 Snapshot

Date: 2026-07-04
CLI source: local `dist/index.js` after `npm run release:check`

- Setup-server API route coverage (`tests/setup-server-api.test.ts`), Playwright UI screenshot smoke (`smoke:ui-screens`, Playwright 1.55.1), and Agent Studio Milestone 8 completion (note/render POST endpoints, session picker, live office controls).
- `readJsonBody` shared between setup and studio servers; oversized bodies return 400 without dropping the connection; studio SSE broadcasts notes.
- Dedicated Ubuntu CI job for UI screenshots; not part of `release:check` matrix.
- Local verification: `release:check` green (150 tests, setup-server.ts 86% statements), `smoke:ui-screens` produced 4 PNGs.
- Published `@appsforgood/next-supabase-kit@0.1.8`; `publish:verify` passed against live registry.

## 2026-07-04 Publish @0.1.7 Snapshot

Date: 2026-07-04
CLI source: public npm registry `@appsforgood/next-supabase-kit@0.1.7`

- Published `@appsforgood/next-supabase-kit@0.1.7` with lifecycle README commands, `/spec`/`/test`/`/review` Antigravity adapters, and `prompts/lifecycle-command-index.md`.
- Post-publish: `npm run publish:verify` against live registry.

## 2026-07-04 Publish @0.1.6 Snapshot

Date: 2026-07-04
CLI source: public npm registry `@appsforgood/next-supabase-kit@0.1.6`
Mode: local maintainer publish (token) after `npm run release:check`, then `npm run publish:verify`.

- Published `@appsforgood/next-supabase-kit@0.1.6` to public npm (local token publish with `--provenance=false`; CI releases continue to use OIDC + provenance).
- `npm run publish:verify` passed: registry visibility confirmed, `npx` doctor ok, clean temp `init` installed current baseline assets, and `audit --json --min-readiness baseline-setup` returned 0 failures (67 pass / 4 warn / readiness `baseline-setup`).

## 2026-07-02 Publish Verification And Self-Install Snapshot

Date: 2026-07-02
CLI source: public npm registry (`@appsforgood/next-supabase-kit`, published) plus local `src/` for the self-install.
Mode: post-publish verification against the live registry, and dogfooding the kit into this repo's own root.

- `node scripts/post-publish-verify.mjs` against the published package passed: registry visibility confirmed, `npx` doctor ok, clean temp `init` installed 23 files, and `audit --json --min-readiness baseline-setup` returned 0 failures (readiness `baseline-setup`).
- This repo now dogfoods its own kit at the root: `agent-kit init` installed the root docs, `.agent-kit/`, and Cursor rules; project context, council session, and overrides were filled with real evidence; `agent-kit audit --min-readiness best-practice-candidate` passes with 0 warnings and 0 failures.

## 2026-06-07 Agent Studio Dogfood Snapshot

Date: 2026-06-07
CLI source: current `dist/index.js`
Mode: downstream update, guided context generation, session recording, static Studio export, and final audit.

| Project Archetype | Stage | Summary | Readiness | Notes |
| --- | --- | --- | --- | --- |
| Content/admin hybrid | Before update | 11 pass, 31 warn, 8 fail | `needs-setup` | Older partial install was missing current roster, schemas, docs, context, and Agent Studio assets. |
| Content/admin hybrid | After update/onboard/export | 54 pass, 17 warn, 0 fail | `baseline-setup` | `agent-kit update` preserved customized docs through `.agent-kit/conflicts/`; `onboard`, session render, and `studio export` worked locally. |
| Content/admin hybrid | After `session output` fix and completed session | 52 pass, 19 warn, 0 fail | `baseline-setup` | Completed planning session has all required outputs marked complete, verification recorded, rendered Markdown current, static Studio export regenerated, and 14 valid Agent Studio events. Extra warnings reflect template changes made during this fix and remaining project-specific evidence gaps. |

### Finding Promoted Back Into The Kit

Dogfood exposed that sessions could define required outputs but lacked a CLI command to update their status. The fix adds `agent-kit session output <name...> --status <missing|partial|complete|not-applicable> --evidence <evidence>`, a `required_output_updated` event type, renderer/static-export support, CLI smoke coverage, and completed-session regression tests.

### Remaining Dogfood Gaps

- Project context still needs real product summary, audience, workflows, auth/tenant model, UI direction, value proposition, and quality target answers.
- Assistant adapter rows still need active-tool verification evidence in downstream projects beyond the kit repo itself.
- Project-owned docs need conflict review before adopting newer template wording.
- A real UI change still needs reference-led design critique and desktop/mobile visual QA evidence.
- Public npm publish and `npm run publish:verify` still need maintainer release execution. See [PUBLISH.md](PUBLISH.md).

## 2026-06-07 Release Gate Snapshot

Date: 2026-06-07
CLI source: current built CLI
Command: `npm run release:check`
Result: passed locally on Windows after assistant adapter install on init, baseline audit gate smoke, install smoke, Agent Studio smoke, SBOM check, and npm pack dry run.

| Gate | Result |
| --- | --- | --- |
| Tests | 65 passed |
| Example install shape | `baseline-setup`, 0 failures |
| Install smoke | IDE adapter rules installed, `baseline-setup`, 0 failures |
| Agent Studio smoke | `baseline-setup`, 0 failures |
| Baseline audit gate smoke | `baseline-setup`, 0 failures |
| npm pack dry run | `@appsforgood/next-supabase-kit@0.1.1` tarball validated |

Remaining publish action: execute [PUBLISH.md](PUBLISH.md), then run `npm run publish:verify`.

## 2026-06-07 Assistant Adapter Activation On Init

Date: 2026-06-07
CLI source: current built CLI
Mode: init-time assistant adapter rule installation for downstream projects.

| Surface | Path | Status | Evidence |
| --- | --- | --- | --- |
| Downstream init | `.cursor/rules/cursor-agent-kit.mdc` | Active on `agent-kit init` | `smoke:install`, `smoke:audit-gate`, and `tests/update.test.ts` verify rule installation. |
| Downstream init | `.cursor/rules/cursor-model-selection.mdc` | Active on `agent-kit init` | Same smoke and update coverage as council rule. |
| Template docs | `ASSISTANT_ADAPTERS.md` | Updated | Adapter activation steps and init-time install behavior documented for downstream projects. |

## Promotion Back Into The Kit

| Dogfood Finding | Promoted Kit Behavior |
| --- | --- |
| Older installs drift as the package improves. | Template hashes, `agent-kit diff`, `agent-kit update`, `UPGRADE.md`, upgrade checklist, and upgrade audit warnings. |
| Existing project docs vary and must be preserved. | Conflict-safe writes and `.agent-kit/overrides.json`. |
| Agent instructions can exist without machine-readable council routing. | `.agent-kit/agent-roster.json`, roster schema validation, and council-session evidence. |
| AI tool activation cannot be assumed from `AGENTS.md` alone. | `ASSISTANT_ADAPTERS.md` and `.agent-kit/assistant-adapters/`. |
| Frontend docs can miss product-specific design evidence. | `DESIGN.md`, content-first design skill, reference-led design critique, visual QA tiers, and screenshot review. |
| Required session outputs were hard to complete without manual JSON edits. | `agent-kit session output`, `required_output_updated` events, renderer/export support, and completed-session audit coverage. |

## Upgrade Regression Fixture

The package also includes a deterministic test for an older install shape:

- Older install has customized root docs and no current roster, schemas, assistant adapters, `DESIGN.md`, `QUALITY_GATES.md`, or `UPGRADE.md`.
- `agent-kit update` behavior preserves customized docs and writes new template versions into `.agent-kit/conflicts/`.
- `agent-kit diff` previews missing docs, changed docs, roster status, missing library folders, files update would create, and files update would write to conflicts.
- Missing current baseline docs and `.agent-kit/agent-roster.json` are added.
- `.agent-kit/schemas/`, `.agent-kit/assistant-adapters/`, and the reference-led design critique skill are installed.
- The upgraded fixture audits with `0` failures and readiness `baseline-setup`.

Covered by `tests/update.test.ts`.

## Next Dogfood Passes

- Review generated conflicts in the dogfood project and decide which project-owned docs should adopt the latest template wording.
- Run `agent-kit update` on another real project on a dedicated branch and record conflict-review outcomes.
- Activate at least one assistant adapter in a real project and record whether the chosen tool loads the canonical council instructions.
- Apply the reference-led design critique gate to one real frontend change with desktop/mobile screenshot evidence.
- After public publish, run `npm run publish:verify` to verify registry visibility, public `npx doctor`, clean temp `init`, and adapter validate.

## BaseRepo Maintainer Dogfood Policy

Date: 2026-06-17
Policy: **gitignored local overlay + bootstrap script** (not committed to kit source)

| Item | Detail |
| --- | --- |
| Bootstrap | `npm run dogfood:init` runs `agent-kit init --stack next-supabase --activate cursor --activate codex` against the repo root |
| Gitignore | `.agent-kit/`, `.codex/`, init-generated council docs at repo root, and local pack tarballs — see `.gitignore` and [DOCS.md](DOCS.md#maintainer-dogfood) |
| Validation | `node dist/index.js adapter validate cursor\|codex` after bootstrap |
| Release evidence | [MAINTAINER_RELEASE.md](MAINTAINER_RELEASE.md) session checklist; loop patterns in [LOOP_CODING.md](LOOP_CODING.md) |
| Rationale | Kit source stays in `templates/` and tracked maintainer docs; overlay proves Tier B activation without polluting commit history |

This policy closes the gap where the kit shipped Level 5 IDE surfaces but BaseRepo maintainers operated at Level 4 day-to-day.

## 2026-07-04 - Lifecycle Commands README Parity

Date: 2026-07-04
Scope: README/docs discoverability + three new Antigravity adapters

| Item | Detail |
| --- | --- |
| README | Added **Workflow Commands** section: lifecycle diagram, 12 core + 8 UI slash commands, council table, skills-by-phase, skill activation narrative |
| Canonical index | `prompts/lifecycle-command-index.md` for delivery commands (parallel to `prompts/ui-command-index.md`) |
| New adapters | `/spec`, `/test`, `/review` in `antigravity/commands/` (20 total native commands) |
| Roster | `testing` and `code-review` workflows; planning triggers for spec keywords |
| Historical scope | `/build`, `/webperf`, `/code-simplify`, and `/build auto` were deferred in this 0.1.7 review; the later runtime ships bounded roster workflows rather than cloning those command semantics |
| Verification | `npm test`, `agent-kit adapter validate antigravity` after build |

## 2026-07-11 - README Examples Release 0.2.1

Date: 2026-07-11
Scope: publish the verified README rewrite through npm Trusted Publishing and confirm the public artifacts.

| Evidence | Result |
| --- | --- |
| Local release gate | `npm run release:check` passed with 200 tests, coverage gates, package/adapters/examples/install/Studio/setup/audit checks, zero dependency vulnerabilities, SBOM validation, and package dry runs. |
| Root package | `@appsforgood/next-supabase-kit@0.2.1` is public and the `latest` dist-tag resolves to `0.2.1`. |
| Published README | npm returns the rewritten quick start, audit, council-session, frontend-review, update, and optional-runtime examples for `0.2.1`. |
| Runtime package | `@appsforgood/agent-kit-runtime` remains at `0.1.3`; the release workflow correctly skipped its unchanged package. |
| GitHub release | [`v0.2.1`](https://github.com/lukey662/agentsandskills/releases/tag/v0.2.1) was created only after public-registry verification. |
| Supply chain | Trusted Publishing used GitHub Actions OIDC and generated the root-package SBOM attestation before publication. |

## 2026-07-25 - Opt-In Actions Release 0.3.0

Date: 2026-07-25
Scope: make GitHub Actions opt-in for fresh Agent Kit installs while preserving local quality gates.

| Evidence | Result |
| --- | --- |
| Release commit | `00a3d15` (`Release 0.3.0`) was pushed to `main`. |
| Local release gate | `npm run release:check` passed with 205 tests plus build, lint, typecheck, package, example, smoke, SBOM, audit, and pack validation. |
| Root package | `@appsforgood/next-supabase-kit@0.3.0` is public; registry shasum `ca3967c64d9167de46e53c2c9fcc78b1d070bf96` matches the packed artifact. |
| Published-package verification | `npm run publish:verify` passed with `72 pass / 4 warn / 0 fail`, including a clean install, `doctor`, `init`, `audit`, and orchestrator validation. The warnings are dependency/install-policy notices from the clean consumer project. |
| Runtime package | `@appsforgood/agent-kit-runtime` remains at `0.1.3`; no runtime change was included. |
| GitHub release | [`v0.3.0`](https://github.com/lukey662/agentsandskills/releases/tag/v0.3.0) was created after public-registry verification. |
| Supply-chain recovery | GitHub Actions billing prevented the OIDC Trusted Publishing path. An authenticated maintainer-local publish used `--provenance=false`; therefore this release has no GitHub OIDC provenance attestation. |
