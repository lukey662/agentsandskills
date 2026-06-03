# Agent Handoff Tracing Skill

## Use When

Planning, routing, reviewing, or completing work that involves more than one agent role, touches a core workflow, or needs auditable council evidence.

## Goal

Make agent collaboration inspectable. Every meaningful handoff should state who owns the next step, what was decided, what risk remains, and what evidence proves the required outputs.

## Required Checks

- Select the workflow from `.agent-kit/agent-roster.json`.
- Confirm the workflow sequence and council members before implementation.
- Record each agent handoff with decision, risk, next handoff, and evidence.
- Confirm required outputs are missing, partial, complete, or not applicable.
- Use `COUNCIL.md` for human-readable notes and `.agent-kit/council-sessions/*.json` records that follow `.agent-kit/schemas/council-session.schema.json` when a project needs machine-readable traces.
- Run `agent-kit audit` after adding structured session records.
- Do not mark a council session complete until required outputs and verification evidence are present.

## Reject By Default

- Specialist agents acting without Planner routing on ambiguous or cross-layer work.
- Core changes that skip Lead Architect.
- Security-sensitive work that skips Security Reviewer.
- Behavior changes that skip QA evidence.
- Handoffs with only a summary and no risk, next owner, or evidence.

## Review Output

Return:

- Workflow selected.
- Agents required and agents actually involved.
- Missing handoffs or missing required outputs.
- Evidence that proves completion.
- Recommended next handoff.
