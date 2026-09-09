---
name: ship
description: Use before release. Check env vars, migration order, smoke, and rollback. User-visible releases still need browser-qa evidence.
---

# Ship

## Use when

Preparing to deploy, promote, or roll back.

## Checks

- Production-critical env vars are named.
- Migration order and rollback are explicit.
- Smoke of the primary path passed.
- User-visible changes have desktop and mobile screenshot evidence from `browser-qa`.
- Secrets are not in the repo or client bundle.

## Done when

Go / no-go is explicit, with commands run and rollback named.
