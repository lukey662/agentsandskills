# Repo Finding: skeletonlabs/skeleton

## Why It Was Selected
- Category: design-systems
- Stars: 5974
- Last pushed: 2026-06-01T12:40:28Z
- Language: TypeScript
- URL: https://github.com/skeletonlabs/skeleton
- Score: 17/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 2,
  "testing": 1,
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
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/build-publish.yml`
- `.github/workflows/code-quality.yml`
- `README.md`
- `package.json`
- `packages/cli/CHANGELOG.md`
- `packages/cli/README.md`
- `packages/cli/package.json`
- `packages/docs/CHANGELOG.md`
- `packages/docs/README.md`
- `packages/docs/package.json`
- `packages/skeleton-common/CHANGELOG.md`
- `packages/skeleton-common/README.md`
- `packages/skeleton-common/package.json`
- `packages/skeleton-react/CHANGELOG.md`
- `packages/skeleton-react/README.md`
- `packages/skeleton-react/package.json`
- `packages/skeleton-svelte/CHANGELOG.md`
- `packages/skeleton-svelte/README.md`
- `packages/skeleton-svelte/package.json`
- `packages/skeleton/CHANGELOG.md`
- `packages/skeleton/README.md`
- `packages/skeleton/package.json`
- `playgrounds/skeleton-react/package.json`
- `playgrounds/skeleton-svelte/package.json`
- `sites/plus.skeleton.dev/README.md`
- `sites/plus.skeleton.dev/package.json`
- `sites/skeleton.dev/package.json`
- `sites/themes.skeleton.dev/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
