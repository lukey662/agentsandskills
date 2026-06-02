# Repo Finding: shadcn-ui/ui

## Why It Was Selected
- Category: design-systems
- Stars: 115448
- Last pushed: 2026-06-01T19:51:36Z
- Language: TypeScript
- URL: https://github.com/shadcn-ui/ui
- Score: 27/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 4,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 3,
  "documentation": 4,
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

## Files Worth Studying
- `.changeset/README.md`
- `.github/workflows/code-check.yml`
- `.github/workflows/issue-stale.yml`
- `.github/workflows/prerelease-comment.yml`
- `.github/workflows/release.yml`
- `.github/workflows/signed-commits.yml`
- `.github/workflows/templates.yml`
- `.github/workflows/test.yml`
- `.github/workflows/validate-registries.yml`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `apps/v4/README.md`
- `apps/v4/examples/README.md`
- `apps/v4/package.json`
- `apps/v4/registry/bases/README.md`
- `package.json`
- `packages/shadcn/CHANGELOG.md`
- `packages/shadcn/README.md`
- `packages/shadcn/package.json`
- `packages/shadcn/test/fixtures/config-full/package.json`
- `packages/shadcn/test/fixtures/config-imports-extensions/package.json`
- `packages/shadcn/test/fixtures/config-imports/package.json`
- `packages/shadcn/test/fixtures/config-invalid/package.json`
- `packages/shadcn/test/fixtures/config-jsx/package.json`
- `packages/shadcn/test/fixtures/config-none/package.json`
- `packages/shadcn/test/fixtures/config-partial/package.json`
- `packages/shadcn/test/fixtures/config-ui/package.json`
- `packages/shadcn/test/fixtures/frameworks/next-app-custom-alias/package.json`
- `packages/shadcn/test/fixtures/frameworks/next-app-imports/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
