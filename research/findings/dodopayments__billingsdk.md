# Repo Finding: dodopayments/billingsdk

## Why It Was Selected
- Category: production-saas
- Stars: 470
- Last pushed: 2026-02-23T07:49:10Z
- Language: TypeScript
- URL: https://github.com/dodopayments/billingsdk
- Score: 19/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 1,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- None detected by static scan.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/SECURITY.md`
- `.github/workflows/autofix.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `CONTRIBUTING.md`
- `README.md`
- `package.json`
- `packages/cli/README.md`
- `packages/cli/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
