# Repo Finding: aspen-cloud/triplit

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 3093
- Last pushed: 2026-01-19T12:33:40Z
- Language: TypeScript
- URL: https://github.com/aspen-cloud/triplit
- Score: 25/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 2,
  "security": 4,
  "frontendDesign": 4,
  "accessibility": 2,
  "testing": 3,
  "documentation": 4,
  "ciDeployment": 4,
  "agentReadiness": 1
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Frontend implementation shows reusable components, states, and design-system signals.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.changeset/README.md`
- `.github/workflows/coverage-test.js.yml`
- `.github/workflows/publish.yml`
- `.github/workflows/test.js.yml`
- `CONTRIBUTING.md`
- `README.md`
- `package.json`
- `packages/angular/CHANGELOG.md`
- `packages/angular/README.md`
- `packages/angular/ng-package.json`
- `packages/angular/package.json`
- `packages/authjs-adapter/CHANGELOG.md`
- `packages/authjs-adapter/README.md`
- `packages/authjs-adapter/package.json`
- `packages/bun-server/CHANGELOG.md`
- `packages/bun-server/README.md`
- `packages/bun-server/package.json`
- `packages/cf-worker-server/CHANGELOG.md`
- `packages/cf-worker-server/package.json`
- `packages/cli/CHANGELOG.md`
- `packages/cli/README.md`
- `packages/cli/package.json`
- `packages/client/CHANGELOG.md`
- `packages/client/README.md`
- `packages/client/package.json`
- `packages/console/CHANGELOG.md`
- `packages/console/README.md`
- `packages/console/package.json`
- `packages/create-triplit-app/CHANGELOG.md`
- `packages/create-triplit-app/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
