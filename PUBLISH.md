# Publish Runbook

Use this runbook to publish `@appsforgood/next-supabase-kit` and run post-publish verification.

## Preconditions

1. `npm run release:check` passes locally and in CI.
2. `@appsforgood` npm org access and Trusted Publishing are configured for `lukey662/agentsandskills`.
3. GitHub environment `npm-publish` exists with OIDC trusted publishing to npm.
4. `CHANGELOG.md` contains a release section aligned with `package.json`.

## Publish Steps

If GitHub Release publish fails with an npm trusted publishing or OIDC error, fix the npm Trusted Publisher settings for the package and `npm-publish` environment. The Release workflow intentionally does not set a publish token, scrubs inherited `NODE_AUTH_TOKEN` from the publish process, and uses a token-free npm config so OIDC is the only automated publish path. OTP-bound token automation should not be used for normal publishing.

### Option A: GitHub Release (preferred)

1. Merge release-ready changes to `main`.
2. Confirm CI is green, including `npm run smoke:audit-gate`.
3. Create and publish GitHub Release `vX.Y.Z` from `main` (tag must match `package.json`).
4. The [Release workflow](.github/workflows/release.yml) runs `npm run release:check`, publishes the tarball with provenance, and executes `npm run publish:verify`.

### Option B: Manual workflow dispatch

```bash
gh workflow run release.yml -f dry_run=false
```

Run only from `refs/heads/main` after `release:check` is green.

### Option C: Maintainer-local publish (fallback)

```bash
npm run release:check
npm pack
npm publish --access public
npm run publish:verify
```

Requires npm login with publish rights to `@appsforgood/next-supabase-kit`.

## Post-Publish Verification

`npm run publish:verify` checks:

- Registry visibility for `@appsforgood/next-supabase-kit@<version>`
- `npx @appsforgood/next-supabase-kit doctor`
- Clean temp `init --stack next-supabase`
- `audit --json --min-readiness baseline-setup` with zero failures

## After Publish

1. Mark `[x] Publish public v0.1 package` in [ROADMAP.md](ROADMAP.md).
2. Update [DOGFOOD.md](DOGFOOD.md) with publish verification evidence.
3. Verify Quick Start in [README.md](README.md) works with public `npx`.
