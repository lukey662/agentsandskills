# Repo Finding: nextacular/nextacular

## Why It Was Selected
- Category: production-saas
- Stars: 1376
- Last pushed: 2026-05-30T12:31:52Z
- Language: TypeScript
- URL: https://github.com/nextacular/nextacular
- Score: 23/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 4,
  "frontendDesign": 4,
  "accessibility": 2,
  "testing": 0,
  "documentation": 5,
  "ciDeployment": 3,
  "agentReadiness": 4
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Frontend implementation shows reusable components, states, and design-system signals.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.

## Files Worth Studying
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `AGENTS.md`
- `CHANGELOG.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
