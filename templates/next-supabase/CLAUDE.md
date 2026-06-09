# Claude Code Project Instructions

This repository uses Agent Kit. Treat the following as the source of truth for council routing, project context, correction rules, model profiles, quality gates, and handoff evidence:

- `AGENTS.md`
- `AGENT_ROSTER.md`
- `.agent-kit/agent-roster.json`
- `MODEL_ROUTING.md`
- `.agent-kit/model-routing.json`
- `.agent-kit/project-context.json`
- `.agent-kit/project-context.md`
- `.agent-kit/agent-briefs.md` when present
- `.agent-kit/corrections/project-rules.json`
- `.agent-kit/corrections/agent-rules.json`
- `COUNCIL.md`
- `.agent-kit/council-sessions/`
- `QUALITY_GATES.md`

## Subagents

Project subagents live in `.claude/agents/*.md` and are generated from `.agent-kit/agent-roster.json` when you run:

```sh
agent-kit init --activate claude
```

Use the matching subagent for the active workflow instead of treating every request as a generic implementation pass.

## Validation

```sh
agent-kit audit --min-readiness baseline-setup
```

Use `agent-kit session checkpoint --file <json>` to batch-record council evidence instead of many individual session commands.

## Model Selection

Use Claude Code model settings with the profiles in `MODEL_ROUTING.md`. Exact model names are dated recommendations — review when provider docs change.
