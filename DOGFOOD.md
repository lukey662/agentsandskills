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

## Promotion Back Into The Kit

| Dogfood Finding | Promoted Kit Behavior |
| --- | --- |
| Older installs drift as the package improves. | Template hashes, `agent-kit diff`, `agent-kit update`, `UPGRADE.md`, upgrade checklist, and upgrade audit warnings. |
| Existing project docs vary and must be preserved. | Conflict-safe writes and `.agent-kit/overrides.json`. |
| Agent instructions can exist without machine-readable council routing. | `.agent-kit/agent-roster.json`, roster schema validation, and council-session evidence. |
| AI tool activation cannot be assumed from `AGENTS.md` alone. | `ASSISTANT_ADAPTERS.md` and `.agent-kit/assistant-adapters/`. |
| Frontend docs can miss product-specific design evidence. | `DESIGN.md`, content-first design skill, reference-led design critique, visual QA tiers, and screenshot review. |

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

- Run `agent-kit update` on both real projects on dedicated branches and record conflict-review outcomes.
- Capture `agent-kit diff` preview output before update so missing assets and conflicts are visible without touching files.
- Activate at least one assistant adapter in a real project and record whether the chosen tool loads the canonical council instructions.
- Apply the reference-led design critique gate to one real frontend change with desktop/mobile screenshot evidence.
- After public publish, run `npm run publish:verify` to verify registry visibility, public `npx doctor`, clean temp `init`, and `audit --json` with zero failures.
