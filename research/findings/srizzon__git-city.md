# Repo Finding: srizzon/git-city

## Why It Was Selected
- Category: supabase-nextjs
- Stars: 5607
- Last pushed: 2026-05-22T19:29:00Z
- Language: TypeScript
- URL: https://github.com/srizzon/git-city
- Score: 23/45

## Score
```json
{
  "architecture": 1,
  "supabaseAuthRls": 5,
  "security": 3,
  "frontendDesign": 3,
  "accessibility": 2,
  "testing": 0,
  "documentation": 5,
  "ciDeployment": 2,
  "agentReadiness": 2
}
```

## Strong Practices
- Supabase authorization appears to be handled close to the data boundary.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Accessibility signals are weak or absent.
- Agent handoff and AI-workflow instructions are not mature.

## Files Worth Studying
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `README.md`
- `SECURITY.md`
- `package.json`
- `packages/vscode-extension/CHANGELOG.md`
- `packages/vscode-extension/README.md`
- `packages/vscode-extension/package.json`
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_add_claimed_columns.sql`
- `supabase/migrations/003_monetization.sql`
- `supabase/migrations/004_pg_cron_ranks.sql`
- `supabase/migrations/005_tighten_rls.sql`
- `supabase/migrations/006_reprice_items.sql`
- `supabase/migrations/007_achievements_social_feed.sql`
- `supabase/migrations/008_update_item_catalog.sql`
- `supabase/migrations/0091_sky_ads.sql`
- `supabase/migrations/009_building_v2_fields.sql`
- `supabase/migrations/010_raise_achievement_thresholds.sql`
- `supabase/migrations/011_ad_events_github_login.sql`
- `supabase/migrations/012_sky_ads_self_service.sql`
- `supabase/migrations/013_building_ads.sql`
- `supabase/migrations/014_streak_system.sql`
- `supabase/migrations/015_raid_system.sql`
- `supabase/migrations/016_rabbit_system.sql`
- `supabase/migrations/017_seasonal_items.sql`
- `supabase/migrations/018_streak_rewards.sql`
- `supabase/migrations/019_districts.sql`
- `supabase/migrations/020_ad_events_country.sql`
- `supabase/migrations/021_milestone_celebrations.sql`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
