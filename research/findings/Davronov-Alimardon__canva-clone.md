# Repo Finding: Davronov-Alimardon/canva-clone

## Why It Was Selected
- Category: production-saas
- Stars: 484
- Last pushed: 2026-03-06T15:30:14Z
- Language: TypeScript
- URL: https://github.com/Davronov-Alimardon/canva-clone
- Score: 13/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 1,
  "frontendDesign": 4,
  "accessibility": 2,
  "testing": 0,
  "documentation": 3,
  "ciDeployment": 1,
  "agentReadiness": 1
}
```

## Strong Practices
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `README.md`
- `docs/README.md`
- `docs/README/README.md`
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
