# Maintainer Release Evidence

Use this checklist when shipping `@appsforgood/next-supabase-kit`. Publish steps are in [PUBLISH.md](PUBLISH.md); the release gate is `npm run release:check`.

## Before the version bump

1. Every user-visible change has a changeset (`npx changeset`). `npm run changeset:check` passes.
2. `npm run release:check` passes locally. It includes `dogfood:check`, so this repo's own rendered agent and skill layers match the canonical files.
3. If `USER_GUIDE.html` changed, `qa-evidence/<date>-<slug>/` has desktop and mobile PNGs plus `notes.md` with a verdict, and `DOGFOOD.md` links them.
4. `DECISIONS.md` has an entry for anything that changed a contract (catalog, renderer, prune allowlist, host frontmatter).
5. `UPGRADE.md` has a section for the new version when downstream users need to do anything beyond `agent-kit update`.

## Dogfood in this repo

```bash
npm run dogfood:check          # regenerate .cursor/.claude/.codex/.agents/.github/agents, then verify
npx tsx src/cli/index.ts doctor
npx tsx src/cli/index.ts adapter validate all
```

Rendered layers other than `.cursor/rules/`, `CLAUDE.md`, and `.github/copilot-instructions.md` are gitignored. If `doctor` reports a council stub or a 0.4 skill copy, run `npx tsx src/cli/index.ts update --prune-legacy`.

## Ship

1. Merge the Version Packages PR.
2. Dispatch `Release` with `dry_run=true`; read the log.
3. Push or dispatch with `dry_run=false`. The workflow packs, attests the SBOM, publishes through Trusted Publishing, verifies the public package, and creates `vX.Y.Z`.
4. Record the version, date, and the post-publish verification result in `DOGFOOD.md`.

## Evidence table

| Item | Where |
| --- | --- |
| Tests, typecheck, lint, format, build, smokes | `npm run release:check` log |
| Rendered layers match canonical | `dogfood:check` line in that log |
| Guide screenshots | `qa-evidence/<date>-<slug>/` |
| Public install works | `Release` workflow "Verify package from the public registry" step, or `npm run publish:verify` |
| Decisions | `DECISIONS.md` |
