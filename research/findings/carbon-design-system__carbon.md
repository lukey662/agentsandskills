# Repo Finding: carbon-design-system/carbon

## Why It Was Selected
- Category: design-systems
- Stars: 9144
- Last pushed: 2026-06-01T23:02:48Z
- Language: TypeScript
- URL: https://github.com/carbon-design-system/carbon
- Score: 27/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 5,
  "documentation": 5,
  "ciDeployment": 3,
  "agentReadiness": 3
}
```

## Strong Practices
- Test setup includes meaningful automated and browser-level coverage.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.github/CONTRIBUTING.md`
- `.github/workflows/add-review-labels.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/code-connect.yml`
- `.github/workflows/codeql-analysis.yml`
- `.github/workflows/contribution-accepted.yml`
- `.github/workflows/contribution-proposal-not-pursuing.yml`
- `.github/workflows/contribution-proposal.yml`
- `.github/workflows/contribution-ready-to-be-worked.yml`
- `.github/workflows/dco.yml`
- `.github/workflows/deploy-packages.yml`
- `.github/workflows/deploy-react-storybook.yml`
- `.github/workflows/deploy-web-components-storybook.yml`
- `.github/workflows/issue-triage-labeler.yml`
- `.github/workflows/issue-triage.yml`
- `.github/workflows/mend-scan.yml`
- `.github/workflows/metrics-merge-rate.yml`
- `.github/workflows/metrics-repo-stats.yml`
- `.github/workflows/nightly-release.yml`
- `.github/workflows/promote.yml`
- `.github/workflows/publish-web-components-cdn-v2.yml`
- `.github/workflows/publish-web-components-cdn.yml`
- `.github/workflows/pull-request-closed.yml`
- `.github/workflows/pull-request-template.yml`
- `.github/workflows/release-notifications.yml`
- `.github/workflows/release.yml`
- `.github/workflows/slack-announcement.yml`
- `.github/workflows/slack-build-notifications.yml`
- `.github/workflows/slack-office-hours-design.yml`
- `.github/workflows/slack-office-hours-dev.yml`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
