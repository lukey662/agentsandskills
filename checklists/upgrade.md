# Upgrade Checklist

- [ ] Branch created before upgrade work.
- [ ] Release notes, changelog, or migration guide reviewed.
- [ ] `agent-kit diff` reviewed before template updates.
- [ ] `agent-kit update` run only after preserving local work.
- [ ] `.agent-kit/conflicts/` reviewed.
- [ ] `.agent-kit/overrides.json` updated for accepted local deviations.
- [ ] Next.js codemods or manual upgrade steps reviewed when framework behavior changes.
- [ ] Supabase migration history, RLS impact, generated types, and rollback risk reviewed when data/auth changes.
- [ ] Tests, smoke checks, visual QA, or release checks run for affected areas.
- [ ] `agent-kit audit --min-readiness baseline-setup` passes.
- [ ] Upgrade evidence, rollback notes, owner, and date recorded in `UPGRADE.md`.
