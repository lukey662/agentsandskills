# Repo Finding: connectrpc/examples-es

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 162
- Last pushed: 2026-06-01T22:47:27Z
- Language: TypeScript
- URL: https://github.com/connectrpc/examples-es
- Score: 16/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 2,
  "accessibility": 1,
  "testing": 5,
  "documentation": 2,
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
- `.github/workflows/add-to-project.yaml`
- `.github/workflows/ci.yaml`
- `.github/workflows/pr-title.yaml`
- `README.md`
- `SECURITY.md`
- `angular/README.md`
- `angular/package.json`
- `astro/README.md`
- `astro/package.json`
- `astro/playwright.config.ts`
- `bundle-size/README.md`
- `bundle-size/esbuild/package.json`
- `bundle-size/package.json`
- `bundle-size/parcel/package.json`
- `bundle-size/rollup/package.json`
- `bundle-size/vite/package.json`
- `bundle-size/webpack/package.json`
- `cloudflare-workers/README.md`
- `cloudflare-workers/package.json`
- `custom-client/README.md`
- `custom-client/package.json`
- `express/README.md`
- `express/package.json`
- `fastify/README.md`
- `fastify/package.json`
- `nextjs/README.md`
- `nextjs/package.json`
- `plain/README.md`
- `plain/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
