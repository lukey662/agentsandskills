# Upgrade Review Prompt

Use this prompt before accepting a dependency, framework, Agent Kit, or template upgrade.

## Prompt

Review this upgrade against `UPGRADE.md`, `QUALITY_GATES.md`, `SECURITY.md`, `TESTING.md`, and `DEPLOYMENT.md`.

Return:

- What changed and why.
- Which release notes, migration guides, or codemods apply.
- Which local templates or overrides changed.
- Which Supabase migrations, RLS policies, generated types, or auth boundaries are affected.
- Which Next.js routing, rendering, caching, metadata, or middleware behavior is affected.
- Which tests, smoke checks, visual QA, and release checks prove the upgrade.
- Rollback plan.
- Remaining warnings before best-practice readiness.
