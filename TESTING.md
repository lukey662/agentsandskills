# Testing

Testing should be proportional to risk. Auth, data mutations, payments, admin actions, and migrations receive the most coverage.

## Required Test Types

- Unit tests for core logic and edge cases.
- Regression tests for preserved behavior.
- Integration tests for API, Server Actions, and Supabase interactions where practical.
- Playwright smoke tests for auth and critical user workflows.
- Visual QA for important user-facing screens and reusable component states.

## Critical Smoke Paths

Define project-specific smoke tests for:

- Login and logout
- Protected route access
- Primary user workflow
- Data creation and update
- Error and empty states
- Mobile navigation

## Visual QA And Regression

Choose the smallest reliable visual QA tier for the project:

| Tier | Use When | Evidence |
| --- | --- | --- |
| Baseline | Any user-facing UI exists | Desktop/mobile screenshots reviewed with `.agent-kit/prompts/screenshot-review.md` |
| Strong | Primary workflows or responsive layouts change often | Playwright screenshot checks such as `toHaveScreenshot()` for stable pages/states |
| Mature | Shared component system, design system, or frequent UI releases | Storybook state stories plus visual regression in CI through Chromatic, Argos, Loki, Playwright snapshots, or equivalent |

Required rules:

- Capture default, loading, empty, error, disabled, success, permission-denied, and mobile states where relevant.
- Stabilize dynamic data, animations, dates, avatars, generated media, and third-party widgets before visual comparison.
- Review baseline updates as product changes; do not auto-accept visual diffs without rationale.
- Keep accessibility, semantic, keyboard, auth, and data-boundary tests separate from visual checks.

## CI Gates

Every project should define the smallest reliable CI gate for its risk profile.

Recommended baseline:

- Install from lockfile
- Typecheck
- Unit tests
- Build
- Dependency audit
- `agent-kit audit --min-readiness baseline-setup`
- Playwright smoke tests for critical paths
- Visual QA evidence for high-risk UI changes

## Agent Kit UI And Runtime Adapter Smoke

The kit ships optional smoke scripts for Agent Office and wizard UI rendering:

- `npm run smoke:setup` — setup server API + office/wizard flow (wired into `npm run release:check`).
- `npm run smoke:ui-screens` — Playwright captures desktop/mobile screenshots of the office canvas and wizard form (`artifacts/ui-screens/`). Runs in CI as a dedicated Ubuntu job; not part of the full OS matrix.
- The CI matrix runs Node 22/24 on `windows-latest` and Node 20 on `windows-2022`, where the native SQLite fallback has a supported Visual Studio toolchain.

Antigravity runtime slash commands (`/setup`, `/spec`, `/plan`, `/test`, `/review`, `/ship`, UI harness commands, and others) are adapter entrypoints only. Canonical workflow steps live in `.agent-kit/prompts/lifecycle-command-index.md`, `.agent-kit/prompts/ui-command-index.md`, and the council contract in `.agent-kit/agent-roster.json`.

## Executable Runtime Verification

Changes under `packages/runtime`, orchestrator config/schema, CLI bridges, or Studio run controls require focused evidence for:

- Config/roster validation with zero provider calls for `orchestrate validate` and `plan`.
- Deterministic capability mismatch and provider fallback behavior.
- Provider request/response normalization and redirect rejection through loopback mocks.
- MCP host/tool allowlists, private-address rejection, stdio host opt-in, and credential references.
- Sensitive path denial, recursive evidence redaction, partial JSONL recovery, and ordered event IDs.
- Real SQLite interrupt/resume through plan, mutation, and final-commit gates without replaying a mutating node.
- Dirty-base acknowledgement, sensitive tracked-file rejection, isolated worktree branch, and one scoped commit.
- Git-root and filesystem-containment enforcement through repository context and native real-path resolution, including Windows temp paths with distinct long and 8.3 spellings.
- Docker immutable image ID plus read-only, capability, privilege, network, and resource flags.
- Root CLI optional-import behavior and secured Studio start/detail/decision/cancel APIs.
- Separate runtime/root pack dry runs, package metadata, SBOMs, OIDC publish order, and post-publish import/integration verification.

Provider and MCP probes are explicit live checks and must not be required for deterministic unit tests. Do not put real provider credentials in CI fixtures.

## Security-Focused Tests

Prioritize:

- IDOR attempts
- Cross-tenant access attempts
- Unauthorized API calls
- RLS-protected reads and writes
- Service-role-only operations

## Test Gaps

If test infrastructure does not exist, document the smallest viable setup and the risk of shipping without it.
