# Repo Finding: MrLesk/Backlog.md

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 5666
- Last pushed: 2026-05-30T19:20:27Z
- Language: TypeScript
- URL: https://github.com/MrLesk/Backlog.md
- Score: 20/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 1,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 3
}
```

## Strong Practices
- None detected by static scan.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `AGENTS.md`
- `CONTRIBUTING.md`
- `README.md`
- `completions/README.md`
- `package.json`
- `src/mcp/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
