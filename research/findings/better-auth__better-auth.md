# Repo Finding: better-auth/better-auth

## Why It Was Selected
- Category: security-quality
- Stars: 28559
- Last pushed: 2026-06-01T06:36:52Z
- Language: TypeScript
- URL: https://github.com/better-auth/better-auth
- Score: 30/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 5,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 5,
  "documentation": 5,
  "ciDeployment": 3,
  "agentReadiness": 3
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Test setup includes meaningful automated and browser-level coverage.
- Frontend implementation shows reusable components, states, and design-system signals.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.changeset/README.md`
- `.github/workflows/auto-changeset.yml`
- `.github/workflows/auto-label.yml`
- `.github/workflows/auto-retarget.yml`
- `.github/workflows/backport.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/claude.yml`
- `.github/workflows/demo.yml`
- `.github/workflows/e2e.yml`
- `.github/workflows/lock-threads.yml`
- `.github/workflows/npm-dist-tag.yml`
- `.github/workflows/preview.yml`
- `.github/workflows/promote.yml`
- `.github/workflows/release.yml`
- `.github/workflows/semantic-pull-request.yml`
- `.github/workflows/verify-changesets.yml`
- `.github/workflows/zizmor.yml`
- `AGENTS.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `demo/electron/README.md`
- `demo/electron/package.json`
- `demo/expo/README.md`
- `demo/expo/package.json`
- `demo/nextjs/README.md`
- `demo/nextjs/package.json`
- `demo/oidc-client/package.json`
- `demo/stateless/package.json`
- `docs/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
