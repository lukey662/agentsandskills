# Repo Finding: gokulkrishh/expense.fyi

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 758
- Last pushed: 2026-05-19T00:18:16Z
- Language: TypeScript
- URL: https://github.com/gokulkrishh/expense.fyi
- Score: 19/45

## Score
```json
{
  "architecture": 3,
  "supabaseAuthRls": 3,
  "security": 1,
  "frontendDesign": 5,
  "accessibility": 2,
  "testing": 1,
  "documentation": 1,
  "ciDeployment": 3,
  "agentReadiness": 0
}
```

## Strong Practices
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/gitleaks.yml`
- `README.md`
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
