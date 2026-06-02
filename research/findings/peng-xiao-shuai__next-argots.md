# Repo Finding: peng-xiao-shuai/next-argots

## Why It Was Selected
- Category: security-quality
- Stars: 110
- Last pushed: 2025-12-18T12:01:17Z
- Language: TypeScript
- URL: https://github.com/peng-xiao-shuai/next-argots
- Score: 10/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 1,
  "frontendDesign": 4,
  "accessibility": 1,
  "testing": 0,
  "documentation": 1,
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
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
