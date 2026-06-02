# Repo Finding: palantir/blueprint

## Why It Was Selected
- Category: design-systems
- Stars: 21793
- Last pushed: 2026-06-02T01:02:13Z
- Language: TypeScript
- URL: https://github.com/palantir/blueprint
- Score: 17/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 0,
  "security": 0,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 2,
  "documentation": 4,
  "ciDeployment": 1,
  "agentReadiness": 3
}
```

## Strong Practices
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `AGENTS.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `README.md`
- `package.json`
- `packages/colors/README.md`
- `packages/colors/package.json`
- `packages/core/README.md`
- `packages/core/package.json`
- `packages/core/src/design-tokens/README.md`
- `packages/datetime/README.md`
- `packages/datetime/package.json`
- `packages/datetime2/README.md`
- `packages/datetime2/package.json`
- `packages/demo-app/package.json`
- `packages/docs-app/README.md`
- `packages/docs-app/package.json`
- `packages/docs-data/package.json`
- `packages/docs-theme/README.md`
- `packages/docs-theme/package.json`
- `packages/eslint-config/README.md`
- `packages/eslint-config/package.json`
- `packages/eslint-plugin/README.md`
- `packages/eslint-plugin/package.json`
- `packages/icons/README.md`
- `packages/icons/package.json`
- `packages/labs/README.md`
- `packages/labs/package.json`
- `packages/landing-app/README.md`
- `packages/landing-app/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
