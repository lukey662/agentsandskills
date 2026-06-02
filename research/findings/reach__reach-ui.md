# Repo Finding: reach/reach-ui

## Why It Was Selected
- Category: design-systems
- Stars: 5975
- Last pushed: 2025-02-10T20:59:23Z
- Language: TypeScript
- URL: https://github.com/reach/reach-ui
- Score: 18/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 2,
  "accessibility": 3,
  "testing": 3,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 0
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
- `.github/workflows/release.yml`
- `.github/workflows/test.yml`
- `README.md`
- `internal/dev/package.json`
- `internal/test/package.json`
- `internal/tsconfig/README.md`
- `internal/tsconfig/package.json`
- `package.json`
- `packages/accordion/CHANGELOG.md`
- `packages/accordion/README.md`
- `packages/accordion/package.json`
- `packages/alert-dialog/CHANGELOG.md`
- `packages/alert-dialog/README.md`
- `packages/alert-dialog/package.json`
- `packages/alert/CHANGELOG.md`
- `packages/alert/README.md`
- `packages/alert/package.json`
- `packages/auto-id/CHANGELOG.md`
- `packages/auto-id/README.md`
- `packages/auto-id/package.json`
- `packages/checkbox/CHANGELOG.md`
- `packages/checkbox/README.md`
- `packages/checkbox/package.json`
- `packages/combobox/CHANGELOG.md`
- `packages/combobox/README.md`
- `packages/combobox/package.json`
- `packages/descendants/CHANGELOG.md`
- `packages/descendants/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
