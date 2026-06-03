# Public Release Review

Date: 2026-06-02
Current outcome: ready for public release after npm scope setup and publish verification.

## License

- Current state: MIT license applied.
- Public requirement: permissive license suitable for templates, prompts, and CLI usage.
- Status: ready.

## Security

- Current state: security guidance, OWASP checks, RLS guidance, dependency audit, CI, install smoke, and release dry run are in place.
- Public requirement: keep vulnerability reports private until coordinated disclosure is complete.
- Status: ready.

## Prompts And Assumptions

- Current state: public package metadata and packaged docs use neutral project language.
- Public requirement: avoid proprietary assumptions, private organization branding, and unsupported provider claims.
- Status: ready.

## Research And Citations

- Current state: public package contents include generalized summaries, promoted decisions, scan plan, and citation policy.
- Current state: `BEST_PRACTICE_EVIDENCE.md` maps repeated research findings to concrete installed assets, audit checks, tests, workflows, and release gates.
- Current state: `DOGFOOD.md` summarizes current read-only downstream adoption evidence without publishing local project paths.
- Public requirement: detailed per-repo findings stay out of the public package unless separately reviewed.
- Status: ready.

## Repository Health

- Current state: issue forms, PR template, labels, PR labeler, CODEOWNERS, Dependabot, CodeQL, repository settings, support, conduct, and governance docs are present and covered by public-readiness tests.
- Public requirement: contributors have structured intake, labels, branch protection guidance, release environment settings, review ownership, dependency automation, security scanning, support expectations, and research-promotion rules.
- Status: ready.

## Supply Chain

- Current state: release workflow uses npm Trusted Publishing/OIDC, no publish token, manual publish ref validation, Dependency Review, OpenSSF Scorecard, CodeQL, Dependabot, and documented provenance expectations.
- Public requirement: package releases should be traceable to the expected repository/workflow and dependency or workflow-risk changes should be visible before merge.
- Status: ready after npm trusted-publisher setup and first published package verification.

## Package Metadata

- Current state: public npm package is configured as `@agent-skills/next-supabase-kit`.
- Public requirement: create or claim the npm `@agent-skills` scope, configure Trusted Publishing, publish, and verify public `npx` install/init/audit through `scripts/post-publish-verify.mjs`.
- Status: pending npm setup.

## Release Gate

- Current state: `npm run release:check` is the shared local, CI, and release proof command.
- Current state: older-install upgrade behavior is covered by a regression fixture that previews missing/conflicting assets, preserves customized docs, and audits the upgraded project with zero failures.
- Current state: post-publish verification is scripted through `npm run publish:verify`.
- Public requirement: typecheck, tests, build, install smoke, dependency audit, package dry run, JSON sanity, and public package scan must pass before publish.
- Status: ready.

## Decision

Proceed with public package setup once CI and release dry run pass. The only remaining public-release blocker is npm scope/package publication and post-publish install verification.
