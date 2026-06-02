# Repo Finding: nextify-limited/saasfly

## Why It Was Selected
- Category: production-saas
- Stars: 2879
- Last pushed: 2025-08-04T15:02:01Z
- Language: TypeScript
- URL: https://github.com/nextify-limited/saasfly
- Score: 20/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 0,
  "documentation": 3,
  "ciDeployment": 4,
  "agentReadiness": 1
}
```

## Strong Practices
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/ci.yml`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `apps/auth-proxy/package.json`
- `apps/nextjs/package.json`
- `package.json`
- `packages/api/package.json`
- `packages/auth/package.json`
- `packages/common/package.json`
- `packages/db/package.json`
- `packages/db/prisma/README.md`
- `packages/stripe/package.json`
- `packages/ui/package.json`
- `tooling/eslint-config/package.json`
- `tooling/prettier-config/package.json`
- `tooling/tailwind-config/package.json`
- `tooling/typescript-config/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
