# Deployment

This repo ships `@appsforgood/next-supabase-kit` and the optional `@appsforgood/agent-kit-runtime`, so "deployment" means publishing both npm packages through GitHub Actions.

## Environments

- Local: development against `src/` with `npm run dev`; `npm run build` produces `dist/index.js`.
- CI: `.github/workflows/ci.yml` runs `release:check` and `smoke:audit-gate` on every push and pull request to `main`.
- Release: `.github/workflows/release.yml` publishes runtime before root from the `npm-publish` GitHub environment using npm Trusted Publishing (OIDC), generates and attests a package-rooted SBOM for each tarball, and verifies both public packages before creating a GitHub release.

## Environment Variables

- `GITHUB_TOKEN`: optional, used only by `agent-kit research discover|scan` for GitHub API access. Never committed; see `.env.example`.
- Optional provider credentials use project-owned `env:` references or OS-keychain entries and are never required by baseline CI.
- Release publishing uses OIDC identity, not stored npm tokens. Both npm package records must trust `.github/workflows/release.yml` and the `npm-publish` environment.

## Release Order

Before publishing a new version:

1. Update root/runtime changesets and changelogs, then confirm `npm run version:check` passes for both workspace manifests.
2. Run `npm run release:check` locally (typecheck, tests, build, smoke install/studio/audit, example check, SBOM check, pack dry run).
3. Merge to `main` and confirm CI is green.
4. The release workflow packs and attests both packages, publishes runtime before root when needed, verifies both from the public registry, then creates the root-version GitHub release.
5. Confirm public runtime import plus root `doctor`, `init`, `audit`, and `orchestrate validate` verification passed.

## Observability

- CI and release logs: GitHub Actions run history on `lukey662/agentsandskills`.
- Security scanning: CodeQL, OpenSSF Scorecard, and dependency review workflows report into the GitHub Security tab.
- Dependency freshness: Dependabot PRs.
- Package health: npm registry page (downloads, provenance badge) once published.
- There is no hosted runtime telemetry; the CLI does not phone home. Local run status, approvals, provider selection, artifacts, verification, and errors are recorded under `.agent-kit/runtime/runs/`.

## Rollback

- Code: revert the offending commit on `main`; CI must return green before any re-release.
- Package: npm unpublish is restricted, so ship a patch release with the fix and deprecate the broken version with `npm deprecate`.
- Release workflow mistakes: the workflow validates the publish ref and dry-run mode exercises all gates without credentials; failed publishes leave no partial state.
- Runtime execution: reject/cancel the gate, inspect the cached worktree and `agent-kit/<run-id>` branch, preserve or remove the scoped commit manually, and keep SQLite/JSONL evidence until the incident review is complete.
- Record rollback evidence (versions, commands, owner, date) in `UPGRADE.md` alongside the upgrade history table.

Link upgrade-specific rollback evidence from `UPGRADE.md` when the release includes package, framework, Agent Kit, or migration changes.
