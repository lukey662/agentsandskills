# Repo Finding: dubinc/dub

## Why It Was Selected
- Category: production-saas
- Stars: 23634
- Last pushed: 2026-06-02T08:45:04Z
- Language: TypeScript
- URL: https://github.com/dubinc/dub
- Score: 27/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 5,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 5,
  "documentation": 2,
  "ciDeployment": 4,
  "agentReadiness": 2
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Test setup includes meaningful automated and browser-level coverage.
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/apply-issue-labels-to-pr.yml`
- `.github/workflows/deploy-embed-script.yml`
- `.github/workflows/e2e.yaml`
- `.github/workflows/playwright.yaml`
- `.github/workflows/prettier.yaml`
- `README.md`
- `SECURITY.md`
- `apps/web/app/(ee)/README.md`
- `apps/web/package.json`
- `apps/web/playwright.config.ts`
- `apps/web/playwright/README.md`
- `package.json`
- `packages/cli/README.md`
- `packages/cli/package.json`
- `packages/email/package.json`
- `packages/embeds/core/README.md`
- `packages/embeds/core/package.json`
- `packages/embeds/react/README.md`
- `packages/embeds/react/package.json`
- `packages/hubspot-app/CLAUDE.md`
- `packages/hubspot-app/README.md`
- `packages/hubspot-app/package.json`
- `packages/prisma/package.json`
- `packages/stripe-app/README.md`
- `packages/stripe-app/package.json`
- `packages/tailwind-config/package.json`
- `packages/tinybird/README.md`
- `packages/tsconfig/package.json`
- `packages/ui/README.md`
- `packages/ui/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
