# Repo Finding: vercel/server-components-notes-demo

## Why It Was Selected
- Category: official-nextjs
- Stars: 750
- Last pushed: 2026-04-20T13:52:24Z
- Language: TypeScript
- URL: https://github.com/vercel/server-components-notes-demo
- Score: 7/45

## Score
```json
{
  "architecture": 2,
  "supabaseAuthRls": 1,
  "security": 0,
  "frontendDesign": 2,
  "accessibility": 1,
  "testing": 0,
  "documentation": 1,
  "ciDeployment": 0,
  "agentReadiness": 0
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
