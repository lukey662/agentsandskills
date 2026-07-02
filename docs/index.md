# Agent Kit

`@appsforgood/next-supabase-kit` installs an agent operating system into Next.js + Supabase projects: a default agent council, reusable skills, quality gates, model routing, living documentation templates, and a CI-gateable audit.

[Package on npm](https://www.npmjs.com/package/@appsforgood/next-supabase-kit) · [Source on GitHub](https://github.com/lukey662/agentsandskills)

## Quick Start

```bash
npx @appsforgood/next-supabase-kit init --stack next-supabase
npx @appsforgood/next-supabase-kit audit
npx @appsforgood/next-supabase-kit audit --min-readiness baseline-setup
```

The installer never silently overwrites your docs: files that differ from the templates are preserved, and the new template is written to `.agent-kit/conflicts/` for review.

## Core Commands

| Command | Purpose |
| --- | --- |
| `init` | Install docs, roster, skills, schemas, and IDE rules (`--guided`, `--dry-run`, `--json`) |
| `audit` | Readiness report with pass/warn/fail findings and a CI gate via `--min-readiness` |
| `diff` | Compare local docs against the bundled templates |
| `update` | Hash-aware upgrade: pristine docs refresh, local edits are kept, conflicts go to review (`--dry-run`) |
| `session` / `correction` / `context` | Local-first Agent Studio evidence: sessions, corrections, project context |
| `studio export` | Self-contained static HTML view of local sessions |

## Readiness Levels

- `needs-setup`: required install or council contracts are failing.
- `baseline-setup`: setup is valid, but starter evidence placeholders remain.
- `needs-improvement`: no failures, but warnings remain.
- `best-practice-candidate`: static audit found no failures or warnings.

## Learn More

- [Developer documentation](https://github.com/lukey662/agentsandskills/blob/main/DOCS.md)
- [Technical specification](https://github.com/lukey662/agentsandskills/blob/main/SPEC.md)
- [Quality gates and maturity model](https://github.com/lukey662/agentsandskills/blob/main/QUALITY_GATES.md)
- [Upgrade guide](https://github.com/lukey662/agentsandskills/blob/main/UPGRADE.md)
- [Security policy](https://github.com/lukey662/agentsandskills/blob/main/SECURITY.md)
