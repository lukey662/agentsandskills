# Orchestrator Runtime Adapter

`@appsforgood/agent-kit-runtime` is the optional executable layer for the Agent Kit council. IDE rules, subagents, slash commands, and model-routing documents remain instruction adapters; they do not imply that a checkpointed graph ran.

## Activation

```bash
npm install --save-dev @appsforgood/agent-kit-runtime
agent-kit orchestrate validate
agent-kit orchestrate plan "Describe the goal"
```

Edit `.agent-kit/orchestrator.json`, add provider credential references such as `env:OPENAI_API_KEY` or `keychain:team-openai`, configure at least one deterministic model alias, and set `enabled` to `true` only after validation passes.

## Execution Contract

- Roster workflows compile to explicit, bounded LangGraph nodes.
- Runs pause at plan, network, worktree-write, host-execution, and final-commit gates when applicable.
- Mutations occur in an isolated Git worktree. Agent Kit may create one scoped commit after approval; it never merges, pushes, or opens a pull request.
- Docker is the default mutation command boundary. Network access is off unless configured and approved.
- Provider and remote MCP requests reject redirects, embedded credentials, non-allowlisted hosts, and private or special-use addresses unless private access is explicitly configured.
- Stdio MCP servers execute on the host only when both `allowHostExecution` and `sandbox.allowHostMutations` are enabled and the host gate is approved.
- Run checkpoints live in `.agent-kit/runtime/runtime.sqlite`; redacted run records and JSONL evidence live under `.agent-kit/runtime/runs/` and are ignored by Git.

## Cursor Executor

Set an agent route to `cursor` only when Cursor CLI execution is intentionally required. The runtime invokes argv directly inside the isolated worktree, with no shell, a bounded timeout, minimal inherited environment, and an explicit host-mutation approval. Provider-backed model agents remain the default.

## Verification

Record:

- `agent-kit orchestrate validate --json`
- the offline `orchestrate plan` output
- provider and MCP probe results, without credentials
- run ID, approval decisions, scoped commit, and exported evidence
- Docker image ID and any private-network or host-execution exception rationale

Use `agent-kit studio serve` to inspect and decide paused runs in the local Studio UI.
