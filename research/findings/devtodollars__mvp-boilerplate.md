# Repo Finding: devtodollars/mvp-boilerplate

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 987
- Last pushed: 2026-03-05T19:46:05Z
- Language: TypeScript
- URL: https://github.com/devtodollars/mvp-boilerplate
- Score: 20/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 5,
  "security": 1,
  "frontendDesign": 3,
  "accessibility": 2,
  "testing": 0,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 2
}
```

## Strong Practices
- Supabase authorization appears to be handled close to the data boundary.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `.github/workflows/flutter-web.yml`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `docs/README.md`
- `docs/coding-agent/README.md`
- `docs/flutter/README.md`
- `docs/posthog/README.md`
- `docs/stripe/README.md`
- `docs/supabase/README.md`
- `docs/supabase/local-development/README.md`
- `docs/vercel/README.md`
- `flutter/README.md`
- `flutter/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md`
- `nextjs/README.md`
- `nextjs/package.json`
- `supabase/README.md`
- `supabase/migrations/20240717231009_init.sql`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
