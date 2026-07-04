# Agent Kit

`@appsforgood/next-supabase-kit` installs an agent operating system into Next.js + Supabase projects: a default agent council, reusable skills, quality gates, model routing, living documentation templates, and a CI-gateable audit.

[Package on npm](https://www.npmjs.com/package/@appsforgood/next-supabase-kit) · [Source on GitHub](https://github.com/lukey662/agentsandskills)

**Latest release:** v0.1.6

## Quick Start

```bash
npx @appsforgood/next-supabase-kit@0.1.6 init --stack next-supabase --setup --open
npx @appsforgood/next-supabase-kit audit
npx @appsforgood/next-supabase-kit audit --min-readiness baseline-setup
```

The installer never silently overwrites your docs: files that differ from the templates are preserved, and the new template is written to `.agent-kit/conflicts/` for review.

Every command accepts `--json`. Mutating commands (`init`, `update`, `add skill`, `correction apply`) also accept `--dry-run`.

## CLI Reference

### Install and upgrade

| Command | Purpose |
| --- | --- |
| `init` | Install docs, roster, skills, schemas, Cursor rules, project context (`--guided`, `--dry-run`, `--activate`, `--setup`, `--json`) |
| `diff` | Compare local docs against bundled templates |
| `update` | Hash-aware upgrade with conflict review (`--dry-run`, `--force`) |
| `add skill <name>` | Copy one skill into `.agent-kit/skills/` |
| `onboard` | Print the recommended first-run checklist |

### Setup and Agent Office

| Command | Purpose |
| --- | --- |
| `setup` | Local Agent Office + wizard at `http://127.0.0.1:9321` (`--open`, `--status`, `--port`) |
| Routes | `/` or `/office` (default), `/wizard` (form fallback) |

### Audit and validation

| Command | Purpose |
| --- | --- |
| `audit` | Readiness report (`--json`, `--min-readiness`) |
| `doctor` | CLI runtime check |
| `adapter validate [target]` | IDE/runtime adapter validation |
| `package validate` | Source-repo release validation (maintainers) |

### Agent Studio

| Command | Purpose |
| --- | --- |
| `context` | `init`, `scan`, `ask`, `render`, `validate`, `show` |
| `session` | `start`, `list`, `note`, `decision`, `handoff`, `correct`, `artifact`, `verify`, `output`, `checkpoint`, `render`, `close` |
| `correction` | `list`, `add`, `apply`, `retire`, `propose-upstream` |
| `studio export` | Static HTML export |
| `studio serve` | Live localhost office with SSE (`--open`) |

### Research (maintainers)

`research discover`, `scan`, `summarize`, `propose-updates` (requires `GITHUB_TOKEN`).

## Readiness Levels

- `needs-setup`: required install or council contracts are failing.
- `baseline-setup`: setup is valid, but starter evidence placeholders remain.
- `needs-improvement`: no failures, but warnings remain.
- `best-practice-candidate`: static audit found no failures or warnings.

## Learn More

- [Full README and examples](https://github.com/lukey662/agentsandskills/blob/main/README.md#cli-reference)
- [Developer documentation](https://github.com/lukey662/agentsandskills/blob/main/DOCS.md)
- [Technical specification](https://github.com/lukey662/agentsandskills/blob/main/SPEC.md)
- [Quality gates and maturity model](https://github.com/lukey662/agentsandskills/blob/main/QUALITY_GATES.md)
- [Upgrade guide](https://github.com/lukey662/agentsandskills/blob/main/UPGRADE.md)
- [Security policy](https://github.com/lukey662/agentsandskills/blob/main/SECURITY.md)
