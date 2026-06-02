# Repo Finding: firecrawl/open-scouts

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 1282
- Last pushed: 2026-05-22T10:33:49Z
- Language: TypeScript
- URL: https://github.com/firecrawl/open-scouts
- Score: 23/45

## Score
```json
{
  "architecture": 3,
  "supabaseAuthRls": 5,
  "security": 2,
  "frontendDesign": 5,
  "accessibility": 3,
  "testing": 0,
  "documentation": 2,
  "ciDeployment": 1,
  "agentReadiness": 2
}
```

## Strong Practices
- Supabase authorization appears to be handled close to the data boundary.
- Frontend implementation shows reusable components, states, and design-system signals.

## Weaknesses / Not Worth Copying Blindly
- Security expectations are implicit or incomplete.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `README.md`
- `components/shared/effects/CLAUDE.md`
- `components/ui/CLAUDE.md`
- `package.json`
- `public/fonts/README.md`
- `supabase/migrations/00000000000000_schema.sql`
- `supabase/migrations/20241208_add_custom_api_key.sql`
- `supabase/migrations/20251209_add_consecutive_failures.sql`
- `supabase/migrations/20260521_lock_down_firecrawl_key_columns.sql`
- `supabase/migrations/old_migrations/20250110_create_scout_executions.sql`
- `supabase/migrations/old_migrations/20250110_create_scouts_tables.sql`
- `supabase/migrations/old_migrations/20251111175437_fix_is_active_default.sql`
- `supabase/migrations/old_migrations/20251111182000_change_results_summary_to_jsonb.sql`
- `supabase/migrations/old_migrations/20251113124500_create_user_preferences.sql`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
