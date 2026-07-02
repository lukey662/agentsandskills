# Deployment

This repo ships an npm package, so "deployment" means publishing `@appsforgood/next-supabase-kit` to the npm registry through GitHub Actions.

## Environments

- Local: development against `src/` with `npm run dev`; `npm run build` produces `dist/index.js`.
- CI: `.github/workflows/ci.yml` runs `release:check` and `smoke:audit-gate` on every push and pull request to `main`.
- Release: `.github/workflows/release.yml` publishes from the `npm-publish` GitHub environment using npm Trusted Publishing (OIDC), generates an SBOM, attaches provenance attestation, and runs post-publish verification.

## Environment Variables

- `GITHUB_TOKEN`: optional, used only by `agent-kit research discover|scan` for GitHub API access. Never committed; see `.env.example`.
- No other runtime environment variables exist. Release publishing uses OIDC identity, not stored npm tokens.

## Release Order

Before publishing a new version:

1. Update `CHANGELOG.md` and confirm `npm run version:check` passes.
2. Run `npm run release:check` locally (typecheck, tests, build, smoke install/studio/audit, example check, SBOM check, pack dry run).
3. Merge to `main` and confirm CI is green.
4. Trigger the release workflow for the tagged ref; it validates the publish ref, builds, publishes via Trusted Publishing, and attaches the SBOM.
5. Run `npm run publish:verify` to confirm public `npx` install, init, and audit work against the published version.

## Observability

- CI and release logs: GitHub Actions run history on `lukey662/agentsandskills`.
- Security scanning: CodeQL, OpenSSF Scorecard, and dependency review workflows report into the GitHub Security tab.
- Dependency freshness: Dependabot PRs.
- Package health: npm registry page (downloads, provenance badge) once published.
- There is no runtime telemetry; the CLI does not phone home.

## Rollback

- Code: revert the offending commit on `main`; CI must return green before any re-release.
- Package: npm unpublish is restricted, so ship a patch release with the fix and deprecate the broken version with `npm deprecate`.
- Release workflow mistakes: the workflow validates the publish ref and dry-run mode exercises all gates without credentials; failed publishes leave no partial state.
- Record rollback evidence (versions, commands, owner, date) in `UPGRADE.md` alongside the upgrade history table.

Link upgrade-specific rollback evidence from `UPGRADE.md` when the release includes package, framework, Agent Kit, or migration changes.
