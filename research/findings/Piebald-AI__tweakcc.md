# Repo Finding: Piebald-AI/tweakcc

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 2124
- Last pushed: 2026-06-02T00:23:01Z
- Language: TypeScript
- URL: https://github.com/Piebald-AI/tweakcc
- Score: 20/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 2,
  "accessibility": 1,
  "testing": 3,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 3
}
```

## Strong Practices
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.

## Files Worth Studying
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `AGENTS.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `README.md`
- `package.json`
- `tools/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
