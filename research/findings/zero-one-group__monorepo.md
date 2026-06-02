# Repo Finding: zero-one-group/monorepo

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 124
- Last pushed: 2026-04-23T05:58:09Z
- Language: TypeScript
- URL: https://github.com/zero-one-group/monorepo
- Score: 22/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 5,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- Test setup includes meaningful automated and browser-level coverage.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/cleanup.yml`
- `.github/workflows/release.yaml`
- `README.md`
- `apps/astro-web/package.json`
- `apps/expo-app/package.json`
- `apps/fastapi-ai/CONTRIBUTING.md`
- `apps/fastapi-ai/README.md`
- `apps/go-clean/README.md`
- `apps/go-modular/README.md`
- `apps/nextjs-app/package.json`
- `apps/nextjs-app/playwright.config.ts`
- `apps/react-app/package.json`
- `apps/react-app/playwright.config.ts`
- `apps/react-ssr/package.json`
- `apps/react-ssr/playwright.config.ts`
- `apps/strapi-cms/package.json`
- `apps/tanstack-start/package.json`
- `apps/tanstack-start/playwright.config.ts`
- `docsite/README.md`
- `package.json`
- `packages/shared-ui/README.md`
- `packages/shared-ui/package.json`
- `templates/astro/package.json`
- `templates/expo/package.json`
- `templates/fastapi-ai/CONTRIBUTING.md`
- `templates/fastapi-ai/README.md`
- `templates/go-clean/README.md`
- `templates/go-modular/README.md`
- `templates/load-balancer/README.md`
- `templates/nextjs/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
