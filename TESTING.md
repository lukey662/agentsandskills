# Testing

How this repository tests itself. Downstream projects get their testing rules from the `testing-qa` and `browser-qa` skills, not from this file.

## Local gate

```bash
npm run release:check
```

Runs, in order: JSON validation, version and changeset checks, typecheck, lint, format check, `vitest run --coverage` with thresholds, `tsup` build, package and adapter validation, example fixture check, `dogfood:check`, install and doctor smokes, dependency audit, SBOM check, `npm pack --dry-run`. CI runs the same command on a Node 20/22/24 × Linux/Windows/macOS matrix, plus a Playwright job that captures `USER_GUIDE.html` desktop and mobile.

## What the tests lock

| File | Contract |
| --- | --- |
| `tests/qa-screenshot.test.ts` | The fail-closed sentence in `USER_GUIDE.*`, `browser-qa` forbids code-only review, `doctor` fails when Design or QA drop `requiredTools`. |
| `tests/payloads.test.ts` | Every spawn payload and the ask policy equal `catalog.json` in both `AGENTS.md` files, `USER_GUIDE.md`, the agents, and the generated Copilot and Antigravity files. |
| `tests/rendered-drift.test.ts` | Every rendered agent body and every rendered skill is byte-equal to `agents/` and `skills/`; per-host frontmatter is what that host documents. |
| `tests/adapter-frontmatter.test.ts` | Claude `tools` entries are real Claude tool names; Cursor files carry only Cursor's five fields; Planner is `readonly`; Copilot has `description`; Antigravity has `subagent: true` and the catalog's skill list. |
| `tests/no-kit-content.test.ts` | Shipped agents and skills carry none of this repo's palette, HTML page, or scan notes. |
| `tests/doctor-legacy.test.ts` | Council stubs at 0.4 paths fail `doctor`; `--prune-legacy` deletes only its allowlist and never the kit's own `skills/`. |
| `tests/deslop.test.ts`, `domain-skills.test.ts`, `skill-frontmatter.test.ts`, `agent-catalog.test.ts` | Skill and agent contracts: `deslop` last, fail list owned by `frontend-design`, unique trigger phrases, catalog pointer on every agent. |
| `tests/update.test.ts`, `cli.test.ts`, `ide-activate.test.ts`, `adapter-validate.test.ts` | Install, update, activation, and CLI output contracts. |

## Scripts

- `npm run dogfood:check` regenerates this repo's own IDE layers and fails on drift or a failing `doctor`.
- `npm run examples:refresh` regenerates `examples/next-supabase-installed` from a fresh init; `examples:check` verifies it.
- `npm run smoke:ui-screens` captures `USER_GUIDE.html` at 1280 and 390 with Playwright into `artifacts/ui-screens/`.

## Screenshot evidence

Any change to `USER_GUIDE.html` needs `browser-qa`: desktop and mobile PNGs plus `notes.md` under `qa-evidence/<date>-<slug>/`, read by a person or the QA agent, verdict recorded. Reading the HTML is not QA.

## Test gaps

Claude Code, Codex, Copilot, and Antigravity adapters are verified against their documented frontmatter schemas, not by driving those hosts. Live runs are the open item in `ROADMAP.md`.
