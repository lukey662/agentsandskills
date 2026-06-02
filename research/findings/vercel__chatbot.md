# Repo Finding: vercel/chatbot

## Why It Was Selected
- Category: official-nextjs
- Stars: 20420
- Last pushed: 2026-05-18T14:08:51Z
- Language: TypeScript
- URL: https://github.com/vercel/chatbot
- Score: 23/45

## Score
```json
{
  "architecture": 3,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 4,
  "accessibility": 2,
  "testing": 4,
  "documentation": 2,
  "ciDeployment": 4,
  "agentReadiness": 1
}
```

## Strong Practices
- Test setup includes meaningful automated and browser-level coverage.
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/lint.yml`
- `.github/workflows/playwright.yml`
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
