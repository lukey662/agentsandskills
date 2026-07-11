# @appsforgood/agent-kit-runtime

## 0.1.3

### Patch Changes

- Canonicalize Windows paths with the native filesystem resolver before enforcing instruction, tool, and worktree containment.

## 0.1.2

### Patch Changes

- Verify Git top-level roots through repository context so Windows long and short temp-path forms do not reject valid runtime worktrees.

## 0.1.1

### Patch Changes

- Normalize Windows worktree path identity and preserve Node 20 native SQLite coverage on a supported Windows toolchain.

## 0.1.0

- Add the optional local LangGraph runtime with SQLite checkpoints, provider and MCP adapters, risk-tiered approvals, Docker-isolated mutations, Git worktrees, redacted evidence, CLI commands, and Agent Studio integration.
