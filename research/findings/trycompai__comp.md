# Repo Finding: trycompai/comp

## Why It Was Selected
- Category: security-quality
- Stars: 1602
- Last pushed: 2026-06-02T02:50:19Z
- Language: TypeScript
- URL: https://github.com/trycompai/comp
- Score: 33/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 5,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 5,
  "documentation": 5,
  "ciDeployment": 4,
  "agentReadiness": 5
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Test setup includes meaningful automated and browser-level coverage.
- Frontend implementation shows reusable components, states, and design-system signals.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.githooks/README.md`
- `.github/workflows/auto-pr-to-main.yml`
- `.github/workflows/auto-pr-to-release.yml`
- `.github/workflows/check-types.yml`
- `.github/workflows/database-migrations-main.yml`
- `.github/workflows/database-migrations-release.yml`
- `.github/workflows/device-agent-release.yml`
- `.github/workflows/github-releases-to-discord.yml`
- `.github/workflows/gram-sync.yml`
- `.github/workflows/release.yml`
- `.github/workflows/sdk_generation.yaml`
- `.github/workflows/sdk_publish.yaml`
- `.github/workflows/trigger-api-tasks-deploy-main.yml`
- `.github/workflows/trigger-api-tasks-deploy-release.yml`
- `.github/workflows/trigger-tasks-deploy-main.yml`
- `.github/workflows/trigger-tasks-deploy-release.yml`
- `AGENTS.md`
- `CHANGELOG.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `apps/api/CLAUDE.md`
- `apps/api/README.md`
- `apps/api/package.json`
- `apps/api/src/vector-store/lib/README.md`
- `apps/app/README.md`
- `apps/app/e2e/README.md`
- `apps/app/package.json`
- `apps/app/playwright.config.ts`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
