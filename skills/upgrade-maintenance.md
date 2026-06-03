# Upgrade Maintenance Skill

## Use When

Upgrading Agent Kit, Next.js, Supabase, UI libraries, testing tools, release workflows, assistant adapters, or any shared package that can change project behavior.

## Goal

Make upgrades repeatable, reviewable, reversible, and evidence-backed.

## Required Checks

- Read `UPGRADE.md`, `CHANGELOG.md`, `ROADMAP.md`, and `DECISIONS.md` before changing versioned behavior.
- Run `agent-kit diff` before accepting template changes.
- Use `agent-kit update` only on a branch where conflicts can be reviewed.
- Preserve valid local overrides in `.agent-kit/overrides.json`.
- For Next.js upgrades, check official upgrade guidance and codemods.
- For Supabase upgrades, verify migration history, RLS impact, service-role exposure, generated types, and rollback risk.
- Run `agent-kit audit --min-readiness baseline-setup` after the upgrade.
- Use `agent-kit audit --min-readiness best-practice-candidate` only after project-specific evidence is complete.
- Record package versions, migration order, rollback notes, verification commands, owner, and date.

## Output

Return:

- Upgrade scope.
- Files and templates changed.
- Conflicts accepted, deferred, or rejected.
- Migration and rollback risk.
- Verification commands and results.
- Remaining warnings before best-practice readiness.
