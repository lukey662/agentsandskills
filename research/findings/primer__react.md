# Repo Finding: primer/react

## Why It Was Selected
- Category: design-systems
- Stars: 3851
- Last pushed: 2026-06-02T08:38:28Z
- Language: TypeScript
- URL: https://github.com/primer/react
- Score: 26/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 5,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 5,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Test setup includes meaningful automated and browser-level coverage.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.changeset/README.md`
- `.github/SECURITY.md`
- `.github/workflows/aat-reports.yml`
- `.github/workflows/accessibility-alt-text-bot.yml`
- `.github/workflows/add_staff_label.yml`
- `.github/workflows/assign_release_conductor.yml`
- `.github/workflows/check-for-integration-result-comment.yml`
- `.github/workflows/check_for_changeset.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/codescan.yml`
- `.github/workflows/copilot-setup-steps.yml`
- `.github/workflows/deploy_preview.yml`
- `.github/workflows/deploy_preview_forks.yml`
- `.github/workflows/deploy_production.yml`
- `.github/workflows/environment.yml`
- `.github/workflows/figma_connect_publish.yml`
- `.github/workflows/graphql-test.yml`
- `.github/workflows/lint-autofix.yml`
- `.github/workflows/lock-release.yml`
- `.github/workflows/migration-status.yml`
- `.github/workflows/pull_request.yml`
- `.github/workflows/recommend-integration-tests.yml`
- `.github/workflows/release-schedule.yml`
- `.github/workflows/release.yml`
- `.github/workflows/release_tracking.yml`
- `.github/workflows/reports.yml`
- `.github/workflows/stale.yml`
- `.github/workflows/status-checks.yml`
- `.github/workflows/statuses.yml`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
