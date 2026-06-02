# Repo Finding: formbricks/formbricks

## Why It Was Selected
- Category: production-saas
- Stars: 12331
- Last pushed: 2026-06-02T09:18:25Z
- Language: TypeScript
- URL: https://github.com/formbricks/formbricks
- Score: 29/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 5,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 4,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 4
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
- `.github/workflows/build-and-push-ecr.yml`
- `.github/workflows/build-web.yml`
- `.github/workflows/chromatic.yml`
- `.github/workflows/dependabot-to-linear.yml`
- `.github/workflows/deploy-formbricks-cloud.yml`
- `.github/workflows/docker-build-validation.yml`
- `.github/workflows/docker-security-scan.yml`
- `.github/workflows/e2e.yml`
- `.github/workflows/formbricks-release.yml`
- `.github/workflows/linear-release.yml`
- `.github/workflows/lint.yml`
- `.github/workflows/move-stable-tag.yml`
- `.github/workflows/pr-size-check.yml`
- `.github/workflows/pr.yml`
- `.github/workflows/release-docker-github-experimental.yml`
- `.github/workflows/release-docker-github.yml`
- `.github/workflows/release-helm-chart.yml`
- `.github/workflows/semantic-pull-requests.yml`
- `.github/workflows/sonarqube.yml`
- `.github/workflows/test.yml`
- `.github/workflows/translation-check.yml`
- `AGENTS.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `apps/storybook/README.md`
- `apps/storybook/package.json`
- `apps/web/package.json`
- `charts/formbricks/README.md`
- `docker/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
