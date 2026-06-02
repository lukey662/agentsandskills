# Repo Finding: arcjet/arcjet-js

## Why It Was Selected
- Category: security-quality
- Stars: 666
- Last pushed: 2026-06-01T22:02:05Z
- Language: TypeScript
- URL: https://github.com/arcjet/arcjet-js
- Score: 21/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 4,
  "frontendDesign": 4,
  "accessibility": 2,
  "testing": 2,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Frontend implementation shows reusable components, states, and design-system signals.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/guard.yml`
- `.github/workflows/lint-workflows.yml`
- `.github/workflows/merge-queue.yml`
- `.github/workflows/publish.yml`
- `.github/workflows/pull-request.yml`
- `.github/workflows/push.yml`
- `.github/workflows/reusable-examples.yml`
- `.github/workflows/reusable-test.yml`
- `.github/workflows/semgrep.yml`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `README.md`
- `analyze-wasm/CHANGELOG.md`
- `analyze-wasm/README.md`
- `analyze-wasm/package.json`
- `analyze/CHANGELOG.md`
- `analyze/README.md`
- `analyze/package.json`
- `arcjet-astro/CHANGELOG.md`
- `arcjet-astro/README.md`
- `arcjet-astro/package.json`
- `arcjet-bun/CHANGELOG.md`
- `arcjet-bun/README.md`
- `arcjet-bun/package.json`
- `arcjet-deno/CHANGELOG.md`
- `arcjet-deno/README.md`
- `arcjet-deno/package.json`
- `arcjet-fastify/CHANGELOG.md`
- `arcjet-fastify/README.md`
- `arcjet-fastify/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
