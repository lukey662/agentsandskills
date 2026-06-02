# Repo Finding: ixartz/SaaS-Boilerplate

## Why It Was Selected
- Category: production-saas
- Stars: 7150
- Last pushed: 2026-06-01T23:01:53Z
- Language: TypeScript
- URL: https://github.com/ixartz/SaaS-Boilerplate
- Score: 19/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 2,
  "accessibility": 2,
  "testing": 5,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 1
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
- `.github/workflows/CI.yml`
- `.github/workflows/checkly.yml`
- `.github/workflows/crowdin.yml`
- `.github/workflows/release.yml`
- `CHANGELOG.md`
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
