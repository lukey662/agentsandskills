# Repo Finding: boxyhq/saas-starter-kit

## Why It Was Selected
- Category: production-saas
- Stars: 4832
- Last pushed: 2026-05-11T11:15:20Z
- Language: TypeScript
- URL: https://github.com/boxyhq/saas-starter-kit
- Score: 25/45

## Score
```json
{
  "architecture": 2,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 5,
  "accessibility": 2,
  "testing": 5,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- Test setup includes meaningful automated and browser-level coverage.
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/main.yml`
- `CONTRIBUTING.md`
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
