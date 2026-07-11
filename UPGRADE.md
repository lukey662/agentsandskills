# Upgrade Guide

This file defines how maintainers and downstream projects should upgrade Agent Kit safely.

## Principles

- Upgrades are reviewable changes, not blind overwrites.
- Existing project docs and local overrides are preserved by default.
- Breaking behavior must be called out in `CHANGELOG.md`, `ROADMAP.md`, and release notes.
- Downstream projects should prove setup validity after each upgrade with `agent-kit audit`.

## Maintainer Release Checklist

Before publishing a new package version:

1. Update changesets plus root/runtime changelogs with user-visible changes, migration notes, and deprecations.
2. Update `ROADMAP.md` and `BEST_PRACTICE_EVIDENCE.md` when a research finding becomes enforced behavior.
3. Run `npm run release:check`.
4. Run `agent-kit package validate` from the source repository when runtime adapter or package assets changed.
5. Confirm root and runtime pack dry runs include only public-safe files.
6. Publish runtime then root through npm Trusted Publishing with separate SBOM attestations.
7. Verify public runtime import plus root `doctor`, `init`, `audit`, and `orchestrate validate`.

## Downstream Upgrade Checklist

From a downstream project:

```bash
npx @appsforgood/next-supabase-kit@latest doctor
npx @appsforgood/next-supabase-kit@latest diff
npx @appsforgood/next-supabase-kit@latest update
npx @appsforgood/next-supabase-kit@latest adapter validate antigravity
npx @appsforgood/next-supabase-kit@latest audit --min-readiness baseline-setup
```

Projects using executable orchestration should also upgrade the optional runtime deliberately:

```bash
npm install --save-dev @appsforgood/agent-kit-runtime@latest
agent-kit orchestrate validate
agent-kit orchestrate plan "Upgrade verification"
```

Review `.agent-kit/orchestrator.json` conflict proposals, schema changes, provider capability declarations, MCP/host/private-network exceptions, Docker image availability, native `better-sqlite3` install policy, and checkpoint compatibility before enabling runs. Finish or cancel paused runs before changing runtime versions.

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
| 2026-06-14 | TypeScript 5 / Node 22 types | TypeScript 6 / Node 25 types | Dev dependency update for package validation and CI parity | `npm run typecheck`, `npm test`, `npm audit --audit-level=moderate` | Maintainers |
| 2026-06 | 0.1.0 | 0.1.1 | Package rename to `@appsforgood/next-supabase-kit`, harness readiness gates, adapter install on init, publish prep | `CHANGELOG.md` 0.1.1 entry, `npm run release:check` green, commit `37e1a0f` | lukey662 |
| 2026-07-02 | none | 0.1.1 (self-install) | Dogfooded the kit into this repo's own root: `agent-kit init` installed root docs, `.agent-kit/`, and confirmed the Cursor rules' referenced files exist | `.agent-kit/manifest.json`, `agent-kit audit` zero failures, `COUNCIL.md` 2026-07-02 session | lukey662 |
