# Repo Finding: LubomirGeorgiev/cloudflare-workers-nextjs-saas-template

## Why It Was Selected
- Category: production-saas
- Stars: 767
- Last pushed: 2026-06-01T09:23:45Z
- Language: TypeScript
- URL: https://github.com/LubomirGeorgiev/cloudflare-workers-nextjs-saas-template
- Score: 21/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 2,
  "documentation": 2,
  "ciDeployment": 3,
  "agentReadiness": 4
}
```

## Strong Practices
- None detected by static scan.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.github/workflows/deploy.yml`
- `AGENTS.md`
- `README.md`
- `package.json`
- `scripts/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
