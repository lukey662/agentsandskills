# Repo Finding: wasp-lang/open-saas

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 14603
- Last pushed: 2026-06-01T14:32:21Z
- Language: TypeScript
- URL: https://github.com/wasp-lang/open-saas
- Score: 21/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 2,
  "testing": 4,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 3
}
```

## Strong Practices
- Test setup includes meaningful automated and browser-level coverage.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.

## Files Worth Studying
- `.github/workflows/automation-pr-label-external.yaml`
- `.github/workflows/blog-deployment.yml`
- `.github/workflows/check-opensaas-diffs.yml`
- `.github/workflows/e2e-tests.yml`
- `.github/workflows/lint.yml`
- `.github/workflows/template-release.yml`
- `CONTRIBUTING.md`
- `README.md`
- `opensaas-sh/README.md`
- `opensaas-sh/blog/README.md`
- `opensaas-sh/blog/package.json`
- `opensaas-sh/blog/public/banner-images/README.md`
- `package.json`
- `template-test/README.md`
- `template/README.md`
- `template/app/AGENTS.md`
- `template/app/README.md`
- `template/app/package.json`
- `template/blog/README.md`
- `template/blog/package.json`
- `template/blog/public/banner-images/README.md`
- `template/e2e-tests/README.md`
- `template/e2e-tests/package.json`
- `template/e2e-tests/playwright.config.ts`
- `tools/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
