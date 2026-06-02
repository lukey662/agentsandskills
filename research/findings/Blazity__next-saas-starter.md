# Repo Finding: Blazity/next-saas-starter

## Why It Was Selected
- Category: production-saas
- Stars: 1675
- Last pushed: 2026-06-01T21:02:32Z
- Language: TypeScript
- URL: https://github.com/Blazity/next-saas-starter
- Score: 16/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 0,
  "documentation": 2,
  "ciDeployment": 3,
  "agentReadiness": 0
}
```

## Strong Practices
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/codeql-analysis.yml`
- `README.md`
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
