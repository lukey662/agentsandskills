# Repo Finding: ccbrown/cloud-snitch

## Why It Was Selected
- Category: security-quality
- Stars: 377
- Last pushed: 2025-12-06T01:46:12Z
- Language: TypeScript
- URL: https://github.com/ccbrown/cloud-snitch
- Score: 12/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 2,
  "accessibility": 1,
  "testing": 0,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 0
}
```

## Strong Practices
- None detected by static scan.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/main.yaml`
- `.github/workflows/pull_request.yaml`
- `.github/workflows/release.yaml`
- `.github/workflows/test.yaml`
- `CONTRIBUTING.md`
- `README.md`
- `aws/README.md`
- `aws/package.json`
- `backend/README.md`
- `frontend/README.md`
- `frontend/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
