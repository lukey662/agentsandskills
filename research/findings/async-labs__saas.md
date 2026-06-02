# Repo Finding: async-labs/saas

## Why It Was Selected
- Category: production-saas
- Stars: 4474
- Last pushed: 2025-03-21T18:07:06Z
- Language: TypeScript
- URL: https://github.com/async-labs/saas
- Score: 10/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 0,
  "security": 0,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 1,
  "documentation": 2,
  "ciDeployment": 1,
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
- `README.md`
- `book/1-end/app/README.md`
- `book/1-end/app/package.json`
- `book/10-begin/api/package.json`
- `book/10-begin/app/README.md`
- `book/10-begin/app/package.json`
- `book/10-begin/lambda/package.json`
- `book/10-end-functional/api/package.json`
- `book/10-end-functional/app/package.json`
- `book/10-end-functional/lambda/package.json`
- `book/10-end/api/package.json`
- `book/10-end/app/package.json`
- `book/10-end/lambda/package.json`
- `book/2-begin/app/README.md`
- `book/2-begin/app/package.json`
- `book/2-end/app/README.md`
- `book/2-end/app/package.json`
- `book/3-begin/app/README.md`
- `book/3-begin/app/package.json`
- `book/3-end/api/package.json`
- `book/3-end/app/README.md`
- `book/3-end/app/package.json`
- `book/4-begin/api/package.json`
- `book/4-begin/app/README.md`
- `book/4-begin/app/package.json`
- `book/4-end/api/package.json`
- `book/4-end/app/README.md`
- `book/4-end/app/package.json`
- `book/5-begin/api/package.json`
- `book/5-begin/app/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
