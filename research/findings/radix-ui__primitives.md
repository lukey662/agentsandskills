# Repo Finding: radix-ui/primitives

## Why It Was Selected
- Category: design-systems
- Stars: 18933
- Last pushed: 2026-06-02T01:06:11Z
- Language: TypeScript
- URL: https://github.com/radix-ui/primitives
- Score: 19/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 2,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- None detected by static scan.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.changeset/README.md`
- `.github/CONTRIBUTING.md`
- `.github/workflows/build.yml`
- `.github/workflows/chromatic.yml`
- `.github/workflows/publish.yml`
- `README.md`
- `apps/ssr-testing/README.md`
- `apps/ssr-testing/package.json`
- `apps/storybook/package.json`
- `internal/builder/package.json`
- `internal/test-data/package.json`
- `internal/typescript-config/package.json`
- `package.json`
- `packages/core/number/README.md`
- `packages/core/number/package.json`
- `packages/core/primitive/CHANGELOG.md`
- `packages/core/primitive/README.md`
- `packages/core/primitive/package.json`
- `packages/core/rect/README.md`
- `packages/core/rect/package.json`
- `packages/react/accessible-icon/CHANGELOG.md`
- `packages/react/accessible-icon/README.md`
- `packages/react/accessible-icon/package.json`
- `packages/react/accordion/CHANGELOG.md`
- `packages/react/accordion/README.md`
- `packages/react/accordion/package.json`
- `packages/react/alert-dialog/CHANGELOG.md`
- `packages/react/alert-dialog/README.md`
- `packages/react/alert-dialog/package.json`
- `packages/react/announce/CHANGELOG.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
