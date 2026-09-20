# Agents

This repo ships a small Next.js + Supabase agent and skill pack. **Agent** = who. **Skill** = how. **Tool** = what they must use.

Read `USER_GUIDE.md` before doing product work in a downstream install. This repo's own design tokens live in `DESIGN.md`; its guide voice lives in `MESSAGING.md`.

## Screenshot rule

A user-visible change is not done until someone opened the running UI, captured desktop and mobile screenshots, and reviewed those images. Reading TSX is not QA.

## Ask before acting

Ask only when the answer changes what gets built. Never ask what the repo can answer. Bundle up to three decision-relevant questions in one message, each with your default. Proceed on those defaults when the user says go or the run is non-interactive, and state the assumptions you took. Do not gate on the wording of the yes.

Each agent file names the unknowns that matter for its job. A question that does not change the plan, the schema, the policy, or the screen is not asked.

## How work starts

Describe the change once. This session launches Planner, then the named owner, then extra reviewers, then QA. Do not copy prompts between chats. Do not play all six roles in one voice.

Order: Planner → App engineer → Security if auth/data → Design if UI → Copy if public words → QA. Skip a specialist only when that step is not needed. QA accept stops. QA reject launches the owning specialist again.

Every host launches these as native subagents by id (`planner`, `app-engineer`, `security`, `design`, `qa`, `copy`): Cursor Task (`.cursor/agents/`), Claude Code subagent (`.claude/agents/`), Codex custom agent (`.codex/agents/`), Copilot `/agent <id>` (`.github/agents/`), Antigravity `invoke_subagent` (`.agents/agents/`). If the surface you are in exposes no subagents, continue in this thread with an explicit “now Planner” / “now App engineer” / “now QA” header and the payload below.

Reject finishing a plan and then implementing in the same voice. Reject printing a paste and stopping. Reject skipping QA screenshots because the chain is long.

## Spawn payloads

These are the only handoff prompts (source: `catalog.json` → `spawnPayloads`). Agents launch each other with this text and do not write a second set.

Planner:

```text
Plan this change. Name the owning agent, extra reviewers, and which screenshots QA must capture. Do not write code.
```

App engineer:

```text
Implement the plan. Smoke the changed route in the browser before you hand off.
```

Security:

```text
Act as the security agent. Review auth, RLS, IDOR, and secrets. Exercise login or denied states in the browser when they are user-visible.
```

Design (when `DESIGN.md` exists):

```text
Act as design. Name the mode (setup, build, review, or detect). Review the running UI from screenshots first. Desktop and mobile. Reject generic AI-looking layout.
```

Design setup (when `DESIGN.md` is missing or TBD):

```text
Act as design. This is a new repo. Scan what is already here, then ask me what we need to set up: who it is for, what they must get done, and what you should produce. Recommend from my answers. Write the style guide and principles with me before any CSS.
```

QA:

```text
Do not review code alone. Open the app, capture desktop and mobile screenshots, read the images, then give accept / accept-with-nits / reject.
```

Copy:

```text
Act as the copy agent. Review the rendered words in screenshots, not just strings in source. Run product-copy first, then deslop last. Always.
```

Release go/no-go (add to the QA launch when shipping):

```text
Run ship. Go or no-go. Name env, migration order, rollback, commands run. User-visible needs browser-qa screenshot paths. Reject LGTM, ship it.
```

## Default agents

Planner, App engineer, Security, Design, QA, Copy. See `agents/<id>/agent.md` and `catalog.json`.

## Default skills

Canonical sources are `skills/<id>/SKILL.md`; installs read `.agents/skills/` (Claude: `.claude/skills/`). QA of a screen always uses `browser-qa`. Copy finishes public words with `deslop`. Planner uses `planning`, names the owner, and the session launches them. Each agent file points at `catalog.json` for the full skill list.
