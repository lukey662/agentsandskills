# Repo Finding: reshaped-ui/reshaped

## Why It Was Selected
- Category: design-systems
- Stars: 2180
- Last pushed: 2026-05-07T19:51:49Z
- Language: TypeScript
- URL: https://github.com/reshaped-ui/reshaped
- Score: 19/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 0,
  "security": 1,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 3,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/chromatic.yml`
- `.github/workflows/pull-request.yml`
- `.github/workflows/release.yml`
- `CONTRIBUTING.md`
- `README.md`
- `package.json`
- `packages/headless/CHANGELOG.md`
- `packages/headless/package.json`
- `packages/reshaped/CHANGELOG.md`
- `packages/reshaped/package.json`
- `packages/utilities/CHANGELOG.md`
- `packages/utilities/README.md`
- `packages/utilities/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
