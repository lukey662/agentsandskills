# Agent Kit Runtime

Optional local execution runtime for `@appsforgood/next-supabase-kit`. It compiles validated council workflows into bounded LangGraph runs, persists SQLite checkpoints, brokers provider and MCP tools through explicit policy, and confines mutation-capable work to isolated Git worktrees.

## Install

```bash
npm install --save-dev @appsforgood/next-supabase-kit @appsforgood/agent-kit-runtime
agent-kit orchestrate validate
```

The baseline kit works without this package. Fresh installs include a disabled `.agent-kit/orchestrator.json`; enabling it requires at least one valid provider, model alias, and default alias.

## Configure

Provider credentials are references, never values:

```json
{
  "schemaVersion": 1,
  "enabled": true,
  "defaultWorkflow": "planning",
  "defaultAlias": "balanced",
  "providers": {
    "primary": {
      "kind": "openai",
      "credentialRef": "env:OPENAI_API_KEY"
    },
    "fallback": {
      "kind": "anthropic",
      "credentialRef": "keychain:team-anthropic"
    }
  },
  "modelAliases": {
    "balanced": {
      "requiredCapabilities": ["text", "tools"],
      "maxAttempts": 2,
      "candidates": [
        { "provider": "primary", "model": "replace-with-verified-provider-model-id" },
        { "provider": "fallback", "model": "replace-with-verified-provider-model-id" }
      ]
    }
  }
}
```

Use model IDs verified for the project’s current provider account. The runtime does not invent, upgrade, or silently substitute model names. Candidates are attempted in order; capability mismatches are skipped and provider failures are recorded.

Supported provider kinds: `openai`, `anthropic`, `gemini`, `xai`, `deepseek`, `kimi`, `glm`, `openrouter`, `ollama`, `lm-studio`, `vllm`, and `openai-compatible`.

Credential commands accept keychain references only. Values come from a masked prompt or stdin, never a CLI flag:

```bash
agent-kit credential set keychain:team-openai
agent-kit credential delete keychain:team-openai
```

## Run

```bash
agent-kit orchestrate plan "Implement the approved change" --workflow core-change
agent-kit orchestrate run "Implement the approved change" --workflow core-change
agent-kit orchestrate approve <run-id>
agent-kit orchestrate resume <run-id> --decision approve
agent-kit orchestrate status <run-id>
agent-kit orchestrate export <run-id> --output .agent-kit/runtime-export.md
```

The runtime pauses at applicable plan, network, worktree-write, host-execution, and final-commit gates. Approval IDs are deterministic per run gate and survive process restarts through SQLite checkpoints.

If the source checkout is dirty, `run` fails unless `--acknowledge-dirty-base` is supplied. Dirty changes are never copied into the worktree.

## Isolation

- Mutation commands run in Docker by default.
- The configured image tag must already exist locally and is resolved to an immutable image ID before execution.
- Containers use a read-only root, dropped Linux capabilities, `no-new-privileges`, PID/CPU/memory limits, bounded output/time, and no network by default.
- File tools reject absolute paths, traversal, symlink escapes, Git internals, environment files, private keys, package-manager credentials, and runtime evidence paths.
- Tracked sensitive filenames block worktree creation.
- One approved scoped commit may be created on branch `agent-kit/<run-id>`.
- The runtime never merges, pushes, opens a pull request, deploys, or applies a migration automatically.

SQLite uses the `better-sqlite3` native addon. This repository pins install-script approval to the reviewed addon and build-tool versions; downstream supply-chain policy must permit the matching reviewed native installation.

## MCP

Remote Streamable HTTP servers require explicit host and tool allowlists. HTTPS is required except for literal loopback, redirects are rejected, and DNS results are checked for private or special-use addresses unless `allowPrivateNetwork` is explicitly enabled.

Stdio MCP servers are host processes. They are disabled unless `allowHostExecution` and global `sandbox.allowHostMutations` are both true; each run then pauses at the host-execution gate. Commands use argv spawning with a minimal inherited environment and credential references.

```bash
agent-kit mcp probe <server-name>
```

MCP annotations inform risk classification but do not grant authorization. Empty `allowedTools` means no tools are exposed.

## Cursor Executor

Provider-backed model agents are the default. To route a roster agent through Cursor CLI, set `agentExecutors.<agent-id>` to `cursor`, enable `cursor.enabled`, enable `sandbox.allowHostMutations`, and approve the run’s host gate. Cursor runs with argv spawning, no shell, minimal environment, bounded output/time, and the isolated worktree as its working directory.

## Studio And Evidence

`agent-kit studio serve` adds a Runs tab for starting runs, reading status/events, approving or rejecting gates, and cancelling local work.

- Checkpoints: `.agent-kit/runtime/runtime.sqlite`
- Run record: `.agent-kit/runtime/runs/<run-id>/run.json`
- Redacted event log: `.agent-kit/runtime/runs/<run-id>/events.jsonl`
- Worktree: platform cache under `agent-kit/worktrees/`

Runtime files are ignored by Git. Evidence redaction covers provider keys, bearer tokens, credential assignments, database URLs, private keys, and nested structured values. Do not treat redaction as permission to put customer data or secrets in prompts.

## Probes And Recovery

```bash
agent-kit provider probe [provider-id]
agent-kit mcp probe <server-name>
agent-kit orchestrate cancel <run-id>
```

Provider and MCP probes are explicit external operations. A rejected gate cancels the run. A failed run preserves its checkpoint, evidence, worktree, and branch for inspection. Remove or merge worktrees manually after reviewing the scoped commit; Agent Kit does not perform that final repository operation.
