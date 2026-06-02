# Repo Finding: vercel/examples

## Why It Was Selected
- Category: official-nextjs
- Stars: 5096
- Last pushed: 2026-05-21T22:37:18Z
- Language: TypeScript
- URL: https://github.com/vercel/examples
- Score: 26/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 4,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 5,
  "documentation": 3,
  "ciDeployment": 4,
  "agentReadiness": 2
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Test setup includes meaningful automated and browser-level coverage.
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/faster-template-prebuild-boilerplate-nextjs.yml`
- `.github/workflows/faster-template-prebuild-vercel-tutor.yml`
- `.github/workflows/faster-template-prebuild-vibe-coding-platform.yml`
- `.github/workflows/publish-template.yaml`
- `.github/workflows/release.yml`
- `README.md`
- `app-directory/css-in-js/README.md`
- `app-directory/css-in-js/package.json`
- `app-directory/i18n/README.md`
- `app-directory/i18n/package.json`
- `app-directory/redirect-with-fallback/README.md`
- `app-directory/redirect-with-fallback/package.json`
- `app-directory/share-state/README.md`
- `app-directory/share-state/package.json`
- `apps/vibe-coding-platform/README.md`
- `apps/vibe-coding-platform/package.json`
- `build-output-api/README.md`
- `build-output-api/draft-mode/README.md`
- `build-output-api/edge-functions/README.md`
- `build-output-api/edge-middleware/README.md`
- `build-output-api/image-optimization/README.md`
- `build-output-api/on-demand-isr/README.md`
- `build-output-api/overrides/README.md`
- `build-output-api/prerender-functions/README.md`
- `build-output-api/routes/README.md`
- `build-output-api/serverless-functions/README.md`
- `build-output-api/static-files/README.md`
- `build-output-api/wildcard/README.md`
- `cdn/add-api-rewrite-routing-rule/README.md`
- `cdn/api-proxy-rewrite/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
