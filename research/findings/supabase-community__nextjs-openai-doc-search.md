# Repo Finding: supabase-community/nextjs-openai-doc-search

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 1722
- Last pushed: 2026-05-12T19:58:11Z
- Language: TypeScript
- URL: https://github.com/supabase-community/nextjs-openai-doc-search
- Score: 18/45

## Score
```json
{
  "architecture": 2,
  "supabaseAuthRls": 5,
  "security": 1,
  "frontendDesign": 5,
  "accessibility": 1,
  "testing": 0,
  "documentation": 1,
  "ciDeployment": 2,
  "agentReadiness": 1
}
```

## Strong Practices
- Supabase authorization appears to be handled close to the data boundary.
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/build.yml`
- `README.md`
- `package.json`
- `supabase/migrations/20230406025118_init.sql`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
