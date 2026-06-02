# Repo Finding: vercel/nextjs-postgres-nextauth-tailwindcss-template

## Why It Was Selected
- Category: official-nextjs
- Stars: 1611
- Last pushed: 2026-01-15T10:39:06Z
- Language: TypeScript
- URL: https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template
- Score: 14/45

## Score
```json
{
  "architecture": 3,
  "supabaseAuthRls": 1,
  "security": 1,
  "frontendDesign": 4,
  "accessibility": 1,
  "testing": 0,
  "documentation": 2,
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
