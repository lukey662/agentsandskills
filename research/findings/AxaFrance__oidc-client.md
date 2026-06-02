# Repo Finding: AxaFrance/oidc-client

## Why It Was Selected
- Category: security-quality
- Stars: 676
- Last pushed: 2026-05-31T16:15:32Z
- Language: TypeScript
- URL: https://github.com/AxaFrance/oidc-client
- Score: 20/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 2,
  "testing": 2,
  "documentation": 5,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/azure-static-web-apps-black-rock-0dc6b0d03.yml`
- `.github/workflows/azure-static-web-apps-icy-glacier-004ab4303.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/lint.yml`
- `.github/workflows/npm-publish.yml`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `examples/nextjs-demo/README.md`
- `examples/nextjs-demo/package.json`
- `examples/oidc-client-demo/README.md`
- `examples/oidc-client-demo/package.json`
- `examples/react-oidc-demo/README.md`
- `examples/react-oidc-demo/package.json`
- `examples/react-oidc-demo/public/package.json`
- `package.json`
- `packages/oidc-client-service-worker/package.json`
- `packages/oidc-client/README.md`
- `packages/oidc-client/package.json`
- `packages/react-oidc/README.md`
- `packages/react-oidc/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
