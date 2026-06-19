# Dogfood Evidence

This file is the public-safe summary of downstream adoption evidence. Detailed local-path notes live in `dogfood/` and are intentionally excluded from the npm package.

## Evidence Rule

- Dogfood evidence must run against the current built CLI, not an older remembered result.
- Real-project audits may fail. Failure is useful when it proves the kit catches setup drift.
- Public summaries use project archetypes instead of local paths or private project details.
- A dogfood item only counts as promoted when it leads to an installed asset, audit check, test, release gate, or documented decision.

## Current Read-Only Audit Snapshot

Date: 2026-06-03
CLI source: current `dist/index.js`
Command: `node dist/index.js audit --json`
Mode: read-only audit; no downstream files were modified.

| Project Archetype | Summary | Readiness | Highest-Value Gaps Caught |
| --- | --- | --- | --- |
| SaaS/tool hybrid | 11 pass, 20 warn, 7 fail | `needs-setup` | Missing `.agent-kit/agent-roster.json`, schema contracts, `AGENT_ROSTER.md`, `ASSISTANT_ADAPTERS.md`, `COUNCIL.md`, `DESIGN.md`, `QUALITY_GATES.md`, `UPGRADE.md`, assistant adapters, visual QA evidence, reference-led design critique, and stale templates. |
| Content/admin hybrid | 11 pass, 20 warn, 7 fail | `needs-setup` | Missing `.agent-kit/agent-roster.json`, schema contracts, `AGENT_ROSTER.md`, `ASSISTANT_ADAPTERS.md`, `COUNCIL.md`, `DESIGN.md`, `QUALITY_GATES.md`, `UPGRADE.md`, assistant adapters, visual QA evidence, reference-led design critique, and stale/customized templates. |

## What This Proves

- The audit distinguishes older valid installs from the current best-practice setup.
- Current audits catch the exact post-research hardening areas: schema-backed council routing, assistant activation, maturity gates, upgrade lifecycle, visual QA, and reference-led frontend critique.
- Real projects installed before later hardening phases need `agent-kit update` and conflict review before they can claim baseline setup under the current package.

## What This Does Not Prove

- These two projects are not yet best-practice candidates.
- The public npm package has not yet been published and verified with `npx`.
- Assistant adapters and upgrade lifecycle still need real activation/dogfood evidence after publication.
- Reference-led design critique still needs a real UI change dogfood pass with screenshots or equivalent visual evidence.

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
- After public publish, run `npm run publish:verify` to verify registry visibility, public `npx doctor`, clean temp `init`, and `audit --json` with zero failures.

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
