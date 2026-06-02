# Repo Finding: 403errors/repomind

## Why It Was Selected
- Category: security-quality
- Stars: 254
- Last pushed: 2026-06-01T08:25:07Z
- Language: TypeScript
- URL: https://github.com/403errors/repomind
- Score: 21/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 4,
  "frontendDesign": 3,
  "accessibility": 2,
  "testing": 3,
  "documentation": 3,
  "ciDeployment": 4,
  "agentReadiness": 1
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/refresh-repo-catalog.yml`
- `CHANGELOG.md`
- `README.md`
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
