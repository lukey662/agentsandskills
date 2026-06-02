# Repo Finding: midday-ai/midday

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 14445
- Last pushed: 2026-05-07T12:53:34Z
- Language: TypeScript
- URL: https://github.com/midday-ai/midday
- Score: 26/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 2,
  "security": 5,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 3,
  "documentation": 3,
  "ciDeployment": 4,
  "agentReadiness": 1
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/desktop.yml`
- `.github/workflows/production.yml`
- `.github/workflows/staging.yml`
- `README.md`
- `SECURITY.md`
- `apps/api/README.md`
- `apps/api/package.json`
- `apps/dashboard/README.md`
- `apps/dashboard/package.json`
- `apps/desktop/README.md`
- `apps/desktop/package.json`
- `apps/website/README.md`
- `apps/website/package.json`
- `apps/worker/README.md`
- `apps/worker/package.json`
- `docs/README.md`
- `package.json`
- `packages/accounting/README.md`
- `packages/accounting/package.json`
- `packages/app-store/package.json`
- `packages/banking/README.md`
- `packages/banking/package.json`
- `packages/bot/package.json`
- `packages/cache/package.json`
- `packages/categories/README.md`
- `packages/categories/package.json`
- `packages/cli/README.md`
- `packages/cli/package.json`
- `packages/connectors/package.json`
- `packages/customers/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
