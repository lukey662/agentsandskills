# Runtime Orchestration Scope

Status: implemented as the optional `@appsforgood/agent-kit-runtime` workspace package. Baseline installs remain file-first and work without providers, credentials, Docker, SQLite, or a daemon.

## Architecture

The root package owns install, audit, CLI, and Studio adapters. The runtime package owns executable orchestration:

1. Validate `.agent-kit/orchestrator.json` and `.agent-kit/agent-roster.json` without provider calls.
2. Select or explicitly load one roster workflow.
3. Compile its sequence to bounded LangGraph nodes.
4. Create an isolated Git worktree from committed `HEAD`; uncommitted source changes are excluded only after explicit acknowledgement.
5. Persist graph checkpoints in SQLite and redacted records/events under `.agent-kit/runtime/`.
6. Pause at applicable plan, network, worktree-write, host-execution, and final-commit gates.
7. Execute provider-backed model nodes or explicitly routed Cursor nodes.
8. Create at most one scoped worktree commit after approval. Never merge, push, or open a pull request.

## Provider And Tool Boundaries

- Native adapters: OpenAI, Anthropic, Gemini, xAI/Grok, DeepSeek, Kimi, GLM, OpenRouter, Ollama, LM Studio, vLLM, and generic OpenAI-compatible endpoints.
- Ordered aliases provide deterministic fallback. Tool calls add an automatic `tools` capability requirement.
- Credentials are `env:` or `keychain:` references only.
- Remote MCP uses Streamable HTTP, explicit host/tool allowlists, HTTPS except literal loopback, DNS/private-address checks, and redirect rejection.
- Stdio MCP uses argv spawning with a minimal environment and requires both config opt-in and host approval.
- File tools reject path traversal, symlink escapes, Git internals, environment files, private keys, package-manager credentials, and runtime evidence paths.
- Mutation commands use a reviewed local Docker image resolved to its immutable image ID, read-only container root, dropped capabilities, no-new-privileges, resource limits, and no network by default.
- Cursor host execution is disabled by default and runs only inside the worktree after explicit approval.

## Commands

```bash
agent-kit orchestrate validate
agent-kit orchestrate plan "Describe the goal" [--workflow <id>]
agent-kit orchestrate run "Describe the goal" [--workflow <id>] [--acknowledge-dirty-base]
agent-kit orchestrate approve <run-id>
agent-kit orchestrate resume <run-id> --decision approve|reject
agent-kit orchestrate status [run-id]
agent-kit orchestrate cancel <run-id>
agent-kit orchestrate export <run-id> [--output <project-relative-path>]
agent-kit provider probe [provider-id]
agent-kit credential set|delete <keychain:reference>
agent-kit mcp probe <server>
```

`agent-kit studio serve` exposes the same run list, detail, start, decision, and cancellation operations through its loopback-only CSRF-protected API and Council/Runs UI.

## Evidence And Recovery

- Run record: `.agent-kit/runtime/runs/<run-id>/run.json`
- Redacted event log: `.agent-kit/runtime/runs/<run-id>/events.jsonl`
- Checkpoints: `.agent-kit/runtime/runtime.sqlite`
- Worktree: OS cache under `agent-kit/worktrees/<repo>/<run-id>`
- Branch: `agent-kit/<run-id>`

Approval IDs are deterministic per run gate. A paused graph resumes with `Command({ resume })`; completed agent nodes are not replayed. Commit finalization is idempotent after checkpoint/process interruption.

## Non-Goals

- Hosted or multi-tenant orchestration
- Automatic merge, push, pull request, deployment, or migration application
- Hidden background workers
- Automatic provider-model naming or entitlement claims
- Treating MCP annotations or model output as trusted authorization

## Acceptance Evidence

- Config and roster validation tests
- Capability fallback and loopback provider normalization tests
- MCP/SSRF, redirect, sensitive-path, secret-redaction, and local HTTP security tests
- SQLite interrupt/resume test proving one mutating agent execution and one commit
- Docker command-construction test for isolation flags and immutable image IDs
- CLI, install/update drift, Agent Studio API/UI, package, SBOM, and release workflow gates
