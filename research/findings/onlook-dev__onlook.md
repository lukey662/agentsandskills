# Repo Finding: onlook-dev/onlook

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 25858
- Last pushed: 2026-03-27T18:58:36Z
- Language: TypeScript
- URL: https://github.com/onlook-dev/onlook
- Score: 31/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 3,
  "security": 5,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 3,
  "documentation": 4,
  "ciDeployment": 4,
  "agentReadiness": 4
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Frontend implementation shows reusable components, states, and design-system signals.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- None detected by static scan.

## Files Worth Studying
- `.github/workflows/chromatic.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/supabase-push-staging.yml`
- `AGENTS.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `apps/backend/README.md`
- `apps/backend/package.json`
- `apps/web/README.md`
- `apps/web/client/README.md`
- `apps/web/client/package.json`
- `apps/web/client/src/components/store/editor/ast/README.md`
- `apps/web/package.json`
- `apps/web/preload/README.md`
- `apps/web/preload/package.json`
- `apps/web/server/README.md`
- `apps/web/server/package.json`
- `docs/README.md`
- `docs/package.json`
- `package.json`
- `packages/ai/package.json`
- `packages/code-provider/package.json`
- `packages/constants/package.json`
- `packages/db/package.json`
- `packages/db/src/migration-scripts/README.md`
- `packages/email/package.json`
- `packages/file-system/README.md`
- `packages/file-system/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
