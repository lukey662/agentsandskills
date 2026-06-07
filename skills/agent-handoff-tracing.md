# Agent Handoff Tracing Skill

## Use When

Planning, routing, reviewing, or completing work that involves more than one agent role, touches a core workflow, or needs auditable council evidence.

## Goal

Make agent collaboration inspectable. Every meaningful handoff should state who owns the next step, what was decided, what risk remains, and what evidence proves the required outputs.

## Required Checks

- Select the workflow from `.agent-kit/agent-roster.json`.
- Read `.agent-kit/project-context.json` and `.agent-kit/project-context.md` when present.
- Read active project and agent correction rules from `.agent-kit/corrections/` before making or reviewing decisions.
- Confirm the workflow sequence and council members before implementation.
- Record each agent handoff with decision, risk, next handoff, and evidence.
- Confirm required outputs are missing, partial, complete, or not applicable.
- Use `agent-kit session start`, `decision`, `handoff`, `correct`, `artifact`, `verify`, `render`, and `close` for local Agent Studio traces when available.
- Use `COUNCIL.md` for human-readable notes and schema-backed `.agent-kit/council-sessions/` records when CLI tooling is unavailable.
- Run `agent-kit audit` after adding structured session records.
- Run `agent-kit session render` after changing session evidence so `index.md` and `transcript.md` are current.
- Run `agent-kit studio export` when a self-contained local HTML session view would help the user inspect handoffs and transcript streams.
- Do not mark a council session complete until required outputs and verification evidence are present.

## Reject By Default

- Specialist agents acting without Planner routing on ambiguous or cross-layer work.
- Core changes that skip Lead Architect.
- Security-sensitive work that skips Security Reviewer.
- Behavior changes that skip QA evidence.
- Handoffs with only a summary and no risk, next owner, or evidence.
- Continuing after a user correction without recording the correction and deciding whether it should become a durable project or agent rule.

## Review Output

Return:

- Workflow selected.
- Agents required and agents actually involved.
- Missing handoffs or missing required outputs.
- Evidence that proves completion.
- Recommended next handoff.
- Agent Studio session path or rendered Markdown evidence when available.
