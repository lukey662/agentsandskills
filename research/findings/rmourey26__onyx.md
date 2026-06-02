# Repo Finding: rmourey26/onyx

## Why It Was Selected
- Category: security-quality
- Stars: 249
- Last pushed: 2026-01-29T14:33:43Z
- Language: TypeScript
- URL: https://github.com/rmourey26/onyx
- Score: 22/45

## Score
```json
{
  "architecture": 3,
  "supabaseAuthRls": 5,
  "security": 2,
  "frontendDesign": 5,
  "accessibility": 2,
  "testing": 1,
  "documentation": 2,
  "ciDeployment": 2,
  "agentReadiness": 0
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
- `README.md`
- `SECURITY.md`
- `package.json`
- `supabase/migrations/20250409_onyxpwa.sql`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
