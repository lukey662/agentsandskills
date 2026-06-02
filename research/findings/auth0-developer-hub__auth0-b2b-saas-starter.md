# Repo Finding: auth0-developer-hub/auth0-b2b-saas-starter

## Why It Was Selected
- Category: security-quality
- Stars: 199
- Last pushed: 2026-05-21T10:44:40Z
- Language: TypeScript
- URL: https://github.com/auth0-developer-hub/auth0-b2b-saas-starter
- Score: 18/45

## Score
```json
{
  "architecture": 3,
  "supabaseAuthRls": 1,
  "security": 0,
  "frontendDesign": 5,
  "accessibility": 3,
  "testing": 0,
  "documentation": 3,
  "ciDeployment": 2,
  "agentReadiness": 1
}
```

## Strong Practices
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `CONTRIBUTING.md`
- `README.md`
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
