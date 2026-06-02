# Repo Finding: antiwork/shortest

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 5608
- Last pushed: 2026-05-21T16:10:05Z
- Language: TypeScript
- URL: https://github.com/antiwork/shortest
- Score: 25/45

## Score
```json
{
  "architecture": 4,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 5,
  "accessibility": 2,
  "testing": 3,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/autofix.yml`
- `.github/workflows/cli-publish.yml`
- `.github/workflows/cli-test.yml`
- `.github/workflows/web-shortest.yml`
- `README.md`
- `package.json`
- `packages/shortest/CHANGELOG.md`
- `packages/shortest/CONTRIBUTING.md`
- `packages/shortest/README.md`
- `packages/shortest/package.json`
- `test-cli/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
