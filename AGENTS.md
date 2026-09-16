# Agents

This repo ships a small Next.js + Supabase agent and skill pack. **Agent** = who. **Skill** = how. **Tool** = what they must use.

Read `USER_GUIDE.md` before doing product work in a downstream install.

## Screenshot rule

A user-visible change is not done until someone opened the running UI, captured desktop and mobile screenshots, and reviewed those images. Reading TSX is not QA.

## How work starts

Describe the change once. This session launches Planner, then the named owner, then extra reviewers, then QA. Do not copy prompts between chats. Do not play all six roles in one voice.

Order: Planner → App engineer → Security if auth/data → Design if UI → Copy if public words → QA. Skip a specialist only when that step is not needed. QA accept stops. QA reject launches the owning specialist again.

Cursor Task types: `planner` → `planner`, `app-engineer` → `nextjs-engineer`, `security` → `security-reviewer`, `design` → `frontend-design-lead`, `qa` → `qa-engineer`, `copy` → `marketing-copy-lead`. Claude and Codex launch the matching named agent file. Copilot and Antigravity cannot spawn isolated agents: continue in this thread with an explicit “now Planner” / “now App engineer” / “now QA” header and the same USER_GUIDE prompt text.

Reject finishing a plan and then implementing in the same voice. Reject printing a paste and stopping. Reject skipping QA screenshots because the chain is long.

## Default agents

Planner, App engineer, Security, Design, QA, Copy. See `agents/<id>/agent.md` and `catalog.json`.

## Default skills

See `skills/<id>/SKILL.md`. QA of a screen always uses `browser-qa`. Copy finishes public words with `deslop`. Planner uses `planning`, names the owner, and the session launches them. Each agent file points at `catalog.json` for the full skill list.
