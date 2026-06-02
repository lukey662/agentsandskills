# Repo Finding: cossistantcom/cossistant

## Why It Was Selected
- Category: production-saas
- Stars: 670
- Last pushed: 2026-05-31T11:04:33Z
- Language: TypeScript
- URL: https://github.com/cossistantcom/cossistant
- Score: 24/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 5,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 2,
  "documentation": 5,
  "ciDeployment": 3,
  "agentReadiness": 1
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.changeset/README.md`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-schema-drizzle.yml`
- `.github/workflows/release.yml`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `apps/api/README.md`
- `apps/api/package.json`
- `apps/facehash-landing/package.json`
- `apps/geoip/README.md`
- `apps/web/README.md`
- `apps/web/package.json`
- `apps/workers/package.json`
- `examples/nextjs-tailwind/CHANGELOG.md`
- `examples/nextjs-tailwind/README.md`
- `examples/nextjs-tailwind/package.json`
- `infra/aws/s3-public-setup/README.md`
- `infra/aws/ses-email-setup/README.md`
- `package.json`
- `packages/browser/CHANGELOG.md`
- `packages/browser/README.md`
- `packages/browser/package.json`
- `packages/core/CHANGELOG.md`
- `packages/core/package.json`
- `packages/facehash/CHANGELOG.md`
- `packages/facehash/README.md`
- `packages/facehash/package.json`
- `packages/jobs/package.json`
- `packages/location/CHANGELOG.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
