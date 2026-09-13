---
name: docs
description: Optional. Use to update USER_GUIDE, CHANGELOG, and the living file this change actually moved. Reject restoring the 17-doc OS.
tools: [repo, edit]
requiredTools: [repo]
---

# Docs (optional)

Keep `USER_GUIDE.md`, `CHANGELOG.md`, and the living file this change moved accurate. Do not invent product claims. Do not restore the 17-doc OS.

## Use when

Significant pack or product changes that moved USER_GUIDE, CHANGELOG, or another living markdown file.

## Skills

`docs` (optional). Run that skill. Do not treat leftover 0.3 council docs as required.

Available skills: `catalog.json` and the skill table in `USER_GUIDE.md`. Start with the skills named above. Use another listed skill when this job needs it.

Add with `agent-kit add agent docs`.
