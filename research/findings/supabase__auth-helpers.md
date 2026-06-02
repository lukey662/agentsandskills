# Repo Finding: supabase/auth-helpers

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 898
- Last pushed: 2025-09-08T13:07:54Z
- Language: TypeScript
- URL: https://github.com/supabase/auth-helpers
- Score: 17/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 2,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 1,
  "testing": 2,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 0
}
```

## Strong Practices
- None detected by static scan.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.changeset/README.md`
- `.github/workflows/ci.yml`
- `.github/workflows/docs.yml`
- `.github/workflows/release.yml`
- `README.md`
- `examples/nextjs-pages/README.md`
- `examples/nextjs-pages/package.json`
- `examples/nextjs/README.md`
- `examples/nextjs/package.json`
- `examples/remix/README.md`
- `examples/remix/package.json`
- `examples/sveltekit/README.md`
- `examples/sveltekit/package.json`
- `package.json`
- `packages/config/CHANGELOG.md`
- `packages/config/package.json`
- `packages/nextjs/CHANGELOG.md`
- `packages/nextjs/README.md`
- `packages/nextjs/package.json`
- `packages/react/CHANGELOG.md`
- `packages/react/README.md`
- `packages/react/package.json`
- `packages/remix/CHANGELOG.md`
- `packages/remix/README.md`
- `packages/remix/package.json`
- `packages/shared/CHANGELOG.md`
- `packages/shared/package.json`
- `packages/ssr/CHANGELOG.md`
- `packages/ssr/README.md`
- `packages/ssr/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
