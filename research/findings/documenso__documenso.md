# Repo Finding: documenso/documenso

## Why It Was Selected
- Category: production-saas
- Stars: 13165
- Last pushed: 2026-06-02T08:21:00Z
- Language: TypeScript
- URL: https://github.com/documenso/documenso
- Score: 27/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 4,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 5,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 3
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Test setup includes meaningful automated and browser-level coverage.
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.github/workflows/ci.yml`
- `.github/workflows/codeql-analysis.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/e2e-tests.yml`
- `.github/workflows/first-interaction.yml`
- `.github/workflows/issue-assignee-check.yml`
- `.github/workflows/issue-labeler.yml`
- `.github/workflows/issue-opened.yml`
- `.github/workflows/pr-labeler.yml`
- `.github/workflows/pr-review-reminder.yml`
- `.github/workflows/publish.yml`
- `.github/workflows/semantic-pull-requests.yml`
- `.github/workflows/stale.yml`
- `.github/workflows/translations-force-pull.yml`
- `.github/workflows/translations-pull.yml`
- `.github/workflows/translations-upload.yml`
- `AGENTS.md`
- `CONTRIBUTING.md`
- `README.md`
- `apps/docs/README.md`
- `apps/docs/package.json`
- `apps/openpage-api/README.md`
- `apps/openpage-api/package.json`
- `apps/remix/README.md`
- `apps/remix/package.json`
- `docker/README.md`
- `package.json`
- `packages/api/package.json`
- `packages/app-tests/package.json`
- `packages/app-tests/playwright.config.ts`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
