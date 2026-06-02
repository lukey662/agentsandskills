# Repo Finding: AndreaPontrandolfo/sheriff

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 179
- Last pushed: 2026-04-12T15:22:11Z
- Language: TypeScript
- URL: https://github.com/AndreaPontrandolfo/sheriff
- Score: 21/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 1,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 2
}
```

## Strong Practices
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.changeset/README.md`
- `.github/workflows/keepalive.yml`
- `.github/workflows/mega-linter.yml`
- `.github/workflows/merge-checks.yml`
- `.github/workflows/release.yml`
- `.github/workflows/stale.yml`
- `CONTRIBUTING.md`
- `README.md`
- `apps/cli-playground/package.json`
- `apps/config-validation-playground/package.json`
- `apps/docs-website-docusaurus/package.json`
- `apps/docs-website/package.json`
- `apps/sheriff-webservices/package.json`
- `package.json`
- `packages/eslint-config-sheriff/CHANGELOG.md`
- `packages/eslint-config-sheriff/README.md`
- `packages/eslint-config-sheriff/package.json`
- `packages/sheriff-cli/CHANGELOG.md`
- `packages/sheriff-cli/README.md`
- `packages/sheriff-cli/package.json`
- `packages/sheriff-constants/CHANGELOG.md`
- `packages/sheriff-constants/package.json`
- `packages/sheriff-create-config/CHANGELOG.md`
- `packages/sheriff-create-config/README.md`
- `packages/sheriff-create-config/package.json`
- `packages/sheriff-types/CHANGELOG.md`
- `packages/sheriff-types/README.md`
- `packages/sheriff-types/package.json`
- `packages/sheriff-utils/CHANGELOG.md`
- `packages/sheriff-utils/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
