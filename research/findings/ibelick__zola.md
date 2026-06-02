# Repo Finding: ibelick/zola

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 1512
- Last pushed: 2025-12-11T21:27:10Z
- Language: TypeScript
- URL: https://github.com/ibelick/zola
- Score: 21/45

## Score
```json
{
  "architecture": 3,
  "supabaseAuthRls": 3,
  "security": 3,
  "frontendDesign": 4,
  "accessibility": 2,
  "testing": 0,
  "documentation": 2,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/ci-cd.yml`
- `.github/workflows/codacy.yml`
- `.github/workflows/codeql.yml`
- `README.md`
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
