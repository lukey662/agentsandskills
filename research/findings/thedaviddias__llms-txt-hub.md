# Repo Finding: thedaviddias/llms-txt-hub

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 850
- Last pushed: 2026-06-02T05:47:59Z
- Language: TypeScript
- URL: https://github.com/thedaviddias/llms-txt-hub
- Score: 31/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 5,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 5,
  "documentation": 4,
  "ciDeployment": 4,
  "agentReadiness": 5
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Test setup includes meaningful automated and browser-level coverage.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.github/CONTRIBUTING.md`
- `.github/SECURITY.md`
- `.github/workflows/labels.yml`
- `.github/workflows/link-checker.yml`
- `.github/workflows/pr-automerge.yml`
- `.github/workflows/pr-intake.yml`
- `.github/workflows/pr-review.yml`
- `.github/workflows/release.yml`
- `.github/workflows/update-llms-index.yml`
- `.github/workflows/update-llms-list.yml`
- `.github/workflows/update-websites-json.yml`
- `.github/workflows/vercel-preview.yml`
- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `apps/e2e/README.md`
- `apps/e2e/package.json`
- `apps/e2e/playwright.config.ts`
- `apps/web/components/ui/README.md`
- `apps/web/package.json`
- `configs/next/package.json`
- `configs/typescript/README.md`
- `configs/typescript/package.json`
- `data/README.md`
- `package.json`
- `packages/analytics/README.md`
- `packages/analytics/package.json`
- `packages/api-utils/package.json`
- `packages/auth/README.md`
- `packages/auth/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
