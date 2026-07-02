---
"@appsforgood/next-supabase-kit": minor
---

Repo hardening release: real `update` command with hash-aware merge (`created`/`updated`/`unchanged`/`kept-local`/`conflict`/`overwritten`) and `--dry-run`, human-readable CLI output with `--json` on every command, ESLint + Prettier + coverage gates wired into `release:check`, cross-platform CI matrix (ubuntu/windows/macos on Node 20/22/24), changesets-based versioning, packaging cleanup (`.npmignore` removed in favor of the `files` allow-list), and the repo now dogfoods its own kit at the root with best-practice-candidate audit readiness.
