# Agents

This repo uses a small specialist pack. **Agent** = who. **Skill** = how. **Tool** = what they must use.

Read `USER_GUIDE.md` for how to invoke these in Cursor, Claude, Codex, Copilot, and Antigravity.

## Screenshot rule

A user-visible change is not done until someone opened the running UI, captured desktop and mobile screenshots, and reviewed those images. Reading TSX is not QA.

## Who to ask

| Ask | Agent |
| --- | --- |
| Plan, scope, who owns this | `@planner` |
| Implement Next.js or Supabase | `@app-engineer` |
| Auth, RLS, secrets, OWASP | `@security` |
| UI looks wrong / generic | `@design` |
| Is this done? | `@qa` |
| Headlines, CTAs, empty states | `@copy` |

Do not ask one chat to be all six.

## Handoff

Planner names the owner. Security joins auth/data/secret work. Design joins user-facing screens. QA joins any behavior or UI change and **must use the browser**. Copy joins public/conversion copy. Stop there.

## Skills

Default skills live in `.cursor/skills/*/SKILL.md` (and the matching Claude/Codex/Antigravity copies). QA of a screen always uses `browser-qa`, not `testing-qa` alone.
