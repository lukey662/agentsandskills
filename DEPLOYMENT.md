# Deployment

This repo ships one npm package, `@appsforgood/next-supabase-kit`. "Deployment" means publishing it through GitHub Actions.

## Environments

- Local: development against `src/` with `npm run dev`; `npm run build` produces `dist/index.js`.
- Local delivery gate: `npm run release:check` and `npm run smoke:audit-gate`; this evidence is sufficient for commit/push when hosted Actions is unavailable.
- CI: `.github/workflows/ci.yml` mirrors local verification across Node 20/22/24 on Linux, Windows, and macOS, plus a Playwright job for `USER_GUIDE.html`.
- Release: `.github/workflows/release.yml` publishes from the `npm-publish` GitHub environment using npm Trusted Publishing (OIDC), generates and attests a CycloneDX SBOM for the tarball, verifies the public package, then creates the GitHub release. Inspect retries `npm view` (malware-scan staging can 404). Publish treats "Cannot publish over previously staged version" as already published and still creates the GitHub release when needed.

## Environment Variables

None are required to build, test, or install the kit. Release publishing uses OIDC identity, not stored npm tokens; the npm package record must trust `.github/workflows/release.yml` and the `npm-publish` environment.

## Release Order

1. Merge the Version Packages PR so `package.json`, `package-lock.json`, and `CHANGELOG.md` agree (`npm run version:check`).
2. Run `npm run release:check` locally.
3. Merge to `main`; the release workflow runs on the version bump, or dispatch it manually with `dry_run=false`.
4. Confirm the workflow's public verification (`init --activate all`, `doctor`, `adapter validate all`) passed and the `vX.Y.Z` release exists.

## Observability

- CI and release logs: GitHub Actions run history on `lukey662/agentsandskills`.
- Security scanning: CodeQL, OpenSSF Scorecard, and dependency review report into the GitHub Security tab.
- Dependency freshness: Dependabot PRs.
- Package health: the npm registry page (downloads, provenance badge).
- The CLI does not phone home and writes nothing outside the project it is run in.

## Rollback

- Code: revert the offending commit on `main`; the release gate must return green before any re-release.
- Package: npm unpublish is restricted, so ship a patch release with the fix and deprecate the broken version with `npm deprecate`.
- Downstream installs: `agent-kit update` to the patch; `update --prune-legacy` is opt-in and lists what it will remove before doing so.
- Record rollback evidence (versions, commands, owner, date) in `UPGRADE.md`.
