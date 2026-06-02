# Repo Finding: zenstackhq/zenstack

## Why It Was Selected
- Category: production-saas
- Stars: 2909
- Last pushed: 2026-06-01T17:03:25Z
- Language: TypeScript
- URL: https://github.com/zenstackhq/zenstack
- Score: 20/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 4,
  "frontendDesign": 2,
  "accessibility": 1,
  "testing": 3,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 2
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/build-test.yml`
- `.github/workflows/bump-version.yml`
- `.github/workflows/claude-code-review.yml`
- `.github/workflows/claude.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/config/codeql-config.yml`
- `.github/workflows/github-releases-to-discord.yml`
- `.github/workflows/publish-release.yml`
- `.github/workflows/update-samples.yml`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `package.json`
- `packages/auth-adapters/better-auth/README.md`
- `packages/auth-adapters/better-auth/package.json`
- `packages/cli/README.md`
- `packages/cli/package.json`
- `packages/clients/client-helpers/README.md`
- `packages/clients/client-helpers/package.json`
- `packages/clients/fetch-client/README.md`
- `packages/clients/fetch-client/package.json`
- `packages/clients/tanstack-query/README.md`
- `packages/clients/tanstack-query/package.json`
- `packages/common-helpers/README.md`
- `packages/common-helpers/package.json`
- `packages/config/eslint-config/package.json`
- `packages/config/tsdown-config/package.json`
- `packages/config/typescript-config/package.json`
- `packages/config/vitest-config/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
