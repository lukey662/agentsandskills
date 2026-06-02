# Repo Finding: jakejarvis/domainstack.io

## Why It Was Selected
- Category: security-quality
- Stars: 271
- Last pushed: 2026-05-19T18:33:43Z
- Language: TypeScript
- URL: https://github.com/jakejarvis/domainstack.io
- Score: 22/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 4,
  "frontendDesign": 3,
  "accessibility": 2,
  "testing": 2,
  "documentation": 2,
  "ciDeployment": 4,
  "agentReadiness": 3
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.

## Files Worth Studying
- `.github/workflows/ci.yml`
- `AGENTS.md`
- `README.md`
- `apps/web/package.json`
- `package.json`
- `packages/analytics/package.json`
- `packages/api/package.json`
- `packages/auth/package.json`
- `packages/blob/package.json`
- `packages/constants/package.json`
- `packages/db/package.json`
- `packages/email/package.json`
- `packages/image/package.json`
- `packages/logger/package.json`
- `packages/polar/package.json`
- `packages/redis/package.json`
- `packages/safe-fetch/package.json`
- `packages/screenshot/package.json`
- `packages/server/package.json`
- `packages/types/package.json`
- `packages/typescript-config/package.json`
- `packages/ui/package.json`
- `packages/utils/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
