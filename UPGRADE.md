# Upgrade Guide

This file defines how maintainers and downstream projects should upgrade Agent Kit safely.

## Principles

- Upgrades are reviewable changes, not blind overwrites.
- Existing project docs and local overrides are preserved by default.
- Breaking behavior must be called out in `CHANGELOG.md`, `ROADMAP.md`, and release notes.
- Downstream projects should prove setup validity after each upgrade with `agent-kit audit`.

## Maintainer Release Checklist

Before publishing a new package version:

1. Update `CHANGELOG.md` with user-visible changes, migration notes, and deprecations.
2. Update `ROADMAP.md` and `BEST_PRACTICE_EVIDENCE.md` when a research finding becomes enforced behavior.
3. Run `npm run release:check`.
4. Run `agent-kit package validate` from the source repository when runtime adapter or package assets changed.
5. Confirm the pack dry run includes only public-safe files.
6. Publish through npm Trusted Publishing.
7. Verify public install with `npx @appsforgood/next-supabase-kit`.

## Downstream Upgrade Checklist

From a downstream project:

```bash
npx @appsforgood/next-supabase-kit@latest doctor
npx @appsforgood/next-supabase-kit@latest diff
npx @appsforgood/next-supabase-kit@latest update
npx @appsforgood/next-supabase-kit@latest adapter validate antigravity
npx @appsforgood/next-supabase-kit@latest audit --min-readiness baseline-setup
```

The package includes an older-install regression fixture that exercises this path. The fixture proves update preserves customized docs, writes conflict templates, installs new current baseline docs and `.agent-kit/` assets, then audits with zero failures.

`agent-kit diff` includes an upgrade preview. Review `preview.wouldCreate`, `preview.wouldWriteConflicts`, `agentRoster`, `modelRouting`, and `libraryFolders.missing` before running update so the branch owner knows which files will be created, which local docs will be preserved through conflicts, and which `.agent-kit/` assets will be refreshed.

For mature projects, raise the gate after local evidence is updated:

```bash
npx @appsforgood/next-supabase-kit@latest audit --min-readiness best-practice-candidate
```

## Review Order

1. Create a branch before running `agent-kit update`.
2. Run `agent-kit diff` and review every changed root markdown template.
3. Check `.agent-kit/conflicts/` before accepting template updates.
4. Preserve valid local customizations in `.agent-kit/overrides.json`.
5. Review `AGENTS.md`, `AGENT_ROSTER.md`, `ASSISTANT_ADAPTERS.md`, `MODEL_ROUTING.md`, `COUNCIL.md`, `QUALITY_GATES.md`, `SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, and this file.
6. If using Antigravity, review `.antigravity/agent-kit/plugin.json`, `.antigravity/agent-kit/commands/*.toml`, and `.antigravity/runtime-skills/*/SKILL.md`.
7. Run project tests and release checks before merging.
8. Record any accepted deviations in `DECISIONS.md`.

## Next.js And Supabase Stack Upgrades

- Use official Next.js upgrade guides and codemods for framework changes.
- Treat Supabase schema, RLS, storage, and auth changes as migration work, not ad hoc dashboard edits.
- Verify migration history before deployment.
- Record migration order, rollback risk, and verification evidence in `DEPLOYMENT.md`.
- Regenerate types after database schema changes when the project relies on generated Supabase types.

## Rollback

Keep rollback evidence next to the upgrade:

- Git branch or commit to revert.
- Package version before and after the upgrade.
- Template conflicts reviewed or deferred.
- Database migrations applied, reverted, or not applicable.
- Verification commands and results.
- Owner and date.

## Upgrade History

| Date | From | To | Scope | Evidence | Owner |
| --- | --- | --- | --- | --- | --- |
| TBD | TBD | TBD | TBD | TBD | TBD |
