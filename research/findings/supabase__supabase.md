# Repo Finding: supabase/supabase

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 103318
- Last pushed: 2026-06-02T09:09:39Z
- Language: TypeScript
- URL: https://github.com/supabase/supabase
- Score: 35/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 5,
  "security": 4,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 5,
  "documentation": 4,
  "ciDeployment": 4,
  "agentReadiness": 5
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Supabase authorization appears to be handled close to the data boundary.
- Test setup includes meaningful automated and browser-level coverage.
- Frontend implementation shows reusable components, states, and design-system signals.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- None detected by static scan.

## Files Worth Studying
- `.claude/CLAUDE.md`
- `.claude/skills/vercel-composition-patterns/AGENTS.md`
- `.github/workflows/ai-tests.yml`
- `.github/workflows/authorize-vercel-deploys.yml`
- `.github/workflows/auto-label-issues.yml`
- `.github/workflows/autofix_linters.yml`
- `.github/workflows/avoid-typos.yml`
- `.github/workflows/braintrust-evals.yml`
- `.github/workflows/braintrust-preview-scorers-cleanup.yml`
- `.github/workflows/braintrust-preview-scorers-deploy.yml`
- `.github/workflows/braintrust-scorers-deploy.yml`
- `.github/workflows/dashboard-pr-reminder.yml`
- `.github/workflows/docs-js-libs-update.yml`
- `.github/workflows/docs-last-changed.yml`
- `.github/workflows/docs-lint-v2-comment.yml`
- `.github/workflows/docs-lint-v2-scheduled.yml`
- `.github/workflows/docs-lint-v2.yml`
- `.github/workflows/docs-mgmt-api-update.yml`
- `.github/workflows/docs-sync-auto-troubleshooting.yml`
- `.github/workflows/docs-sync-troubleshooting.yml`
- `.github/workflows/docs-sync.yml`
- `.github/workflows/docs-tests-smoke.yml`
- `.github/workflows/docs-tests.yml`
- `.github/workflows/external-pr-comment.yml`
- `.github/workflows/fix-typos.yml`
- `.github/workflows/label_prs.yml`
- `.github/workflows/mirror.yml`
- `.github/workflows/og_images.yml`
- `.github/workflows/pg-meta-tests.yml`
- `.github/workflows/prettier.yml`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
