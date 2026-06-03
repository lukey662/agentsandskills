# Dogfood And Adoption Evidence Patterns

Generated from a focused follow-up review after current read-only dogfood audits showed that older installs fail the hardened setup standard.

## Why This Pass Was Needed

The kit already had broad 100-repo research, public release gates, and two earlier dogfood installs. Those dogfood notes were stale after later hardening added schema-backed council routing, assistant adapters, upgrade lifecycle, maturity gates, visual QA, and reference-led design critique.

A public best-practice repo needs adoption evidence that stays current as standards change. Dogfood should not only prove that an install once worked; it should also prove that the audit catches drift when the kit improves.

## Focused Sources Reviewed

- GitHub community profile guidance for public repositories: community health files such as README, license, conduct, and contributing files are treated as visible project-health signals.
- npm Trusted Publishing guidance: publish identity should avoid long-lived tokens, use workflow-bound OIDC, and produce provenance for public packages when conditions are met.
- npm provenance guidance: publish workflows should support provenance and public access, and consumers can verify registry signatures and attestations.
- Storybook testing guidance: stories can become reusable accessibility, interaction, visual, and end-to-end testing inputs.

## Repeated Patterns To Adopt

- Keep a public-safe dogfood summary separate from detailed local-path evidence.
- Treat stale dogfood as a signal, not a failure to hide.
- Record whether audits were read-only or changed downstream files.
- Capture pass/warn/fail counts and readiness level for each adoption pass.
- Promote repeated downstream gaps into installed assets, audit checks, tests, release gates, or decisions.
- Keep post-publish `npx` verification separate from local package smoke.

## Promoted Updates

- Add `DOGFOOD.md` as a public-safe package asset.
- Update detailed `dogfood/*` notes with current read-only audit results.
- Add public-readiness tests that require dogfood evidence while preventing local project paths from leaking into the package.

Do not publish local project paths, private project details, or screenshots without review. Public dogfood summaries should use project archetypes and generalized findings.
