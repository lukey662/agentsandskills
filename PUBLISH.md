# Publish Runbook

Use this runbook to publish `@appsforgood/agent-kit-runtime` and `@appsforgood/next-supabase-kit`, then run post-publish verification.

## Preconditions

1. `npm run release:check` passes locally and in CI (includes `npm run adapter:validate` for all IDE adapter templates).
2. `@appsforgood` npm org access and separate Trusted Publishers for both package names are configured for `lukey662/agentsandskills`.
3. GitHub environment `npm-publish` exists with OIDC trusted publishing to npm.
4. Root/runtime changelogs align with both package manifests and `npm run version:check`.

## Publish Steps

If publishing fails with a Trusted Publishing or OIDC error, fix the npm Trusted Publisher settings for the package and `npm-publish` environment. The workflow has no token fallback: it removes inherited npm token variables and uses a token-free npm configuration.

### Option A: Merge the Changesets version PR (preferred)

1. Merge release-ready changes and their changeset to `main`.
2. The version workflow opens or updates the `Version Packages` PR.
3. Confirm CI is green, including `npm run smoke:audit-gate`, then merge the version PR.
4. The [Release workflow](.github/workflows/release.yml) inspects both versions, runs `npm run release:check`, publishes runtime before root, verifies both exact packages, then creates `vX.Y.Z` and its GitHub release.

### Option B: Manual workflow dispatch

```bash
gh workflow run release.yml -f dry_run=false
```

Use `dry_run=true` for evidence-only validation. A non-dry-run dispatch is protected by the `npm-publish` environment and publishes only when the package version is absent from npm.

### Option C: Maintainer-local recovery

```bash
npm run release:check
npm pack
npm pack --workspace @appsforgood/agent-kit-runtime
npm publish ./appsforgood-agent-kit-runtime-<version>.tgz --access public
npm publish ./appsforgood-next-supabase-kit-<version>.tgz --access public
npm run publish:verify
```

Requires an interactive npm login with publish rights and current OTP. Use only when GitHub or npm Trusted Publishing is unavailable, then record why the normal provenance path could not be used.

## Post-Publish Verification

`npm run publish:verify` checks:

- Registry visibility for `@appsforgood/next-supabase-kit@<version>`
- Registry visibility and clean import for `@appsforgood/agent-kit-runtime@<version>`
- Clean temp install of both packages
- Root `doctor`, `init --stack next-supabase`, `audit --json --min-readiness baseline-setup`, and `orchestrate validate --json`

## After Publish

1. Mark `[x] Publish public v0.1 package` in [ROADMAP.md](ROADMAP.md).
2. Update [DOGFOOD.md](DOGFOOD.md) with publish verification evidence.
3. Verify Quick Start in [README.md](README.md) works with public `npx`.
4. Record release session evidence per [MAINTAINER_RELEASE.md](MAINTAINER_RELEASE.md).
