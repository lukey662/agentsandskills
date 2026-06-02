# Repo Finding: nextauthjs/next-auth

## Why It Was Selected
- Category: security-quality
- Stars: 28262
- Last pushed: 2026-04-14T21:43:37Z
- Language: TypeScript
- URL: https://github.com/nextauthjs/next-auth
- Score: 26/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 3,
  "security": 4,
  "frontendDesign": 4,
  "accessibility": 1,
  "testing": 5,
  "documentation": 3,
  "ciDeployment": 4,
  "agentReadiness": 1
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Test setup includes meaningful automated and browser-level coverage.
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/broken-link-checker/package.json`
- `.github/workflows/broken-link-checker.yml`
- `.github/workflows/codeql-analysis.yml`
- `.github/workflows/pr-labeler.yml`
- `.github/workflows/release.yml`
- `.github/workflows/sync-examples.yml`
- `.github/workflows/triage.yml`
- `README.md`
- `apps/dev/express/README.md`
- `apps/dev/express/package.json`
- `apps/dev/nextjs/README.md`
- `apps/dev/nextjs/package.json`
- `apps/dev/qwik/README.md`
- `apps/dev/qwik/package.json`
- `apps/dev/sveltekit/README.md`
- `apps/dev/sveltekit/package.json`
- `apps/examples/express/README.md`
- `apps/examples/express/package.json`
- `apps/examples/nextjs-pages/README.md`
- `apps/examples/nextjs-pages/package.json`
- `apps/examples/nextjs/README.md`
- `apps/examples/nextjs/package.json`
- `apps/examples/qwik/README.md`
- `apps/examples/qwik/package.json`
- `apps/examples/solid-start/README.md`
- `apps/examples/solid-start/package.json`
- `apps/examples/sveltekit/README.md`
- `apps/examples/sveltekit/package.json`
- `apps/playgrounds/README.md`
- `apps/proxy/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
