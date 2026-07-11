# Upgrade Guide

Use this file when upgrading Agent Kit, Next.js, Supabase, shared UI primitives, or any tool that changes project behavior.

## Agent Kit Upgrade Flow

```bash
npx @appsforgood/next-supabase-kit@latest doctor
npx @appsforgood/next-supabase-kit@latest diff
npx @appsforgood/next-supabase-kit@latest update
npx @appsforgood/next-supabase-kit@latest adapter validate antigravity
npx @appsforgood/next-supabase-kit@latest setup --status
npx @appsforgood/next-supabase-kit@latest audit --min-readiness baseline-setup
```

Use `agent-kit audit --min-readiness best-practice-candidate` only after starter placeholders and upgrade evidence are replaced with project-specific evidence.

## Required Review

- Create a branch before running `agent-kit update`.
- Run `agent-kit diff` before accepting changed templates.
- Review `.agent-kit/conflicts/` before accepting changed templates.
- Preserve valid local customizations in `.agent-kit/overrides.json`.
- Review `AGENTS.md`, `AGENT_ROSTER.md`, `ASSISTANT_ADAPTERS.md`, `MODEL_ROUTING.md`, `COUNCIL.md`, `QUALITY_GATES.md`, `SECURITY.md`, `TESTING.md`, and `DEPLOYMENT.md`.
- If using Antigravity, review `.antigravity/agent-kit/plugin.json`, `.antigravity/agent-kit/commands/*.toml`, and `.antigravity/runtime-skills/*/SKILL.md`.
- Validate runtime adapter assets with `agent-kit adapter validate antigravity`.
- If `@appsforgood/agent-kit-runtime` is installed, finish or cancel paused runs, update it deliberately, review `.agent-kit/orchestrator.json` and runtime schema conflict proposals, then run `agent-kit orchestrate validate` and an offline plan.
- Record accepted tradeoffs in `DECISIONS.md`.
- Update this file with package version, release notes, migration status, rollback notes, owner, and date.

## Next.js Upgrade Notes

- Check the official Next.js upgrade guide for the target version.
- Use official Next.js codemods when the upgrade guide recommends them.
- Confirm routing, Server Component, Client Component, Route Handler, Server Action, caching, metadata, and middleware behavior.
- Confirm model-routing recommendations, IDE enforcement limits, and dated model comments still match the project's active tools.
- Run build, tests, smoke checks, and visual QA for affected screens.

## Supabase Upgrade Notes

- Treat schema, RLS, storage, auth, and edge-function changes as migration work.
- Check local and remote migration history before deployment.
- Do not rely on dashboard-only database changes for production behavior.
- Record migration order, rollback risk, and verification evidence in `DEPLOYMENT.md`.
- Regenerate typed clients after schema changes when the project uses generated Supabase types.

## Rollback Evidence

| Item | Value |
| --- | --- |
| Previous package/framework version | TBD |
| New package/framework version | TBD |
| Branch or revert commit | TBD |
| Template conflicts reviewed | TBD |
| Database migrations applied | TBD |
| Rollback command or process | TBD |
| Verification commands | TBD |
| Owner/date | TBD |

## Upgrade History

| Date | Change | Evidence | Outcome |
| --- | --- | --- | --- |
| TBD | TBD | TBD | TBD |
