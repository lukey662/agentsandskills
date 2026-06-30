# Assistant Adapters

Use this file to record how the agent council is activated in the AI coding tools used by this project.

Canonical source of truth:

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
- `.agent-kit/schemas/council-session.schema.json`
- `.agent-kit/schemas/studio-session.schema.json`
- `.agent-kit/schemas/session-event.schema.json`
- `.agent-kit/schemas/project-context.schema.json`
- `.agent-kit/schemas/correction-rules.schema.json`
- `QUALITY_GATES.md`

## Active Tool Surfaces

| Tool | Instruction surface | Instruction status | Model-selection status | Enforcement | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Codex / AGENTS.md-compatible tools | `AGENTS.md`, `.codex/config.toml`, `.codex/agents/*.toml` | TBD | TBD | Partial | TBD | Run `agent-kit init --activate codex` to generate council custom agents and copy `.codex/config.toml`. |
| GitHub Copilot / VS Code | `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md` | TBD | TBD | Advisory | TBD | Run `agent-kit init --activate copilot` to promote Copilot instruction files. |
| Cursor | `.cursor/rules/*.mdc`, `.cursor/agents/*.md`, `.cursor/skills/*/SKILL.md` | Active on init (rules); subagents on `--activate cursor` | Advisory | Partial | Run `agent-kit init --activate cursor`; verify subagents. | Delegate to `.cursor/agents/` instead of role-playing the council. |
| Claude Code | `.claude/agents/*.md` and optional `CLAUDE.md` | TBD | TBD | Partial | TBD | Run `agent-kit init --activate claude` to generate subagents from `.agent-kit/agent-roster.json` and install `CLAUDE.md`. |
| Antigravity | `.antigravity/agent-kit/plugin.json`, `.antigravity/agent-kit/commands/*.toml`, `.antigravity/runtime-skills/*/SKILL.md` | TBD | TBD | Advisory | TBD | Run `agent-kit init --activate antigravity`, then `agent-kit adapter validate antigravity`; optional native validation is `agy plugin validate` when available. |

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

Run `agent-kit init --activate cursor` to generate `.cursor/agents/*.md` and `.cursor/skills/*/SKILL.md` from the roster and kit skills.

## Multi-agent delegation

Same council playbook across IDEs — delegate to specialists instead of role-playing every role in one thread.

| Risk / work | Cursor | Codex | Claude Code |
| --- | --- | --- | --- |
| Auth / RLS / secrets | `@security-reviewer` or Task `security-review` | spawn `security-reviewer.toml` | `@security-reviewer` |
| Planning / scope | `@planner` | spawn `planner.toml` | `@planner` |
| Frontend UI | `@frontend-design-lead` | spawn `frontend-design-lead.toml` | `@frontend-design-lead` |
| QA / behavior changes | `@qa-engineer` or Task `bugbot` | spawn `qa-engineer.toml` | `@qa-engineer` |

Record evidence with `agent-kit session checkpoint --file <json>` when the CLI is available.

## Codex Activation

`agent-kit init --activate codex` installs:

- `.codex/config.toml`
- `.codex/agents/*.toml` council custom agents with `model_reasoning_effort` from `.agent-kit/model-routing.json`

Validate with `agent-kit adapter validate codex`.

## Antigravity Activation

`agent-kit init --activate antigravity` installs a native runtime adapter without changing the canonical Agent Kit operating model:

- `.antigravity/agent-kit/plugin.json`
- `.antigravity/agent-kit/commands/*.toml`
- `.antigravity/runtime-skills/*/SKILL.md`
- `.antigravity/agent-kit/README.md`

Validate the structural package with:

```bash
agent-kit adapter validate antigravity
```

If the local machine has the Antigravity CLI, teams may also run native plugin validation and record that evidence here. Runtime command files are adapters only; `AGENTS.md`, `.agent-kit/agent-roster.json`, `QUALITY_GATES.md`, `.agent-kit/prompts/ui-command-index.md`, `.agent-kit/checklists/ui-detectors.md`, and Agent Studio sessions remain canonical.

The frontend adapter surface includes `/frontend` plus focused UI improvement commands: `/ui-audit`, `/ui-polish`, `/layout-cleanup`, `/responsive-cleanup`, `/accessibility-pass`, `/distinctiveness-pass`, `/screenshot-critique`, and `/browser-qa`. These commands invoke existing Frontend Design Lead, QA, accessibility, screenshot, and documentation gates; they do not replace the council workflow.

## Acceptance Evidence

Before claiming strong or best-practice maturity, replace the TBD rows above with:

- The active tool and instruction-surface path.
- The active model profile or model-selection policy.
- The enforcement level: enforced, partial, advisory, or manual.
- The command, screenshot, PR, or session evidence proving the instructions loaded.
- Any manual invocation needed to select the correct agent, rule, or subagent.
- The Agent Studio session path, rendered Markdown, or audit output proving the agent read context and recorded handoff evidence.
- Optional `.agent-kit/studio/index.html` evidence when a static local Studio export was used.
- The date and owner of the verification.
