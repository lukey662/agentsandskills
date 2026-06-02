# Repo Finding: triggerdotdev/trigger.dev

## Why It Was Selected
- Category: production-saas
- Stars: 15181
- Last pushed: 2026-06-02T09:14:30Z
- Language: TypeScript
- URL: https://github.com/triggerdotdev/trigger.dev
- Score: 32/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 2,
  "security": 4,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 5,
  "documentation": 5,
  "ciDeployment": 3,
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
- `.changeset/README.md`
- `.github/test/README.md`
- `.github/workflows/changesets-pr.yml`
- `.github/workflows/check-review-md.yml`
- `.github/workflows/claude-md-audit.yml`
- `.github/workflows/claude.yml`
- `.github/workflows/dependabot-critical-alerts.yml`
- `.github/workflows/dependabot-weekly-summary.yml`
- `.github/workflows/docs.yml`
- `.github/workflows/e2e-webapp-auth-full.yml`
- `.github/workflows/e2e-webapp.yml`
- `.github/workflows/e2e.yml`
- `.github/workflows/helm-prerelease.yml`
- `.github/workflows/pr_checks.yml`
- `.github/workflows/preview-dispatch.yml`
- `.github/workflows/publish-webapp.yml`
- `.github/workflows/publish-worker-v4.yml`
- `.github/workflows/publish-worker.yml`
- `.github/workflows/publish.yml`
- `.github/workflows/release-helm.yml`
- `.github/workflows/release.yml`
- `.github/workflows/sdk-compat.yml`
- `.github/workflows/typecheck.yml`
- `.github/workflows/unit-tests-internal.yml`
- `.github/workflows/unit-tests-packages.yml`
- `.github/workflows/unit-tests-webapp.yml`
- `.github/workflows/unit-tests.yml`
- `.github/workflows/vouch-check-pr.yml`
- `.github/workflows/vouch-manage-by-issue.yml`
- `.github/workflows/workflow-checks.yml`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
