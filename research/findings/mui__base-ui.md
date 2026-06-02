# Repo Finding: mui/base-ui

## Why It Was Selected
- Category: design-systems
- Stars: 9813
- Last pushed: 2026-06-01T22:36:43Z
- Language: TypeScript
- URL: https://github.com/mui/base-ui
- Score: 28/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 5,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 3,
  "documentation": 5,
  "ciDeployment": 3,
  "agentReadiness": 4
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.github/workflows/check-if-pr-has-label.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/ensure-triage-label.yml`
- `.github/workflows/fixed-issue.yml`
- `.github/workflows/maintenance.yml`
- `.github/workflows/mark-duplicate.yml`
- `.github/workflows/new-issue-triage.yml`
- `.github/workflows/no-response.yml`
- `.github/workflows/publish.yml`
- `.github/workflows/scorecards.yml`
- `.github/workflows/support-stackoverflow.yml`
- `AGENTS.md`
- `CHANGELOG.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `docs/README.md`
- `docs/package.json`
- `docs/src/css/README.md`
- `examples/tanstack-start-tailwind-css/README.md`
- `examples/tanstack-start-tailwind-css/package.json`
- `examples/vite-css/README.md`
- `examples/vite-css/package.json`
- `package.json`
- `packages/react/README.md`
- `packages/react/package.json`
- `packages/utils/CHANGELOG.md`
- `packages/utils/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
