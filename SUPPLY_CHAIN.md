# Supply Chain Security

The kit is published to public npm. Release integrity is part of the product, not an optional operations detail.

## Publish Identity

- Public package: `@appsforgood/next-supabase-kit`.
- Publish path: GitHub Actions release workflow through npm Trusted Publishing.
- Authentication: short-lived GitHub OIDC identity only; automated publishing has no npm token fallback.
- Environment: `npm-publish`.
- The npm package has a Trusted Publisher scoped to repository `lukey662/agentsandskills`, workflow `release.yml`, environment `npm-publish`, and allowed action `npm publish`.

The workflow removes inherited npm token variables, supplies a token-free npm configuration, and requires the GitHub OIDC request context before publishing. A missing or incorrect package-level Trusted Publisher fails closed instead of switching authentication modes. Successful publication carries npm provenance tied to that workflow identity.

The release workflow creates one tarball and a lockfile-derived CycloneDX SBOM, uploads both as release evidence, and attests the SBOM against the exact tarball. The public package is verified before the GitHub release is created, so a failed publish cannot produce an apparently successful source release.

## Release Gates

Before publish:

- `npm ci`
- `npm run release:check`
- Public release review

`npm run release:check` validates JSON assets, typechecks, lints, tests with a coverage gate, builds, validates package and adapters, checks the example fixture and the maintainer dogfood layers, runs install smoke, runs dependency audit, validates SBOM generation, and dry-runs `npm pack`. The install smoke also inspects packaged public files for forbidden private-package text.

`npm run sbom:check` validates that the lockfile-derived CycloneDX SBOM can be generated, includes runtime dependencies, and has no unresolved required dependency links. Optional platform-specific dependency links may be skipped when npm records optional package edges that are not present for the current install target.

Inspect retries `npm view` because npm malware-scan staging can 404 a version that already published. If `npm publish` returns “Cannot publish over previously staged version,” treat that version as already published and continue verification / GitHub release. Do not republish.

After publish:

- `npm view @appsforgood/next-supabase-kit@<version> version`
- Clean install followed by `init --activate all`, `doctor`, and `adapter validate all`

The release workflow and `npm run publish:verify` both use `scripts/post-publish-verify.mjs` for this post-publish verification path.

## Repository Automation

- Local `npm run release:check` is the default package verification and supply-chain gate.
- Hosted CI may mirror package verification on push and pull request when Actions entitlement is deliberately enabled.
- Dependency Review can block pull requests that introduce moderate or worse known vulnerabilities when hosted Actions is available; otherwise review `npm audit` and lockfile changes locally.
- Dependabot proposes npm and GitHub Actions updates; workflow actions remain pinned to immutable commit SHAs with reviewed version comments.
- CodeQL scans JavaScript/TypeScript code.
- OpenSSF Scorecard publishes repository security posture as code-scanning evidence.
- CODEOWNERS identifies default review ownership for source, templates, agents, skills, the catalog, and workflows.
- Release artifacts include an attested CycloneDX SBOM for the npm tarball.

## Maintainer Rules

- Do not use npm publish tokens for automation. Maintainer-local OTP publishing is an explicit recovery operation, not a workflow fallback.
- Do not publish from unreviewed branches or untrusted workflow changes.
- Treat workflow edits as release-risk changes requiring security and maintainer review.
- Keep package-write token secrets absent from repository and environment configuration.
- Keep package contents free of secrets, private downstream data, and copied third-party source.
- Keep SBOM generation and attestation in the shared release path; do not publish an unattested tarball when the workflow is available.
- Keep `allowScripts` approvals version-pinned to reviewed required native/build packages. Explicitly deny optional package scripts that are not needed.
