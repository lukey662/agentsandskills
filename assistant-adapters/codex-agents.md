# Codex / AGENTS.md Adapter

Use `AGENTS.md` as the primary project instruction surface.

## Required References

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

## Operating Rule

When a task is planning-oriented, ambiguous, risky, frontend-facing, security-sensitive, or release-related, start from the roster workflow instead of treating the request as a single generic implementation pass.

Use `MODEL_ROUTING.md` to choose the model profile or reasoning effort for the active role. Exact model names belong in dated config comments, not in the role definitions.

Before meaningful work, load project context, agent briefs when present, and active correction rules. For meaningful handoffs, record visible decisions and evidence with `agent-kit session checkpoint --file <json>` or individual `agent-kit session ...` commands, then run `agent-kit session render`.

## Verification

Record in `ASSISTANT_ADAPTERS.md`:

- The tool/version or environment where `AGENTS.md` was observed.
- The command, session, or screenshot that proves the instructions loaded.
- The model-selection setting or profile used for the active role.
- Any known limitations or manual invocation steps.
