---
name: docs
description: Optional. Use when updating USER_GUIDE, CHANGELOG, or the living file this change actually moved. Reject restoring the 17-doc OS. Not on default init.
---

# Docs (optional)

This skill is **the file that moved**. Do not restore the old 17-doc operating system. It is not installed by `init`.

Add with `agent-kit add skill docs`. Pair with `agent-kit add agent docs` if you want the specialist.

## Use when

`USER_GUIDE`, `CHANGELOG`, or the living markdown this change actually moved. Significant pack or product changes that would leave those files lying.

## Do

1. Name the change. Name the files that actually moved.
2. Update `USER_GUIDE.md` (and `USER_GUIDE.html` if the field-guide copy moved).
3. Update `CHANGELOG.md` or add a changeset that will.
4. Update only the living file this change moved (`DECISIONS.md`, `SPEC.md`, `DOCS.md`, `ROADMAP.md`, `STYLE_GUIDE.md`, `UPGRADE.md`, `SECURITY.md` as applicable). Do not invent a second set.
5. Do not invent product claims. Do not paste this kit’s charcoal desk onto a product `DESIGN.md`.

## Checks

| Area | Pass |
| --- | --- |
| Scope | Only USER_GUIDE, CHANGELOG, and files this change moved. |
| Claims | No invented proof, audience, or “best practice” without evidence. |
| Init | Default `init` still does not write the 17-doc OS. |

## Reject

- Restoring `QUALITY_GATES.md`, `COUNCIL.md`, session/Studio templates, or the 17-doc OS as default `init` output.
- Adding docs “for completeness” that this change did not move.
- Treating leftover 0.3 docs as required again because `doctor` listed them.
- Inventing product claims.

## Done when

`USER_GUIDE`, `CHANGELOG`, and the living file that moved are current. The 17-doc OS was not restored.
