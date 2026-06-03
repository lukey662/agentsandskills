# Supply Chain Security

This package is intended for public npm distribution and downstream project bootstrapping. Release integrity is part of the product, not an optional operations detail.

## Publish Identity

- Public package: `@agent-skills/next-supabase-kit`.
- Publish path: GitHub Actions release workflow through npm Trusted Publishing.
- Authentication: OIDC trusted publisher, not a long-lived npm automation token.
- Environment: `npm-publish`.
- Trusted publisher must be scoped to repository `lukey662/agentsandskills`, workflow `release.yml`, and allowed action `npm publish`.

When npm Trusted Publishing is used from a public GitHub repository for a public package, npm generates provenance attestations automatically. The release workflow keeps `id-token: write` for this reason and does not set `NODE_AUTH_TOKEN` for publishing.

The release workflow also creates a deterministic package tarball, generates a CycloneDX SBOM from `package-lock.json`, uploads the tarball, SBOM, and pack metadata as release evidence, and attests the SBOM against the exact tarball path that is published to npm.

## Release Gates

Before publish:

- `npm ci`
- `npm run release:check`
- Public release review

`npm run release:check` validates JSON assets, typechecks, tests, builds, runs install smoke, runs dependency audit, validates SBOM generation, and performs package dry run. The install smoke also inspects packaged public files for forbidden private-package text.

`npm run sbom:check` validates that the lockfile-derived CycloneDX SBOM can be generated, includes runtime dependencies, and has no unresolved required dependency links. Optional platform-specific dependency links may be skipped when npm records optional package edges that are not present for the current install target.

After publish:

- `npm view @agent-skills/next-supabase-kit@<version> version`
- `npx --yes @agent-skills/next-supabase-kit@<version> doctor`
- `npx --yes @agent-skills/next-supabase-kit@<version> init --stack next-supabase` in a clean temp project
- `npx --yes @agent-skills/next-supabase-kit@<version> audit --json` with zero failures

The release workflow and `npm run publish:verify` both use `scripts/post-publish-verify.mjs` for this post-publish verification path.

## Repository Automation

- CI verifies package behavior on push and pull request.
- Dependency Review blocks pull requests that introduce moderate or worse known vulnerabilities.
- Dependabot proposes npm and GitHub Actions updates.
- CodeQL scans JavaScript/TypeScript code.
- OpenSSF Scorecard publishes repository security posture as code-scanning evidence.
- CODEOWNERS identifies default review ownership for source, templates, schemas, and workflows.
- Release artifacts include an attested CycloneDX SBOM for the npm tarball.

## Maintainer Rules

- Do not use bypass-2FA npm publish tokens for automation.
- Do not publish from unreviewed branches or untrusted workflow changes.
- Treat workflow edits as release-risk changes requiring security and maintainer review.
- Rotate and delete legacy publish secrets after Trusted Publishing is confirmed.
- Keep package contents free of secrets, private downstream data, and copied third-party source.
- Keep SBOM generation and attestation in the shared release path; do not publish an unattested tarball when the workflow is available.
