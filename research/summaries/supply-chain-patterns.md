# Supply Chain Patterns

Generated from a focused public package supply-chain pass.

## Focused Sources Reviewed

- npm Trusted Publishing documentation: GitHub Actions OIDC can publish without long-lived automation tokens, and public trusted publishes generate provenance attestations automatically.
- npm provenance documentation: provenance links package artifacts to source and build instructions so consumers can verify origin.
- GitHub Dependency Review action documentation: pull requests that change dependencies can be checked for vulnerabilities and policy issues.
- OpenSSF Scorecard action documentation: repository security posture can be measured and published as code-scanning evidence.
- GitHub artifact attestation documentation: release evidence can bind an SBOM to a specific package artifact.
- GitHub workflow security patterns: least-privilege permissions, explicit concurrency, and non-persistent checkout credentials reduce accidental workflow risk.

## Repeated Patterns To Adopt

- Prefer OIDC Trusted Publishing over long-lived npm publish tokens.
- Document provenance expectations in package release docs.
- Add dependency review for pull requests that change dependency graphs.
- Add Scorecard or equivalent repository security posture checks.
- Keep CodeQL and dependency update automation active.
- Generate an SBOM for release artifacts and attest it against the exact artifact being published.
- Treat workflow edits as release-risk changes.
- Validate manual publish paths so accidental non-main publishes are not accepted.

## Promoted Updates

- Added `SUPPLY_CHAIN.md`.
- Added `.github/workflows/dependency-review.yml`.
- Added `.github/workflows/scorecard.yml`.
- Hardened workflow checkout with `persist-credentials: false`.
- Added workflow concurrency.
- Added manual publish ref validation for release workflow dispatches.
- Added lockfile-derived CycloneDX SBOM validation.
- Added release-workflow SBOM attestation for the exact npm tarball being published.
- Added supply-chain scanner score and research category.
- Added public-readiness tests for supply-chain files and release controls.

Do not treat provenance as a complete guarantee of safety. Provenance proves origin and workflow context; maintainers still need dependency review, workflow review, branch/environment controls, and post-publish verification.
