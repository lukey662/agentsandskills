# Assistant Adapters

Use this file to record how the agent council is activated in the AI coding tools used by this project.

Canonical source of truth:

- `AGENTS.md`
- `AGENT_ROSTER.md`
- `.agent-kit/agent-roster.json`
- `MODEL_ROUTING.md`
- `.agent-kit/model-routing.json`
- `.agent-kit/orchestrator.json`
- `.agent-kit/project-context.json`
- `.agent-kit/project-context.md`
- `.agent-kit/corrections/project-rules.json`
- `.agent-kit/corrections/agent-rules.json`
- `COUNCIL.md`
- `.agent-kit/council-sessions/`
- `.agent-kit/schemas/council-session.schema.json`
- `.agent-kit/schemas/studio-session.schema.json`
- `.agent-kit/schemas/session-event.schema.json`
- `.agent-kit/schemas/project-context.schema.json`
- `.agent-kit/schemas/correction-rules.schema.json`
- `.agent-kit/schemas/orchestrator.schema.json`
- `.agent-kit/schemas/runtime-run.schema.json`
- `.agent-kit/schemas/runtime-event.schema.json`
- `QUALITY_GATES.md`

## Active Tool Surfaces

| Tool | Instruction surface | Instruction status | Model-selection status | Enforcement | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Codex / AGENTS.md-compatible tools | `AGENTS.md`, optional `.codex/config.toml`, optional `.codex/agents/*.toml` | Not active | Not applicable | Partial | Not used on this repo as of 2026-07-02 (owner: lukey662). | Root `AGENTS.md` exists and is loadable if a Codex-compatible tool is adopted later. Re-verify council routing and `MODEL_ROUTING.md` usage at that time. |
| GitHub Copilot / VS Code | `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md` | Not active | Not applicable | Advisory | Not used on this repo as of 2026-07-02 (owner: lukey662). | Use `.agent-kit/assistant-adapters/github-copilot-instructions.md`, `github-next-supabase.instructions.md`, and `model-selection/github-copilot-model-selection.md` as starting points if Copilot is adopted. |
| Cursor | `.cursor/rules/cursor-agent-kit.mdc` and `.cursor/rules/cursor-model-selection.mdc` | Active, verified 2026-07-02 | Advisory (user model picker) | Advisory | Verified 2026-07-02 (owner: lukey662): both rules load as always-apply workspace rules in Cursor; `agent-kit init` on this repo confirmed root docs and `.agent-kit/` referenced by the rules now exist. Session evidence: `.agent-kit/council-sessions/2026-07-02-world-class-repo-hardening/`. | This repo dogfoods its own kit. Re-run `agent-kit diff` after kit updates if the canonical adapter files changed. |
| Claude Code | `.claude/agents/*.md` and optional `CLAUDE.md` | Not active | Not applicable | Partial | Not used on this repo as of 2026-07-02 (owner: lukey662). | Use `.agent-kit/assistant-adapters/claude-code-subagents.md` and `model-selection/claude-code-subagents-with-models.md` as starting points if Claude Code is adopted. |
| Antigravity | `.antigravity/agent-kit/plugin.json` and `commands/*.toml` | Available via `init --activate antigravity` | Not applicable | Partial | Validated with `agent-kit adapter validate antigravity`. | Native slash commands: `/setup`, `/spec`, `/plan`, `/handoff`, `/frontend`, UI harness commands, `/audit`, `/test`, `/review`, `/security`, `/copy`, `/ship`, `/upgrade`. Canonical workflow steps: `.agent-kit/prompts/lifecycle-command-index.md`. |
| Agent Kit Runtime | `.agent-kit/orchestrator.json`, `@appsforgood/agent-kit-runtime`, `agent-kit orchestrate ...` | Available; disabled by default | Enforced aliases and capability gates | Enforced local graph and approval policy | Verified 2026-07-11 with SQLite interrupt/resume, provider, sandbox, worktree, CLI, and Studio tests. | This is the executable council. IDE adapters above remain instruction surfaces. |

## Model Selection

- Use `.agent-kit/model-routing.json` as the provider-neutral routing contract.
- Use `MODEL_ROUTING.md` for dated setup comments and evidence requirements.
- Treat exact model names as June 2026 recommendations that must be reviewed when IDE or provider docs change.
- Do not claim per-agent model enforcement in tools where model selection is controlled by a user picker, organization policy, or hosted agent setting.

## Adapter Rules

- Keep `AGENTS.md`, `AGENT_ROSTER.md`, and `.agent-kit/agent-roster.json` as the source of truth.
- Adapter files should reference the council contract; they should not fork role definitions, security policy, frontend quality rules, or release gates.
- Agents should read project context and active correction rules before meaningful work.
- Agents should record meaningful decisions, handoffs, human corrections, artifacts, required-output status, and verification with `agent-kit session ...` commands when the CLI is available.
- Agents should run `agent-kit session render` after changing session evidence so Markdown views stay current.
- Agents may run `agent-kit studio export` after rendering sessions when a local visual review page would help the user inspect collaboration.
- Do not place secrets, tokens, credentials, private URLs, or customer data in assistant instruction files.
- Keep commands concrete and verified. Document known failures or environment prerequisites.
- Update this file when a tool is added, removed, or confirmed to load the project instructions.
- Record MCP/tool connector setup separately from model-selection setup. Tool access and model choice are different controls.
- Do not claim an orchestrated run from IDE delegation alone. Require runtime status, events, checkpoint, and scoped commit evidence.

## Executable Runtime

Install `@appsforgood/agent-kit-runtime`, configure credential references and deterministic aliases in `.agent-kit/orchestrator.json`, then run:

```bash
agent-kit orchestrate validate
agent-kit orchestrate plan "Describe the goal"
agent-kit orchestrate run "Describe the goal"
agent-kit orchestrate approve <run-id>
agent-kit orchestrate status <run-id>
```

Runs use explicit roster sequences, SQLite checkpoints, risk-tiered approvals, redacted JSONL evidence, an isolated Git worktree, Docker-first mutations, and an optional approved Cursor host executor. The runtime may create one scoped commit; it never merges, pushes, or opens a pull request. See `.agent-kit/assistant-adapters/orchestrator-runtime.md`.

## Cursor Activation

`agent-kit init` installs the canonical Cursor rules automatically:

- `.cursor/rules/cursor-agent-kit.mdc`
- `.cursor/rules/cursor-model-selection.mdc`

Verification steps:

1. Run `agent-kit init --stack next-supabase` in the target project.
2. Confirm both files exist under `.cursor/rules/`.
3. Open Cursor Settings > Rules and verify the rules are active for the workspace.
4. Start a meaningful task and confirm the agent reads `AGENTS.md`, `.agent-kit/agent-roster.json`, and project context before implementation.
5. Record the verification date, owner, and evidence path in the Active Tool Surfaces table above.

If a project already customized `.cursor/rules/`, review `.agent-kit/conflicts/` after `agent-kit update` before adopting newer adapter wording.

## Acceptance Evidence

Before claiming strong or best-practice maturity, every row above must record:

- The active tool and instruction-surface path.
- The active model profile or model-selection policy.
- The enforcement level: enforced, partial, advisory, or manual.
- The command, screenshot, PR, or session evidence proving the instructions loaded.
- Any manual invocation needed to select the correct agent, rule, or subagent.
- The Agent Studio session path, rendered Markdown, or audit output proving the agent read context and recorded handoff evidence.
- Optional `.agent-kit/studio/index.html` evidence when a static local Studio export was used.
- The date and owner of the verification.
