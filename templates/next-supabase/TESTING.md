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

## Security-Focused Tests

Prioritize:

- IDOR attempts
- Cross-tenant access attempts
- Unauthorized API calls
- RLS-protected reads and writes
- Service-role-only operations

## Test Gaps

If test infrastructure does not exist, document the smallest viable setup and the risk of shipping without it.
