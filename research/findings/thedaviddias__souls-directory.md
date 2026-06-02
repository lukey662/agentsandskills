# Repo Finding: thedaviddias/souls-directory

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 127
- Last pushed: 2026-05-06T18:07:38Z
- Language: TypeScript
- URL: https://github.com/thedaviddias/souls-directory
- Score: 29/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 5,
  "frontendDesign": 4,
  "accessibility": 2,
  "testing": 5,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 4
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Test setup includes meaningful automated and browser-level coverage.
- Frontend implementation shows reusable components, states, and design-system signals.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.

## Files Worth Studying
- `.github/workflows/ci-tauri.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/contributors.yml`
- `.github/workflows/release-please-tauri.yml`
- `.github/workflows/release-tauri.yml`
- `AGENTS.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `apps/e2e/README.md`
- `apps/e2e/package.json`
- `apps/e2e/playwright.config.ts`
- `apps/souls-studio/CHANGELOG.md`
- `apps/souls-studio/README.md`
- `apps/souls-studio/package.json`
- `apps/souls-studio/playwright.config.ts`
- `apps/web/CLAUDE.md`
- `apps/web/convex/README.md`
- `apps/web/package.json`
- `package.json`
- `packages/analytics/README.md`
- `packages/analytics/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
