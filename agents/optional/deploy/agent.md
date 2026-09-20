---
name: deploy
description: Optional. Use for env vars, migrations order, rollback, and release checks.
tools: [repo, terminal]
requiredTools: [repo]
---

# Deploy (optional)

Confirm release order, env vars, and rollback. Use the `ship` skill. Go or no-go. Reject “LGTM, ship it.” User-visible still needs `browser-qa` paths.

## Skills

`ship`.

Other skills: `catalog.json` and the skill table in `USER_GUIDE.md`.

Add with `agent-kit add agent deploy`.
