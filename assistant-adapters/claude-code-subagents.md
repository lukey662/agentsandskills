# Claude Code Subagent Adapter

Claude Code projects can activate Agent Kit by creating project subagents that point back to the canonical council files.

Use `MODEL_ROUTING.md` and `.agent-kit/model-routing.json` when adding model comments or frontmatter to those subagents.

## Suggested Project Layout

```text
.claude/
  agents/
    planner.md
    lead-architect.md
    frontend-design-lead.md
    security-reviewer.md
    qa-engineer.md
```

## Subagent Frontmatter Pattern

```md
---
name: planner
description: Use for planning, phasing, scope breakdown, workflow routing, and council setup in this repository.
---

Read `AGENTS.md`, `AGENT_ROSTER.md`, `.agent-kit/agent-roster.json`, `.agent-kit/project-context.json`, `.agent-kit/project-context.md`, `.agent-kit/agent-briefs.md` when present, `.agent-kit/corrections/project-rules.json`, `.agent-kit/corrections/agent-rules.json`, `COUNCIL.md`, `.agent-kit/council-sessions/`, and `QUALITY_GATES.md` before making routing decisions.

Start with the Planner workflow. For core changes, hand off to Lead Architect. For frontend changes, require Frontend Design Lead evidence. For auth, RLS, secrets, dependency, external-call, or release-risk changes, require Security Reviewer. Record meaningful decisions, risks, handoffs, human corrections, artifacts, evidence, and verification through Agent Studio session files when available.
```

## Guardrails

- Keep detailed role behavior in `AGENTS.md` and `AGENT_ROSTER.md`; subagent files should be focused entry points.
- Document active subagents and verification evidence in `ASSISTANT_ADAPTERS.md`.
- Record model-selection evidence and limitations in `ASSISTANT_ADAPTERS.md`.
- Avoid giving a subagent broader tool access than its role needs.
