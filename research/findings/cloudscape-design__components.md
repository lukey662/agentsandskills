# Repo Finding: cloudscape-design/components

## Why It Was Selected
- Category: design-systems
- Stars: 2589
- Last pushed: 2026-06-02T08:43:53Z
- Language: TypeScript
- URL: https://github.com/cloudscape-design/components
- Score: 19/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 1,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 2,
  "documentation": 3,
  "ciDeployment": 3,
  "agentReadiness": 3
}
```

## Strong Practices
- None detected by static scan.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.github/workflows/build-lint-test.yml`
- `.github/workflows/bundle-size.yml`
- `.github/workflows/bundle-size/.gitignore`
- `.github/workflows/bundle-size/build.js`
- `.github/workflows/bundle-size/main.js`
- `.github/workflows/bundle-size/package-lock.json`
- `.github/workflows/bundle-size/package.json`
- `.github/workflows/bundle-size/status-report.js`
- `.github/workflows/close-stale-issues.yml`
- `.github/workflows/dependabot-lockfile-cleanup.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/dry-run.yml`
- `.github/workflows/lint-pr.yml`
- `.github/workflows/release-gh-notes.yml`
- `.github/workflows/release.yml`
- `AGENTS.md`
- `CONTRIBUTING.md`
- `README.md`
- `build-tools/eslint/package.json`
- `package.json`
- `style-dictionary/package.json`
- `vendor/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
