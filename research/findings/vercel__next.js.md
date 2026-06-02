# Repo Finding: vercel/next.js

## Why It Was Selected
- Category: official-nextjs
- Stars: 139642
- Last pushed: 2026-06-02T09:16:28Z
- Language: JavaScript
- URL: https://github.com/vercel/next.js
- Score: 30/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 2,
  "security": 4,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 5,
  "documentation": 3,
  "ciDeployment": 4,
  "agentReadiness": 4
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Test setup includes meaningful automated and browser-level coverage.
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.agents/skills/README.md`
- `.claude-plugin/plugins/README.md`
- `.claude-plugin/plugins/cache-components/README.md`
- `.conductor/README.md`
- `.github/AGENTS.md`
- `.github/actions/needs-triage/package.json`
- `.github/actions/next-integration-stat/package.json`
- `.github/actions/next-repo-actions/package.json`
- `.github/actions/next-stats-action/README.md`
- `.github/actions/next-stats-action/package.json`
- `.github/actions/pr-auto-label/README.md`
- `.github/actions/pr-auto-label/package.json`
- `.github/actions/upload-turboyet-data/package.json`
- `.github/actions/validate-docs-links/dist/package.json`
- `.github/actions/validate-docs-links/package.json`
- `.github/package.json`
- `.github/workflows/build_and_deploy.yml`
- `.github/workflows/build_and_test.yml`
- `.github/workflows/build_reusable.yml`
- `.github/workflows/code_freeze.yml`
- `.github/workflows/create_release_branch.yml`
- `.github/workflows/graphite_ci_optimizer.yml`
- `.github/workflows/integration_tests_reusable.yml`
- `.github/workflows/issue_lock.yml`
- `.github/workflows/issue_stale.yml`
- `.github/workflows/issue_wrong_template.yml`
- `.github/workflows/playwright_chromium_image.yml`
- `.github/workflows/popular.yml`
- `.github/workflows/pr_ci_comment.yml`
- `.github/workflows/pull_request_auto_label.yml`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
