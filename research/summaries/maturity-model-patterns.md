# Maturity Model Patterns

Generated from a focused follow-up pass after the 100-repo scan showed that popularity and broad research volume do not prove best-practice readiness.

## Why This Pass Was Needed

The initial scan identified repeated gaps in Supabase/Auth/RLS discoverability, AI-agent handoff maturity, accessibility evidence, and explicit security expectations. Follow-up review of public production, repository-health, supply-chain, and visual-testing guidance showed that mature projects make quality evidence durable across docs, automation, release, and review settings.

## Generalized Practices

- Use an explicit maturity model instead of treating any green build as best-practice readiness.
- Separate baseline setup, strong team/agent delivery, and best-practice release evidence.
- Require evidence for council routing, architecture decisions, security boundaries, Supabase/RLS, frontend quality, accessibility, testing, deployment, and repository health.
- Treat research findings as inputs only; promote them into installed assets, audit checks, tests, release gates, or documented decisions before counting them as kit behavior.
- Keep production-readiness expectations broad enough to cover framework behavior, data access, user experience, security, observability, and release integrity.
- Keep repository operations visible through issue/PR templates, CODEOWNERS, dependency update automation, code scanning, dependency review, provenance expectations, support, conduct, and governance.

## Promoted Updates

- Added `templates/next-supabase/QUALITY_GATES.md`.
- Added `QUALITY_GATES.md` to installed root docs and manifest hashing.
- Added audit coverage for baseline, strong, best-practice, evidence, and multi-area maturity expectations.
- Added tests that warn when the maturity model is hollowed out.
- Added audit warnings when starter placeholders remain in evidence docs, so clean installation is not confused with completed project evidence.
- Added a minimum-readiness CLI gate so downstream projects can enforce baseline or best-practice thresholds in CI.
- Added an audit-report JSON Schema so downstream CI, dashboards, and repo-health tools can validate audit output shape.
- Updated public docs and roadmap to make best-practice readiness evidence-based rather than research-volume-based.

Do not copy source, policy wording, or brand systems from reviewed repositories or documentation. Adopt only generalized practices with clear rationale.
