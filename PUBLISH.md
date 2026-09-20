# Publish Runbook

Use this runbook to publish `@appsforgood/next-supabase-kit` and run post-publish verification. The optional runtime package is no longer in this repository (last source at tag `runtime-0.1.3`).

## Before you start

1. `main` is green in CI.
2. The Version Packages PR is merged, so `package.json`, `package-lock.json`, and `CHANGELOG.md` agree (`npm run version:check`).
3. `npm run release:check` passes locally.
4. `DOGFOOD.md` has an entry for this version with the `USER_GUIDE.html` desktop and mobile evidence.

## Publish

Preferred: let the [Release workflow](.github/workflows/release.yml) run on the version-bump push to `main`. It inspects npm and GitHub release state, runs `release:check`, packs one tarball, generates and attests the SBOM, publishes through npm Trusted Publishing with inherited token state scrubbed, verifies the published package, then creates `vX.Y.Z`.

Dry run first from the Actions tab with `dry_run=true`.

Manual fallback (verified local checkout, OTP):

```bash
npm run release:check
npm pack
npm publish ./appsforgood-next-supabase-kit-<version>.tgz --access public --provenance
npm run publish:verify
```

## Verify

`npm run publish:verify` waits for registry propagation, installs the published package into a clean temp project, runs `init --activate all`, `doctor`, and `adapter validate all`, and checks that `.agents/skills/browser-qa/SKILL.md` and `.cursor/agents/qa.md` exist and the guide keeps the fail-closed sentence.

Record the result in `DOGFOOD.md` and `MAINTAINER_RELEASE.md`.
