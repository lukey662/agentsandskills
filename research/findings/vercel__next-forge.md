# Repo Finding: vercel/next-forge

## Why It Was Selected
- Category: official-nextjs
- Stars: 7084
- Last pushed: 2026-05-28T14:33:12Z
- Language: TypeScript
- URL: https://github.com/vercel/next-forge
- Score: 23/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 4,
  "frontendDesign": 3,
  "accessibility": 2,
  "testing": 2,
  "documentation": 5,
  "ciDeployment": 4,
  "agentReadiness": 1
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/CONTRIBUTING.md`
- `.github/SECURITY.md`
- `.github/workflows/release.yml`
- `CHANGELOG.md`
- `README.md`
- `apps/api/package.json`
- `apps/app/package.json`
- `apps/docs/package.json`
- `apps/email/package.json`
- `apps/storybook/README.md`
- `apps/storybook/package.json`
- `apps/studio/package.json`
- `apps/web/package.json`
- `docs/README.md`
- `docs/package.json`
- `package.json`
- `packages/ai/package.json`
- `packages/analytics/package.json`
- `packages/auth/package.json`
- `packages/cms/package.json`
- `packages/collaboration/package.json`
- `packages/database/package.json`
- `packages/design-system/package.json`
- `packages/email/package.json`
- `packages/feature-flags/package.json`
- `packages/internationalization/package.json`
- `packages/next-config/package.json`
- `packages/notifications/package.json`
- `packages/observability/package.json`
- `packages/payments/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
