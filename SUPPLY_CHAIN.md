# Supply Chain Security

The root kit and optional runtime are intended for public npm distribution. Release integrity is part of the product, not an optional operations detail.

## Publish Identity

- Public packages: `@appsforgood/next-supabase-kit` and `@appsforgood/agent-kit-runtime`.
- Publish path: GitHub Actions release workflow through npm Trusted Publishing.
- Authentication: short-lived GitHub OIDC identity only; automated publishing has no npm token fallback.
- Environment: `npm-publish`.
- Each npm package must have its own Trusted Publisher scoped to repository `lukey662/agentsandskills`, workflow `release.yml`, environment `npm-publish`, and allowed action `npm publish`.

The workflow removes inherited npm token variables, supplies a token-free npm configuration, and requires the GitHub OIDC request context before publishing. A missing or incorrect package-level Trusted Publisher fails closed instead of switching authentication modes. Successful publication carries npm provenance tied to that workflow identity.

The release workflow creates separate root/runtime tarballs and package-rooted CycloneDX SBOMs, uploads them as release evidence, and attests each SBOM against its exact tarball. Runtime publishes before root when both are new. Both public packages are verified before the matching GitHub release, so a partial npm publish cannot create an apparently successful source release.

## Release Gates

Before publish:

- `npm ci`
- `npm run release:check`
- Public release review

`npm run release:check` validates JSON assets, typechecks both workspaces, tests, builds both packages, runs install smoke, runs dependency audit, validates SBOM generation, and performs root/runtime package dry runs. The install smoke also inspects packaged public files for forbidden private-package text.

`npm run sbom:check` validates that the lockfile-derived CycloneDX SBOM can be generated, includes runtime dependencies, and has no unresolved required dependency links. Optional platform-specific dependency links may be skipped when npm records optional package edges that are not present for the current install target.

After publish:

- `npm view @appsforgood/next-supabase-kit@<version> version`
- `npm view @appsforgood/agent-kit-runtime@<version> version`
- Clean install and import of `@appsforgood/agent-kit-runtime`
- Clean install of both packages followed by root `doctor`, `init`, `audit --json` with zero failures, and `orchestrate validate --json`

The release workflow and `npm run publish:verify` both use `scripts/post-publish-verify.mjs` for this post-publish verification path.

## Repository Automation

- CI verifies package behavior on push and pull request.
- Dependency Review blocks pull requests that introduce moderate or worse known vulnerabilities.
- Dependabot proposes npm and GitHub Actions updates; workflow actions remain pinned to immutable commit SHAs with reviewed version comments.
- CodeQL scans JavaScript/TypeScript code.
- OpenSSF Scorecard publishes repository security posture as code-scanning evidence.
- CODEOWNERS identifies default review ownership for source, templates, schemas, and workflows.
- Release artifacts include an attested CycloneDX SBOM for the npm tarball.

## Maintainer Rules

- Do not use npm publish tokens for automation. Maintainer-local OTP publishing is an explicit recovery operation, not a workflow fallback.
- Do not publish from unreviewed branches or untrusted workflow changes.
- Treat workflow edits as release-risk changes requiring security and maintainer review.
- Keep package-write token secrets absent from repository and environment configuration.
- Keep package contents free of secrets, private downstream data, and copied third-party source.
- Keep SBOM generation and attestation in the shared release path; do not publish an unattested tarball when the workflow is available.
- Keep `allowScripts` approvals version-pinned to reviewed required native/build packages. Explicitly deny optional package scripts that are not needed.
