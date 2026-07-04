# Antigravity Adapter

This adapter packages Agent Kit as native Antigravity-style plugin assets while keeping the Agent Kit council contract canonical.

## Source Of Truth

- `AGENTS.md`
- `AGENT_ROSTER.md`
- `.agent-kit/agent-roster.json`
- `MODEL_ROUTING.md`
- `.agent-kit/model-routing.json`
- `.agent-kit/project-context.json`
- `.agent-kit/project-context.md`
- `.agent-kit/corrections/project-rules.json`
- `.agent-kit/corrections/agent-rules.json`
- `COUNCIL.md`
- `.agent-kit/council-sessions/`
- `QUALITY_GATES.md`

Runtime command files must wrap those files. Do not fork role definitions, security policy, frontend quality rules, release gates, or session evidence rules into command prompts.

## Activation

```bash
agent-kit init --activate antigravity
agent-kit adapter validate antigravity
```

This installs:

- `.antigravity/agent-kit/plugin.json`
- `.antigravity/agent-kit/commands/*.toml`
- `.antigravity/runtime-skills/*/SKILL.md`
- `.antigravity/agent-kit/README.md`

If the `agy` CLI is available, teams may additionally run its native plugin validation. Agent Kit only requires structural validation because many projects will not have Antigravity installed locally.

## Command Contract

Commands expose short runtime entrypoints:

- `/setup`
- `/spec`
- `/audit`
- `/plan`
- `/handoff`
- `/frontend`
- `/test`
- `/review`
- `/security`
- `/copy`
- `/ship`
- `/upgrade`

UI harness commands (`/ui-audit`, `/ui-polish`, `/layout-cleanup`, `/responsive-cleanup`, `/accessibility-pass`, `/distinctiveness-pass`, `/screenshot-critique`, `/browser-qa`) are documented in `.agent-kit/prompts/ui-command-index.md`.

Delivery lifecycle commands are documented in `.agent-kit/prompts/lifecycle-command-index.md`.

Each command must load project context and correction rules when present, select the appropriate roster workflow, record required outputs with `agent-kit session output`, and render sessions when evidence changes.

## Security

Do not place tokens, credentials, private URLs, database URLs, customer data, or hidden model reasoning in Antigravity plugin files, command files, or runtime skills.
