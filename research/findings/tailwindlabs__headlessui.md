# Repo Finding: tailwindlabs/headlessui

## Why It Was Selected
- Category: design-systems
- Stars: 28596
- Last pushed: 2026-04-13T16:12:31Z
- Language: TypeScript
- URL: https://github.com/tailwindlabs/headlessui
- Score: 18/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 1,
  "documentation": 3,
  "ciDeployment": 4,
  "agentReadiness": 0
}
```

## Strong Practices
- None detected by static scan.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/CONTRIBUTING.md`
- `.github/workflows/main.yml`
- `.github/workflows/prepare-release.yml`
- `.github/workflows/release.yml`
- `CHANGELOG.md`
- `README.md`
- `package.json`
- `packages/@headlessui-react/CHANGELOG.md`
- `packages/@headlessui-react/README.md`
- `packages/@headlessui-react/package.json`
- `packages/@headlessui-tailwindcss/CHANGELOG.md`
- `packages/@headlessui-tailwindcss/README.md`
- `packages/@headlessui-tailwindcss/package.json`
- `packages/@headlessui-vue/CHANGELOG.md`
- `packages/@headlessui-vue/README.md`
- `packages/@headlessui-vue/package.json`
- `playgrounds/react/package.json`
- `playgrounds/vue/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
