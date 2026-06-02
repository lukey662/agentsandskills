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
- Public requirement: detailed per-repo findings stay out of the public package unless separately reviewed.
- Status: ready.

## Package Metadata

- Current state: public npm package is configured as `@agent-skills/next-supabase-kit`.
- Public requirement: create or claim the npm `@agent-skills` scope, configure Trusted Publishing, publish, and verify public `npx` install.
- Status: pending npm setup.

## Decision

Proceed with public package setup once CI and release dry run pass. The only remaining public-release blocker is npm scope/package publication and post-publish install verification.
