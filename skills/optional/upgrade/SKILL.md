---
name: upgrade
description: Optional. Use when updating this pack or framework versions, or when someone asks to re-init or init --force. Prefer agent-kit update on a branch. Not on default init.
---

# Upgrade (optional)

This skill is **update on a branch**. Version notes live in `UPGRADE.md`. It is not installed by `init`.

Add with `agent-kit add skill upgrade`.

## Use when

Pack or framework upgrades, `agent-kit update`, “should I re-init?”, `init --force`, or leftover 0.3 docs after `doctor`.

## Do

1. Work on a git branch.
2. Read `UPGRADE.md` for this package version (link only — do not invent a second upgrade guide).
3. Run `npx agent-kit update`. Pristine files refresh. Local edits win or land in `.agent-kit/conflicts/`.
4. Never delete user files. Leftover `QUALITY_GATES.md` / `COUNCIL.md` stay; `doctor` lists them.
5. Run `npx agent-kit doctor` after. Leftover warnings are not a prompt to delete.

## Checks

| Area | Pass |
| --- | --- |
| Command | `agent-kit update` on a branch, not re-init. |
| Local | Edits kept or in `.agent-kit/conflicts/`. |
| Deletes | No user files removed. |
| Guide | `UPGRADE.md` named for this version. |

## Reject

- `init --force` (or re-init) as the upgrade path.
- Deleting leftover 0.3 docs because `doctor` listed them.
- Treating this skill as part of default `init`.
- Overwriting local edits without a reviewed `--force` on a **named** file.

## Done when

`update` ran on a branch. Local edits were not silently overwritten. User files were not deleted. `UPGRADE.md` was the version-notes source.
