# Repo Finding: reliverse/relivator

## Why It Was Selected
- Category: production-saas
- Stars: 1553
- Last pushed: 2025-10-04T13:33:55Z
- Language: TypeScript
- URL: https://github.com/reliverse/relivator
- Score: 10/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 0,
  "frontendDesign": 3,
  "accessibility": 1,
  "testing": 1,
  "documentation": 1,
  "ciDeployment": 1,
  "agentReadiness": 2
}
```

## Strong Practices
- None detected by static scan.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `README.md`
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
