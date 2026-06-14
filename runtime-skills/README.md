# Runtime Skills

These portable `SKILL.md` wrappers are for runtimes that discover skills by directory.

Canonical skill content remains in `skills/*.md` and installed project copies under `.agent-kit/skills/*.md`. Runtime wrappers must point back to the canonical skill file instead of forking the workflow.

When a canonical skill changes, update the matching wrapper description only if the trigger behavior changes.
