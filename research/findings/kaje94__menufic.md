# Repo Finding: kaje94/menufic

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 134
- Last pushed: 2026-03-31T05:55:36Z
- Language: TypeScript
- URL: https://github.com/kaje94/menufic
- Score: 19/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 2,
  "testing": 4,
  "documentation": 3,
  "ciDeployment": 4,
  "agentReadiness": 0
}
```

## Strong Practices
- Test setup includes meaningful automated and browser-level coverage.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/CONTRIBUTING.md`
- `.github/workflows/checks.yml`
- `.github/workflows/dependency-review.yml`
- `.github/workflows/docker-image.yml`
- `.github/workflows/tests.yml`
- `.github/workflows/trigger-deployment.yml`
- `README.md`
- `package.json`
- `playwright.config.ts`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
