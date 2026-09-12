# User Guide

How to use the agents and skills in this repo. Open **[USER_GUIDE.html](USER_GUIDE.html)** to read this as a designed page — that is the copy and layout to judge.

**Agent** = who you ask. **Skill** = the workflow they follow. **Tool** = what they must use. For QA and UI, that tool is a **live browser plus screenshots**, not a file diff.

A user-visible change is not done until someone opened the running UI, captured desktop and mobile screenshots, and reviewed those images.

## 5-minute start

1. Install and activate every IDE this team uses:

```bash
npx --yes @appsforgood/next-supabase-kit init --activate all
```

2. Open the project in your IDE.
3. Paste this to Planner (do not ask it to write code):

```text
Plan this change. Name the owning agent, extra reviewers, and which screenshots QA must capture. Do not write code.
```

You should get a named owner (`app-engineer`, `security`, `design`, `qa`, or `copy`) and, if the work is user-visible, a desktop + mobile screenshot list.

## How to invoke in each IDE

### Cursor

Files: `.cursor/agents/*.md`, `.cursor/skills/*/SKILL.md`, `.cursor/rules/cursor-agent-kit.mdc`

- In chat, mention `@planner`, `@app-engineer`, `@security`, `@design`, `@qa`, or `@copy`.
- Skills apply from their descriptions. To force one, mention `@browser-qa` or the skill name.
- Prefer the built-in browser for QA. Playwright is backup.

### Claude Code

Files: `.claude/agents/*.md`, `CLAUDE.md`

- Use the matching subagent (`planner`, `qa`, …) instead of one generic thread.
- Mention `browser-qa` for any screen review. If Claude has no browser, use the Playwright commands in that skill.

### Codex

Files: `.codex/agents/*.toml`, `AGENTS.md`

- Spawn the named custom agent from `.codex/agents/`.
- Paste the QA prompt below when reviewing UI. Use Playwright if Codex cannot see the page.

### GitHub Copilot

Files: `.github/copilot-instructions.md`

Copilot has no `@agent` picker. Paste a role prompt:

```text
Act as the QA agent. Use the browser-qa skill. Do not review code alone. Open the app, capture desktop and mobile screenshots, read the images, then give accept / accept-with-nits / reject.
```

### Antigravity

Files: `.antigravity/agent-kit/commands/*.toml`, `.antigravity/runtime-skills/*/SKILL.md`

- `/plan` — Planner
- `/browser-qa` — screenshot QA loop
- `/security`, `/frontend`, `/copy`, `/test`, `/ship` — matching specialists

## Which agent do I ask?

| You need | Ask |
| --- | --- |
| A plan and an owner | Planner |
| Implementation | App engineer |
| Auth / RLS / secrets | Security |
| It looks wrong | Design |
| Is this done? | QA |
| Landing / CTA words | Copy |

Do not ask one chat to be all six. Planner names the next specialist. It does not run the other agents.

## Which skill do I use?

| Skill | Use when |
| --- | --- |
| `planning` | Ambiguous work; pick an owner and which skill they run |
| `nextjs-app-router` | App Router, Server vs Client, actions, `proxy.ts` |
| `supabase-auth-rls` | Auth, RLS, service role, Storage |
| `postgres-migrations` | Schema, constraints, RLS in the same change |
| `owasp-security-review` | Mutations, uploads, SSRF, secrets |
| `frontend-design` | Build, review, or detect UI. Tokens first. Anti-generic |
| `accessibility-wcag` | Keyboard, contrast, labels |
| `browser-qa` | Any screen. Required for QA of UI |
| `testing-qa` | Unit / regression / smoke only |
| `product-copy` | Headlines and CTAs |
| `deslop` | Last copy pass. Copy always runs this |
| `ship` | Release, env, rollback |

QA of a screen always uses `browser-qa`, not `testing-qa` alone. Each agent file names the skills it must run, then points at `catalog.json` for the rest.

## Standard workflows

### New feature

1. **Planner** — paste: `Plan this change. Name the owning agent, extra reviewers, and which screenshots QA must capture. Do not write code.`
2. **App engineer** — paste: `Implement the plan. Smoke the changed route in the browser before you hand off.`
3. **Security** if data/auth/secrets changed.
4. **Design** if the UI changed — paste: `Act as design. Name the mode (build, review, or detect). Review the running UI from screenshots first. Desktop and mobile. Reject generic AI-looking layout.`
5. **QA** — paste: `Do not review code alone. Open the app, capture desktop and mobile screenshots, read the images, then give accept / accept-with-nits / reject.`

Done when QA attaches `qa-evidence/<date>-<slug>/desktop.png` and `mobile.png` plus a verdict.

### Auth / RLS change

Planner → App engineer → Security → QA. QA must open login/logout/denied in the browser and still run tests. Screenshots required when the finding is user-visible.

### UI polish

Design + `frontend-design` + `browser-qa`. Name build, review, or detect. Desktop and mobile required. One happy-path shot is a fail.

### Copy pass

Copy reviews **rendered** screenshots, not just strings in TSX. Run `product-copy`, then **`deslop` last**. Do not hand off after the first draft.

## QA screenshot loop

Bad request (reject this):

```text
Review the new settings page in page.tsx and tell me if the layout looks right.
```

Good request:

```text
Do not review code alone. Open the app, capture desktop and mobile screenshots, read the images, then give accept / accept-with-nits / reject.
```

Steps the QA agent must follow:

1. Start or find the app (`next dev` or preview).
2. Open the changed route with the real auth/role/data state.
3. Capture desktop (~1280) and mobile (~390) into `qa-evidence/<yyyy-mm-dd>-<slug>/`.
4. **Read the images.** List blockers from what is on screen.
5. Run applicable tests.
6. Write `notes.md` with route, viewports, auth state, verdict.

Cursor: use the built-in browser first. Claude / Codex / Copilot / Antigravity: use the host browser if present, otherwise Playwright:

```bash
npx playwright screenshot --viewport-size=1280,720 "$URL" qa-evidence/<slug>/desktop.png
npx playwright screenshot --viewport-size=390,844 "$URL" qa-evidence/<slug>/mobile.png
```

## Adding more

```bash
npx agent-kit add agent lead-architect
npx agent-kit add skill debug
```

Optional agents: `lead-architect`, `docs`, `deploy`, `research`.  
Optional skills: `ui-polish`, `docs`, `upgrade`, `debug`.

Do not add them unless you have a repeating job for that specialist.

## Updating

```bash
npx agent-kit update
```

Pristine files refresh. Local edits win or land in `.agent-kit/conflicts/`. Do not re-init. `update` never deletes your old docs.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Agent missing in Cursor / Claude | Re-run `init --activate cursor` or `claude`. Check `.cursor/agents/` or `.claude/agents/`. |
| Skill not triggering | Mention the skill name (`browser-qa`) or `@` it in Cursor. |
| No browser in Copilot / Codex | Use the Playwright commands in `browser-qa`. |
| QA finished from the diff | Reject it. Re-run with the good QA prompt above. |
| GitHub shows `USER_GUIDE.html` as code | Open the file in a browser. Run `npx agent-kit guide` to print the path. GitHub does not render the layout. |
| `doctor` fails USER_GUIDE | The screenshot fail-closed sentence must stay in this file. |
| Still have `QUALITY_GATES.md` / `COUNCIL.md` | Expected. `update` does not delete them. `doctor` lists leftovers. |
