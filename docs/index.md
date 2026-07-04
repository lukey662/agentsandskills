# Agent Kit

`@appsforgood/next-supabase-kit` installs an agent operating system into Next.js + Supabase projects: a default agent council, reusable skills, quality gates, model routing, living documentation templates, and a CI-gateable audit.

[Package on npm](https://www.npmjs.com/package/@appsforgood/next-supabase-kit) · [Source on GitHub](https://github.com/lukey662/agentsandskills)

**Latest release:** v0.1.7

## Quick Start

```bash
npx @appsforgood/next-supabase-kit@0.1.7 init --stack next-supabase --setup --open
npx @appsforgood/next-supabase-kit audit
npx @appsforgood/next-supabase-kit audit --min-readiness baseline-setup
```

Promote native slash commands in Antigravity:

```bash
npx @appsforgood/next-supabase-kit init --activate antigravity
```

The installer never silently overwrites your docs: files that differ from the templates are preserved, and the new template is written to `.agent-kit/conflicts/` for review.

Every command accepts `--json`. Mutating commands (`init`, `update`, `add skill`, `correction apply`) also accept `--dry-run`.

## Workflow Commands

Twenty slash commands map to the delivery lifecycle. Canonical steps: `.agent-kit/prompts/lifecycle-command-index.md` (delivery) and `.agent-kit/prompts/ui-command-index.md` (UI).

```text
SETUP → SPEC/PLAN → BUILD → VERIFY → REVIEW → SHIP
```

| What you're doing | Command | Key principle |
| --- | --- | --- |
| Onboard project context | `/setup` | Context before code |
| Define what to build | `/spec` | Spec before code |
| Plan how to build it | `/plan` | Council before implementation |
| Route between agents | `/handoff` | Explicit handoffs |
| Build frontend/UI | `/frontend` | Content-first design |
| Check kit readiness | `/audit` | Evidence before claims |
| Prove behavior | `/test` | Tests are proof |
| Review before merge | `/review` | Improve code health |
| Security signoff | `/security` | RLS at the boundary |
| Public copy | `/copy` | Proof before publish |
| Ship release | `/ship` | Faster is safer |
| Upgrade kit/deps | `/upgrade` | Diff before overwrite |

UI harness: `/ui-audit`, `/ui-polish`, `/layout-cleanup`, `/responsive-cleanup`, `/accessibility-pass`, `/distinctiveness-pass`, `/screenshot-critique`, `/browser-qa`.

Skills activate from roster `defaultFor` tags—for example, schema/RLS work routes to Supabase skills; App Router work routes to Next.js skills. See [SKILLS.md](https://github.com/lukey662/agentsandskills/blob/main/SKILLS.md) and [full README workflow section](https://github.com/lukey662/agentsandskills/blob/main/README.md#workflow-commands).

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

- [Full README and examples](https://github.com/lukey662/agentsandskills/blob/main/README.md#workflow-commands)
- [Lifecycle command index](https://github.com/lukey662/agentsandskills/blob/main/prompts/lifecycle-command-index.md)
- [Developer documentation](https://github.com/lukey662/agentsandskills/blob/main/DOCS.md)
- [Technical specification](https://github.com/lukey662/agentsandskills/blob/main/SPEC.md)
- [Quality gates and maturity model](https://github.com/lukey662/agentsandskills/blob/main/QUALITY_GATES.md)
- [Upgrade guide](https://github.com/lukey662/agentsandskills/blob/main/UPGRADE.md)
- [Security policy](https://github.com/lukey662/agentsandskills/blob/main/SECURITY.md)
