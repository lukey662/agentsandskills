# Assistant Adapters

Use this file to record how the agent council is activated in the AI coding tools used by this project.

Canonical source of truth:

- `AGENTS.md`
- `AGENT_ROSTER.md`
- `.agent-kit/agent-roster.json`
- `MODEL_ROUTING.md`
- `.agent-kit/model-routing.json`
- `COUNCIL.md`
- `.agent-kit/schemas/council-session.schema.json`
- `QUALITY_GATES.md`

## Active Tool Surfaces

| Tool | Instruction surface | Instruction status | Model-selection status | Enforcement | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Codex / AGENTS.md-compatible tools | `AGENTS.md`, optional `.codex/config.toml`, optional `.codex/agents/*.toml` | TBD | TBD | Partial | TBD | Confirm the tool loads root `AGENTS.md`, follows council routing, and uses `MODEL_ROUTING.md` for model choice. |
| GitHub Copilot / VS Code | `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md` | TBD | TBD | Advisory | TBD | Use `.agent-kit/assistant-adapters/github-copilot-instructions.md`, `github-next-supabase.instructions.md`, and `model-selection/github-copilot-model-selection.md` as starting points. |
| Cursor | `.cursor/rules/*.mdc` | TBD | TBD | Advisory | TBD | Use `.agent-kit/assistant-adapters/cursor-agent-kit.mdc` and `model-selection/cursor-model-selection.mdc` as starting points. |
| Claude Code | `.claude/agents/*.md` and optional `CLAUDE.md` | TBD | TBD | Partial | TBD | Use `.agent-kit/assistant-adapters/claude-code-subagents.md` and `model-selection/claude-code-subagents-with-models.md` as starting points. |

## Model Selection

- Use `.agent-kit/model-routing.json` as the provider-neutral routing contract.
- Use `MODEL_ROUTING.md` for dated setup comments and evidence requirements.
- Treat exact model names as June 2026 recommendations that must be reviewed when IDE or provider docs change.
- Do not claim per-agent model enforcement in tools where model selection is controlled by a user picker, organization policy, or hosted agent setting.

## Adapter Rules

- Keep `AGENTS.md`, `AGENT_ROSTER.md`, and `.agent-kit/agent-roster.json` as the source of truth.
- Adapter files should reference the council contract; they should not fork role definitions, security policy, frontend quality rules, or release gates.
- Do not place secrets, tokens, credentials, private URLs, or customer data in assistant instruction files.
- Keep commands concrete and verified. Document known failures or environment prerequisites.
- Update this file when a tool is added, removed, or confirmed to load the project instructions.
- Record MCP/tool connector setup separately from model-selection setup. Tool access and model choice are different controls.

## Acceptance Evidence

Before claiming strong or best-practice maturity, replace the TBD rows above with:

- The active tool and instruction-surface path.
- The active model profile or model-selection policy.
- The enforcement level: enforced, partial, advisory, or manual.
- The command, screenshot, PR, or session evidence proving the instructions loaded.
- Any manual invocation needed to select the correct agent, rule, or subagent.
- The date and owner of the verification.
