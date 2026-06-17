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

## Council Custom Agents

After `agent-kit init --activate codex`, council specialists live in `.codex/agents/*.toml`.

Spawn a dedicated custom agent instead of role-playing the whole council in one thread:

- **Planning / scope:** `.codex/agents/planner.toml`
- **Security / RLS / secrets:** `.codex/agents/security-reviewer.toml` (high reasoning effort)
- **Frontend UI:** `.codex/agents/frontend-design-lead.toml`
- **QA / tests:** `.codex/agents/qa-engineer.toml`

Each file sets `model_reasoning_effort` from `.agent-kit/model-routing.json`. Verify model names in your Codex environment against `MODEL_ROUTING.md`.

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

Run `agent-kit adapter validate codex` after activation.
