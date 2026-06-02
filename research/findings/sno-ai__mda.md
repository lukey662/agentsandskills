# Repo Finding: sno-ai/mda

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 564
- Last pushed: 2026-05-26T04:37:44Z
- Language: TypeScript
- URL: https://github.com/sno-ai/mda
- Score: 19/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 3,
  "frontendDesign": 2,
  "accessibility": 0,
  "testing": 1,
  "documentation": 5,
  "ciDeployment": 3,
  "agentReadiness": 4
}
```

## Strong Practices
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.
- Accessibility signals are weak or absent.

## Files Worth Studying
- `.github/workflows/pr-checks.yml`
- `.github/workflows/publish-cli.yml`
- `CHANGELOG.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `apps/cli/README.md`
- `apps/cli/package.json`
- `compat/claude-code/README.md`
- `compat/codex-cli/README.md`
- `compat/hermes/README.md`
- `compat/openclaw/README.md`
- `compat/opencode/README.md`
- `conformance/README.md`
- `conformance/compile/46-basic-targets/expected/AGENTS.md`
- `examples/README.md`
- `package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
