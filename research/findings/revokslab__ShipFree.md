# Repo Finding: revokslab/ShipFree

## Why It Was Selected
- Category: production-saas
- Stars: 1658
- Last pushed: 2026-05-25T19:13:09Z
- Language: TypeScript
- URL: https://github.com/revokslab/ShipFree
- Score: 19/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 2,
  "testing": 0,
  "documentation": 4,
  "ciDeployment": 2,
  "agentReadiness": 5
}
```

## Strong Practices
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.

## Files Worth Studying
- `.claude/skills/vercel-react-best-practices/AGENTS.md`
- `.claude/skills/vercel-react-best-practices/README.md`
- `.cursor/skills/vercel-react-best-practices/AGENTS.md`
- `.cursor/skills/vercel-react-best-practices/README.md`
- `.opencode/skill/vercel-react-best-practices/AGENTS.md`
- `.opencode/skill/vercel-react-best-practices/README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `docker/README.md`
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
