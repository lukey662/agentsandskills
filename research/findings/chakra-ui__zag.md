# Repo Finding: chakra-ui/zag

## Why It Was Selected
- Category: design-systems
- Stars: 5106
- Last pushed: 2026-06-01T18:55:02Z
- Language: TypeScript
- URL: https://github.com/chakra-ui/zag
- Score: 26/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 4,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 5
}
```

## Strong Practices
- Test setup includes meaningful automated and browser-level coverage.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.changeset/README.md`
- `.github/workflows/issue-stale.yml`
- `.github/workflows/quality.yml`
- `.github/workflows/release.yml`
- `AGENTS.md`
- `CHANGELOG.md`
- `CLAUDE.md`
- `README.md`
- `examples/next-ts/CHANGELOG.md`
- `examples/next-ts/README.md`
- `examples/next-ts/package.json`
- `examples/nuxt-ts/README.md`
- `examples/nuxt-ts/package.json`
- `examples/preact-ts/package.json`
- `examples/solid-ts/README.md`
- `examples/solid-ts/package.json`
- `examples/svelte-ts/README.md`
- `examples/svelte-ts/package.json`
- `examples/vanilla-ts/package.json`
- `package.json`
- `packages/anatomy-icons/CHANGELOG.md`
- `packages/anatomy-icons/README.md`
- `packages/anatomy-icons/package.json`
- `packages/anatomy/CHANGELOG.md`
- `packages/anatomy/package.json`
- `packages/core/CHANGELOG.md`
- `packages/core/README.md`
- `packages/core/package.json`
- `packages/docs/CHANGELOG.md`
- `packages/docs/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
