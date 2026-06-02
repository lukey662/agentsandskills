# Repo Finding: graphile/starter

## Why It Was Selected
- Category: design-systems
- Stars: 1823
- Last pushed: 2026-03-23T11:51:30Z
- Language: TypeScript
- URL: https://github.com/graphile/starter
- Score: 16/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 2,
  "frontendDesign": 2,
  "accessibility": 0,
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
- `.github/workflows/cypress.yml`
- `.github/workflows/nodejs.yml`
- `.github/workflows/pgrita.yml`
- `.github/workflows/production-docker.yml`
- `.github/workflows/test-docker.js`
- `.github/workflows/windows-nodejs.yml`
- `.vscode/README.md`
- `@app/README.md`
- `@app/__tests__/README.md`
- `@app/client/README.md`
- `@app/client/package.json`
- `@app/components/README.md`
- `@app/components/package.json`
- `@app/config/README.md`
- `@app/config/package.json`
- `@app/db/README.md`
- `@app/db/__tests__/README.md`
- `@app/db/migrations/README.md`
- `@app/db/package.json`
- `@app/e2e/README.md`
- `@app/e2e/package.json`
- `@app/graphql/README.md`
- `@app/graphql/package.json`
- `@app/lib/README.md`
- `@app/lib/package.json`
- `@app/server/README.md`
- `@app/server/package.json`
- `@app/worker/README.md`
- `@app/worker/package.json`
- `CONTRIBUTING.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
