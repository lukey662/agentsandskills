# Repo Finding: cosscom/coss

## Why It Was Selected
- Category: design-systems
- Stars: 9825
- Last pushed: 2026-06-01T18:20:39Z
- Language: TypeScript
- URL: https://github.com/cosscom/coss
- Score: 20/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 1,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 3
}
```

## Strong Practices
- None detected by static scan.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.github/workflows/build.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/format.yml`
- `.github/workflows/labeler.yml`
- `.github/workflows/lint.yml`
- `.github/workflows/publish.yml`
- `.github/workflows/semantic-pull-requests.yml`
- `.github/workflows/test.yml`
- `.github/workflows/typecheck.yml`
- `AGENTS.md`
- `README.md`
- `apps/examples/calcom/README.md`
- `apps/examples/calcom/package.json`
- `apps/origin/README.md`
- `apps/origin/package.json`
- `apps/ui/AGENTS.md`
- `apps/ui/CONTRIBUTING.md`
- `apps/ui/README.md`
- `apps/ui/package.json`
- `apps/www/README.md`
- `apps/www/package.json`
- `package.json`
- `packages/typescript-config/package.json`
- `packages/ui/package.json`
- `packages/ui/src/fonts/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
