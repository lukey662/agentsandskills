# Repo Finding: vercel/ai

## Why It Was Selected
- Category: official-nextjs
- Stars: 24606
- Last pushed: 2026-06-02T05:07:17Z
- Language: TypeScript
- URL: https://github.com/vercel/ai
- Score: 29/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 5,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 5,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 3
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
- `.github/SECURITY.md`
- `.github/scripts/notify-released/package.json`
- `.github/workflows/actions/verify-changesets/index.js`
- `.github/workflows/actions/verify-changesets/package.json`
- `.github/workflows/actions/verify-changesets/test.js`
- `.github/workflows/ai-provider-api-changes.yml`
- `.github/workflows/ai-provider-models.yml`
- `.github/workflows/assign-team-pull-request.yml`
- `.github/workflows/auto-merge-release-prs.yml`
- `.github/workflows/backport.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `.github/workflows/slack-team-review-notification.yml`
- `.github/workflows/slack-workflow-failure-notification.yml`
- `.github/workflows/update-model-settings.yml`
- `.github/workflows/verify-changesets.yml`
- `AGENTS.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `contributing/decisions/README.md`
- `examples/ai-e2e-next/README.md`
- `examples/ai-e2e-next/app/chat/mcp-elicitation/README.md`
- `examples/ai-e2e-next/package.json`
- `examples/ai-functions/README.md`
- `examples/ai-functions/package.json`
- `examples/angular/README.md`
- `examples/angular/package.json`
- `examples/express/README.md`
- `examples/express/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
