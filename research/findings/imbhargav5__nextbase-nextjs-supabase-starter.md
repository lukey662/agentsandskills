# Repo Finding: imbhargav5/nextbase-nextjs-supabase-starter

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 791
- Last pushed: 2026-05-22T19:49:15Z
- Language: TypeScript
- URL: https://github.com/imbhargav5/nextbase-nextjs-supabase-starter
- Score: 25/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 2,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 1,
  "testing": 5,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 4
}
```

## Strong Practices
- Test setup includes meaningful automated and browser-level coverage.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.

## Files Worth Studying
- `.changeset/README.md`
- `.github/workflows/ci.yml`
- `.github/workflows/integration-tests.yml`
- `.github/workflows/release.yml`
- `.github/workflows/update-dependencies.yml`
- `.github/workflows/version-packages.yml`
- `AGENTS.md`
- `CHANGELOG.md`
- `README.md`
- `apps/database/package.json`
- `apps/web/CHANGELOG.md`
- `apps/web/package.json`
- `apps/web/playwright.config.ts`
- `package.json`
- `packages/typescript-config/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
