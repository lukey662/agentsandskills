# Repo Finding: weijunext/nextjs-starter

## Why It Was Selected
- Category: production-saas
- Stars: 790
- Last pushed: 2026-04-20T02:31:24Z
- Language: TypeScript
- URL: https://github.com/weijunext/nextjs-starter
- Score: 15/45

## Score
```json
{
  "architecture": 3,
  "supabaseAuthRls": 1,
  "security": 1,
  "frontendDesign": 5,
  "accessibility": 1,
  "testing": 1,
  "documentation": 2,
  "ciDeployment": 1,
  "agentReadiness": 0
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
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
