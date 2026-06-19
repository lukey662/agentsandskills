# Loop Coding

Loop coding means the agent repeats **plan → act → check → fix** until a stop condition, instead of finishing in one chat turn. The Agent Kit is opinionated about **which loops are safe** and **which checkpoints must stay in place**.

This document describes loop types, kit-safe patterns, and limits. It is the canonical reference for eval-driven development with `@appsforgood/next-supabase-kit`.

## Loop Types

| Loop type | What it means | Kit-safe version |
| --- | --- | --- |
| **Agent loop** | Same agent iterates on feedback until done | Use scoped prompts (for example `.agent-kit/prompts/implement-feature.md`); review each turn; do not remove Security Reviewer or QA gates |
| **Eval-driven loop** | Code changes until **tests, audit, or evals pass** | `npm test` + `agent-kit audit` + CI — BaseRepo uses `npm run release:check` as the maintainer merge gate |
| **Self-improving loop** | Agent critiques its own output and revises | Manual: delegate to `@qa-engineer` or run tests between passes; **avoid fully unsupervised self-critique on auth, RLS, or release tooling** |
| **Council / team loop** | Planner → specialist → Security → QA handoffs | `agent-kit session handoff` + IDE subagents — the kit's core operating model |
| **Background / overnight loop** | Runs without a human present | **Defer by default** — requires worktree policy, cost caps, kill switches, and stronger eval gates than agent freedom |

## Practical Rule

Climb maturity by adding **checkpoints** (tests, audit, guards, human review), not by removing them. Unsupervised loops are only healthy when **eval gates are stronger than the agent's freedom**.

## Eval-Driven PR Loop (recommended)

For feature work in a kit-consuming project:

1. **Plan** — Planner classifies scope; Lead Architect maps affected layers when the change is core.
2. **Implement** — Next.js / Supabase engineers (or general agent with council rules loaded).
3. **Check** — run the smallest reliable gate set:
   ```bash
   npm test
   agent-kit audit --min-readiness baseline-setup
   agent-kit adapter validate all   # when IDE surfaces change
   ```
4. **Fix** — repeat implement/check until green or blocked on a documented gap.
5. **Record** — `agent-kit session render` and mirror summary in `COUNCIL.md` for meaningful multi-agent work.

BaseRepo maintainers use the same pattern at repo scale:

```bash
npm run release:check    # tests, build, package validate, smokes, adapter validate
npm run smoke:audit-gate
```

## Council Loop (multi-agent)

The default handoff order lives in `AGENTS.md` and `.agent-kit/agent-roster.json`:

1. Planner — scope, workflow, council selection
2. Lead Architect — core changes
3. Domain engineers — data, UI, copy as needed
4. Security Reviewer — auth, mutations, secrets, dependencies, release risk
5. QA Engineer — behavior evidence
6. Documentation Maintainer — living docs and council record

Use Agent Studio when the CLI is available:

```bash
agent-kit session start --workflow core-change --request "Short title"
agent-kit session handoff --from planner --to lead-architect --decision "..." --risk "..." --next "..." --evidence "..."
agent-kit session verify --command "npm test" --result pass
agent-kit session output phased-checklist --status complete --evidence "..."
agent-kit session render
```

When CLI tooling is unavailable, append the session template in `COUNCIL.md` (see `MAINTAINER_RELEASE.md` for kit release evidence).

## Hooks And Local Automation (Level 6 enablers)

The kit does **not** ship unsupervised orchestration. It documents safe local enablers:

| Pattern | Purpose | Starting point |
| --- | --- | --- |
| Pre-commit test or audit | Catch drift before commit | `.agent-kit/prompts/audit-project-setup.md`, project `npm test` |
| Post-edit lint/typecheck | Fast feedback on save | Project ESLint / `tsc --noEmit` in editor or CI |
| PR CI audit gate | Block merge below readiness | `.github/workflows/agent-kit-audit.yml` template |
| Adapter validate on PR | Prove IDE templates stay shippable | `agent-kit adapter validate all` (BaseRepo: `npm run adapter:validate` in `release:check`) |

For Cursor-specific hook/automation patterns, see Cursor Automations docs and keep Planner-first triage **opt-in** — never as a replacement for Security Reviewer or human release approval.

## MCP Routing (delegation hint)

Match MCP servers to council roles in consuming projects:

| Role | Typical MCP use |
| --- | --- |
| Supabase/Postgres Engineer | Schema, migrations, RLS, logs, advisors |
| Security Reviewer | Dependency/advisory checks; no broad production writes without review |
| Deployment/Observability Engineer | Hosting logs, release status, error tracking |
| QA Engineer | Test runners, visual diff tools where configured |

Record active MCP surfaces in `ASSISTANT_ADAPTERS.md` when they affect council behavior.

## What Not To Default

- Overnight unsupervised agent runs on auth, RLS, or release tooling
- Agents managing agents without eval harness and kill switches
- Removing human review from publish, migration, or security-sensitive paths
- Duplicating runtime product agents inside the kit repo (wrong shape for agent-kit)

## Related Docs

- `AGENTS.md` — council roles and default handoffs
- `QUALITY_GATES.md` — Baseline / Strong / Mature evidence tiers
- `COUNCIL.md` — session evidence template
- `MAINTAINER_RELEASE.md` — kit maintainer release session checklist
- `research/summaries/agentic-engineering-maturity-levels.md` — L3–L8 ladder and office integration
- `TESTING.md` — project test and CI gate expectations
- `PUBLISH.md` — npm publish runbook
