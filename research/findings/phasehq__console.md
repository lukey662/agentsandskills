# Repo Finding: phasehq/console

## Why It Was Selected
- Category: security-quality
- Stars: 866
- Last pushed: 2026-06-01T16:13:50Z
- Language: TypeScript
- URL: https://github.com/phasehq/console
- Score: 20/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 4,
  "accessibility": 2,
  "testing": 3,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/backend.yml`
- `.github/workflows/frontend.yml`
- `.github/workflows/main.yml`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `backend/README.md`
- `frontend/README.md`
- `frontend/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
