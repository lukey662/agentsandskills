# Upgrade Lifecycle Patterns

Generated from a focused follow-up pass on upgrade and migration practices in high-signal framework and tooling projects.

## Why This Pass Was Needed

The kit is intended to be reused like an installable package. Initial install, audit, and release gates are not enough unless existing projects can safely adopt future template, agent, schema, and workflow updates.

## Generalized Practices

- Keep a visible upgrade guide with preflight, diff, update, verification, and rollback steps.
- Separate initial installation from upgrade review.
- Provide dry-run or diff flows before changing project-owned files.
- Treat framework upgrades, codemods, schema migrations, and generated types as explicit review items.
- Require rollback notes and owner/date evidence before claiming an upgrade is complete.
- Keep local overrides documented so a package update does not silently erase project-specific decisions.

## Promoted Updates

- Added root `UPGRADE.md` for package maintainers.
- Added installed `templates/next-supabase/UPGRADE.md` for downstream projects.
- Added `skills/upgrade-maintenance.md`, `checklists/upgrade.md`, and `prompts/upgrade-review.md`.
- Added audit coverage for upgrade lifecycle evidence.
- Added tests so upgrade guidance cannot be removed from public package readiness.

Do not copy source, policy wording, or brand systems from reviewed repositories or documentation. Adopt only generalized practices with clear rationale.
