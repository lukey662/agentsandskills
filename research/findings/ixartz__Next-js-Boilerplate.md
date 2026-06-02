# Repo Finding: ixartz/Next-js-Boilerplate

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 12964
- Last pushed: 2026-06-01T22:59:36Z
- Language: TypeScript
- URL: https://github.com/ixartz/Next-js-Boilerplate
- Score: 21/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 0,
  "security": 3,
  "frontendDesign": 2,
  "accessibility": 3,
  "testing": 5,
  "documentation": 1,
  "ciDeployment": 3,
  "agentReadiness": 4
}
```

## Strong Practices
- Test setup includes meaningful automated and browser-level coverage.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.github/workflows/CI.yml`
- `.github/workflows/checkly.yml`
- `.github/workflows/crowdin.yml`
- `.github/workflows/release.yml`
- `AGENTS.md`
- `CLAUDE.md`
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
