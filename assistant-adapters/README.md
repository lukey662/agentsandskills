# Assistant Adapters

These files help downstream projects activate the same agent council across common AI coding tools without forking the operating model.

## Source Of Truth

- `AGENTS.md` defines the default agent behavior.
- `AGENT_ROSTER.md` explains human-readable routing.
- `.agent-kit/agent-roster.json` is the machine-readable council contract.
- `MODEL_ROUTING.md` and `.agent-kit/model-routing.json` define model-selection profiles.
- `COUNCIL.md` and `.agent-kit/schemas/council-session.schema.json` define handoff evidence.

Adapters should point back to those files. Do not maintain separate policy, security, frontend, or release rules inside a vendor-specific file unless the rule is truly vendor-specific.

## Included Templates

- `codex-agents.md`: guidance for tools that consume `AGENTS.md`.
- `github-copilot-instructions.md`: starter repository-wide Copilot instructions.
- `github-next-supabase.instructions.md`: path-aware Copilot/VS Code instructions for Next.js and Supabase files.
- `cursor-agent-kit.mdc`: Cursor project-rule template.
- `claude-code-subagents.md`: Claude Code project subagent template guidance.
- `model-selection/`: dated setup examples for Codex, Claude Code, Cursor, and GitHub Copilot model routing.

## Activation Rule

Record active tool surfaces in `ASSISTANT_ADAPTERS.md`. A project is not best-practice ready simply because adapter templates exist; the team must document which tools are active, how model selection is handled, whether enforcement is enforced/partial/advisory/manual, and what evidence proves the canonical council instructions loaded.
