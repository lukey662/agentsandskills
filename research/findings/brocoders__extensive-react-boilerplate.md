# Repo Finding: brocoders/extensive-react-boilerplate

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 506
- Last pushed: 2026-06-02T00:37:51Z
- Language: TypeScript
- URL: https://github.com/brocoders/extensive-react-boilerplate
- Score: 19/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 1,
  "frontendDesign": 3,
  "accessibility": 2,
  "testing": 3,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 2
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
- `.github/workflows/cli.yml`
- `.github/workflows/e2e.yml`
- `CHANGELOG.md`
- `CLAUDE.md`
- `README.md`
- `docs/README.md`
- `package.json`
- `playwright.config.ts`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
