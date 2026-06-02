# Repo Finding: vercel/next-devtools-mcp

## Why It Was Selected
- Category: official-nextjs
- Stars: 763
- Last pushed: 2026-06-01T03:54:32Z
- Language: TypeScript
- URL: https://github.com/vercel/next-devtools-mcp
- Score: 17/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 0,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 1,
  "testing": 3,
  "documentation": 2,
  "ciDeployment": 3,
  "agentReadiness": 3
}
```

## Strong Practices
- None detected by static scan.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.

## Files Worth Studying
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `.github/workflows/version-bump.yml`
- `CLAUDE.md`
- `README.md`
- `package.json`
- `test/fixtures/nextjs14-minimal/README.md`
- `test/fixtures/nextjs14-minimal/package.json`
- `test/fixtures/nextjs16-minimal/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
