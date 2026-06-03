# Council Session Review Prompt

Use before completing meaningful planning, core-change, frontend-change, security-review, release, or research work.

Review the current work against `.agent-kit/agent-roster.json`, `AGENT_ROSTER.md`, `COUNCIL.md`, and any `.agent-kit/council-sessions/*.json` records.

Return:

1. Selected workflow and why it applies.
2. Required agents and whether each participated.
3. Required outputs and whether each is missing, partial, complete, or not applicable.
4. Handoff trail: agent, decision, risk, next handoff, and evidence.
5. Verification evidence: commands, reviews, screenshots, visual diffs, or documented gaps.
6. Blockers that prevent the session from being marked complete.

Do not accept a handoff that lacks decision, risk, next owner, or evidence.
Run `agent-kit audit` after adding or changing structured council-session JSON records.
