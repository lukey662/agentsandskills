# Repo Finding: vercel/swr

## Why It Was Selected
- Category: official-nextjs
- Stars: 32396
- Last pushed: 2026-05-26T18:10:00Z
- Language: TypeScript
- URL: https://github.com/vercel/swr
- Score: 17/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 0,
  "security": 2,
  "frontendDesign": 2,
  "accessibility": 2,
  "testing": 5,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 0
}
```

## Strong Practices
- Test setup includes meaningful automated and browser-level coverage.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/CONTRIBUTING.md`
- `.github/SECURITY.md`
- `.github/workflows/install/action.yml`
- `.github/workflows/test-canary.yml`
- `.github/workflows/test-legacy-react.yml`
- `.github/workflows/test-release.yml`
- `.github/workflows/trigger-release.yml`
- `README.md`
- `_internal/package.json`
- `e2e/site/README.md`
- `e2e/site/package.json`
- `examples/api-hooks/README.md`
- `examples/api-hooks/package.json`
- `examples/autocomplete-suggestions/README.md`
- `examples/autocomplete-suggestions/package.json`
- `examples/axios-typescript/README.md`
- `examples/axios-typescript/package.json`
- `examples/axios/README.md`
- `examples/axios/package.json`
- `examples/basic-typescript/README.md`
- `examples/basic-typescript/package.json`
- `examples/basic/README.md`
- `examples/basic/package.json`
- `examples/focus-revalidate/README.md`
- `examples/focus-revalidate/package.json`
- `examples/global-fetcher/README.md`
- `examples/global-fetcher/package.json`
- `examples/infinite-scroll/README.md`
- `examples/infinite-scroll/package.json`
- `examples/infinite/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
