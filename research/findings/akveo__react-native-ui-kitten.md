# Repo Finding: akveo/react-native-ui-kitten

## Why It Was Selected
- Category: design-systems
- Stars: 10681
- Last pushed: 2026-03-04T19:26:29Z
- Language: TypeScript
- URL: https://github.com/akveo/react-native-ui-kitten
- Score: 17/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 1,
  "frontendDesign": 2,
  "accessibility": 2,
  "testing": 3,
  "documentation": 4,
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
- `.github/workflows/continuous-integration-workflow.yml`
- `.github/workflows/publish-kitten-tricks.yml`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `README.md`
- `docs/package.json`
- `package.json`
- `src/components/package.json`
- `src/date-fns/package.json`
- `src/eva-icons/package.json`
- `src/metro-config/package.json`
- `src/moment/package.json`
- `src/showcases/package.json`
- `src/template-js/package.json`
- `src/template-js/template/package.json`
- `src/template-ts/package.json`
- `src/template-ts/template/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
