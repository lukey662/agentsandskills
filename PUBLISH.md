# Publish Runbook (v0.1.0)

Use this runbook to complete Phase 6 publish and post-publish verification for `@agent-skills/next-supabase-kit`.

## Preconditions

1. `npm run release:check` passes locally and in CI.
2. `@agent-skills` npm scope access and Trusted Publishing are configured for `lukey662/agentsandskills`.
3. GitHub environment `npm-publish` exists with OIDC trusted publishing to npm.
4. `CHANGELOG.md` contains a `0.1.0` section aligned with `package.json`.

## Publish Steps

### Option A: GitHub Release (preferred)

1. Merge release-ready changes to `main`.
2. Confirm CI is green, including `npm run smoke:audit-gate`.
3. Create and publish GitHub Release `v0.1.0` from `main`.
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

Requires npm login with publish rights to `@agent-skills`.

## Post-Publish Verification

`npm run publish:verify` checks:

- Registry visibility for `@agent-skills/next-supabase-kit@0.1.0`
- `npx @agent-skills/next-supabase-kit doctor`
- Clean temp `init --stack next-supabase`
- `audit --json --min-readiness baseline-setup` with zero failures

## After Publish

1. Mark `[x] Publish public v0.1 package` in [ROADMAP.md](ROADMAP.md).
2. Update [DOGFOOD.md](DOGFOOD.md) with publish verification evidence.
3. Verify Quick Start in [README.md](README.md) works with public `npx`.
