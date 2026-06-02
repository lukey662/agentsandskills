# Repo Finding: vercel/nextgram

## Why It Was Selected
- Category: official-nextjs
- Stars: 1010
- Last pushed: 2025-12-08T20:36:45Z
- Language: TypeScript
- URL: https://github.com/vercel/nextgram
- Score: 1/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 0,
  "security": 0,
  "frontendDesign": 0,
  "accessibility": 0,
  "testing": 0,
  "documentation": 0,
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
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
