# Repo Finding: google-labs-code/design.md

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 15165
- Last pushed: 2026-06-02T05:41:47Z
- Language: TypeScript
- URL: https://github.com/google-labs-code/design.md
- Score: 15/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 0,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 1,
  "testing": 1,
  "documentation": 4,
  "ciDeployment": 2,
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
- `.github/workflows/test.yml`
- `CONTRIBUTING.md`
- `README.md`
- `examples/atmospheric-glass/README.md`
- `examples/paws-and-paths/README.md`
- `examples/totality-festival/README.md`
- `package.json`
- `packages/cli/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
