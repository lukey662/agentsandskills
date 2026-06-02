# Repo Finding: chakra-ui/ark

## Why It Was Selected
- Category: design-systems
- Stars: 5206
- Last pushed: 2026-06-02T00:58:05Z
- Language: TypeScript
- URL: https://github.com/chakra-ui/ark
- Score: 23/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 2,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 3
}
```

## Strong Practices
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.changeset/README.md`
- `.github/workflows/quality.yml`
- `.github/workflows/release.yml`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `package.json`
- `packages/mcp/CHANGELOG.md`
- `packages/mcp/README.md`
- `packages/mcp/package.json`
- `packages/react/CHANGELOG.md`
- `packages/react/README.md`
- `packages/react/package.json`
- `packages/solid/CHANGELOG.md`
- `packages/solid/README.md`
- `packages/solid/package.json`
- `packages/svelte/CHANGELOG.md`
- `packages/svelte/package.json`
- `packages/vue/CHANGELOG.md`
- `packages/vue/README.md`
- `packages/vue/package.json`
- `scripts/package.json`
- `templates/next-js/README.md`
- `templates/next-js/package.json`
- `templates/nuxt/README.md`
- `templates/nuxt/package.json`
- `templates/solid-start/README.md`
- `templates/solid-start/package.json`
- `templates/svelte-kit/README.md`
- `templates/svelte-kit/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
