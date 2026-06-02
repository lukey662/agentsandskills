# Repo Finding: keyshade-xyz/keyshade

## Why It Was Selected
- Category: production-saas
- Stars: 751
- Last pushed: 2026-04-08T12:47:32Z
- Language: TypeScript
- URL: https://github.com/keyshade-xyz/keyshade
- Score: 25/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 5,
  "frontendDesign": 4,
  "accessibility": 2,
  "testing": 3,
  "documentation": 5,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Frontend implementation shows reusable components, states, and design-system signals.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/auto-assign.yaml`
- `.github/workflows/docker-ci.yml`
- `.github/workflows/issue-pr-reminder.yaml`
- `.github/workflows/issue-unassign.yaml`
- `.github/workflows/pr-lint.yaml`
- `.github/workflows/pr-review-reminder.yaml`
- `.github/workflows/release.yml`
- `.github/workflows/validate-api-client.yaml`
- `.github/workflows/validate-api.yaml`
- `.github/workflows/validate-cli.yaml`
- `.github/workflows/validate-platform.yaml`
- `.github/workflows/validate-secret-scan.yaml`
- `.github/workflows/validate-web.yaml`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `apps/api/package.json`
- `apps/cli/CHANGELOG.md`
- `apps/cli/README.md`
- `apps/cli/package.json`
- `apps/platform/package.json`
- `apps/web/package.json`
- `docs/README.md`
- `docs/contributing-to-keyshade/design-of-our-code/README.md`
- `docs/contributing-to-keyshade/running-things-locally/README.md`
- `docs/integration/frameworks/README.md`
- `docs/integration/languages/README.md`
- `docs/integration/platforms/README.md`
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
