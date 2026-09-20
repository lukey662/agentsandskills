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
3. Say the change. This session launches Planner, then the named owner, then extra reviewers, then QA. You do not copy a prompt.

You should get a named owner (`app-engineer`, `security`, `design`, `qa`, or `copy`) and, if the work is user-visible, a desktop + mobile screenshot list. The session launches that owner. It does not stop after a plan.

If this repo has no product `DESIGN.md` yet, the session launches Design setup (see Workflows). Do not paste a second start prompt.

## How to invoke in each IDE

Every host gets the same six agents as native subagents, launched by id. Skills live once in `.agents/skills/<id>/SKILL.md`; Claude reads its own copy at `.claude/skills/`.

### Cursor

Files: `.cursor/agents/<id>.md`, `.agents/skills/<id>/SKILL.md`, `.cursor/rules/cursor-agent-kit.mdc`

- Describe the change in chat. This session launches `@planner` as a Task, then the owner (`@app-engineer`, `@security`, `@design`, `@qa`, or `@copy`). You do not have to @mention them.
- Planner is `readonly`; it cannot implement.
- Skills apply from their descriptions. To force one, type `/browser-qa` or name it.
- Prefer the built-in browser for QA. Playwright is backup.

### Claude Code

Files: `.claude/agents/<id>.md`, `.claude/skills/<id>/SKILL.md`, `CLAUDE.md`

- This session launches the matching subagent by id. Each subagent preloads its skills (`skills:` in its frontmatter), so Design and QA start with `browser-qa` in context.
- Planner, Security, and Design run at `effort: high`.
- If Claude has no browser, use the Playwright commands in `browser-qa`.

### Codex

Files: `.codex/agents/<id>.toml`, `.agents/skills/<id>/SKILL.md`, `AGENTS.md`

- This session spawns the named custom agent from `.codex/agents/`. Planner, Security, and Design use high reasoning effort.
- Codex discovers the skills from `.agents/skills/`. Use Playwright if Codex cannot see the page.

### GitHub Copilot

Files: `.github/agents/<id>.agent.md`, `.agents/skills/<id>/SKILL.md`, `.github/copilot-instructions.md`

- Launch each specialist with `/agent planner`, `/agent app-engineer`, `/agent qa` (CLI: `copilot --agent=qa`) and its payload from `AGENTS.md`.
- If the Copilot surface you are in has no custom agents, run the same sequence in this thread under a “now Planner” / “now App engineer” / “now QA” header. Do not stop after printing a prompt.

### Antigravity

Files: `.agents/agents/<id>/agent.md`, `.agents/skills/<id>/SKILL.md`, `.agents/rules/agent-kit.md`

- Each agent is a custom subagent (`subagent: true`) with its skills attached. Say the change; the main agent calls `invoke_subagent` for Planner, then the owner, then QA. You can also pick an agent directly from `/agents`.
- If subagents are unavailable, continue in this thread under a “now App engineer” header with the same payload.

## Which agent do I ask?

| You need | Ask |
| --- | --- |
| A plan and an owner | Planner |
| Implementation | App engineer |
| Auth / RLS / secrets | Security |
| It looks wrong | Design |
| Style guide / first UI / no DESIGN.md | Design (`setup`) |
| Is this done? | QA |
| Landing / CTA words | Copy |

Do not ask one chat to be all six. Planner names the next specialist. The session launches them.

## Which skill do I use?

| Skill | Use when |
| --- | --- |
| `planning` | Ambiguous work; pick an owner and which skill they run |
| `nextjs-app-router` | App Router, Server vs Client, actions, `proxy.ts` |
| `supabase-auth-rls` | Auth, RLS, service role, Storage |
| `postgres-migrations` | Schema, constraints, RLS in the same change |
| `owasp-security-review` | Mutations, uploads, SSRF, secrets |
| `frontend-design` | Setup, build, review, or detect UI. Derive tokens from the product. Owns the visual fail list |
| `accessibility-wcag` | Keyboard pass in the running browser. Contrast, labels. Not a screenshot guess |
| `browser-qa` | Any screen. Required for QA of UI |
| `testing-qa` | Unit / regression / smoke. List commands run. Not screenshots |
| `product-copy` | Headlines, CTAs, empty states. Confirm Reader / Job / One action / Proof |
| `deslop` | Last copy pass. Word and structure tells. Copy always runs this |
| `ship` | Go / no-go. Env, rollback, commands. UI needs screenshot paths |

QA of a screen always uses `browser-qa`, not `testing-qa` alone. User-facing screens also run `accessibility-wcag` (keyboard in the browser, not a contrast guess from the screenshot). Each agent file names the skills it must run, then points at `catalog.json` for the rest.

## Standard workflows

### New feature

Launch in this order. Skip Security, Design, or Copy when that specialist is not needed. The session launches each specialist; you do not copy these blocks.

1. **Planner** — spawn payload: `Plan this change. Name the owning agent, extra reviewers, and which screenshots QA must capture. Do not write code.`
2. **App engineer** — spawn payload: `Implement the plan. Smoke the changed route in the browser before you hand off.`
3. **Security** if data/auth/secrets changed — spawn payload:

```text
Act as the security agent. Review auth, RLS, IDOR, and secrets. Exercise login or denied states in the browser when they are user-visible.
```

4. **Design** if the UI changed — spawn payload: `Act as design. Name the mode (setup, build, review, or detect). Review the running UI from screenshots first. Desktop and mobile. Reject generic AI-looking layout.` If `DESIGN.md` is missing, run setup first.
5. **Copy** if public words changed — spawn payload: `Act as the copy agent. Review the rendered words in screenshots, not just strings in source. Run product-copy first, then deslop last. Always.`
6. **QA** — spawn payload: `Do not review code alone. Open the app, capture desktop and mobile screenshots, read the images, then give accept / accept-with-nits / reject.` For screens, also run `accessibility-wcag`.

Done when QA attaches `qa-evidence/<date>-<slug>/desktop.png` and `mobile.png` plus a verdict, and the changed flow passed a keyboard-only check.

### Auth / RLS change

Planner → App engineer → Security → QA. QA must open login/logout/denied in the browser and still run tests. Screenshots required when the finding is user-visible.

### New repo design setup

After `init`, before the first product CSS, the session launches Design with:

```text
Act as design. This is a new repo. Scan what is already here, then ask me what we need to set up: who it is for, what they must get done, and what you should produce. Recommend from my answers. Write the style guide and principles with me before any CSS.
```

Design scans the stack, then asks what you need. Recommendations come from those answers. It writes a short product `DESIGN.md` and frontend `STYLE_GUIDE.md` rules only after that. It does not paste this kit’s charcoal desk onto the app. Screenshots wait until there is a screen to capture.

### UI polish

Design + `frontend-design` + `accessibility-wcag` + `browser-qa`. Name setup, build, review, or detect. Desktop and mobile required once a screen exists. One happy-path shot is a fail. A contrast guess from the screenshot is a fail.

### Accessibility pass

On any user-facing screen, launch Design or QA with:

```text
Run accessibility-wcag. Open the changed flow. Keyboard-only pass. Do not accept contrast from the screenshot alone.
```

### Copy pass

Copy reviews **rendered** screenshots, not just strings in TSX. Confirm Reader / Job / One action / Proof, run `product-copy`, then **`deslop` last**. Do not hand off after the first draft. Spawn payload:

```text
Act as the copy agent. Review the rendered words in screenshots, not just strings in source. Run product-copy first, then deslop last. Always.
```

### Release / ship

Before you promote or deploy, launch QA with:

```text
Run ship. Go or no-go. Name env, migration order, rollback, commands run. User-visible needs browser-qa screenshot paths. Reject LGTM, ship it.
```

QA names the verdict. App engineer names env and the app rollback. Security names secrets and RLS. Missing screenshot paths on a user-visible release is a no-go.

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
5. Keyboard-only the changed flow (`accessibility-wcag`). Do not accept contrast from the screenshot alone.
6. Run applicable tests (`testing-qa`). List the commands. `toBeVisible` is not a screenshot.
7. Write `notes.md` with route, viewports, auth state, keyboard result, commands run, verdict.

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
Optional skills: `ui-polish`, `docs`, `upgrade`, `debug`, `web-performance`.

Do not add them unless you have a repeating job for that specialist.

Add `debug` when the same failure keeps coming back. Reproduce → localize → reduce → fix → guard. User-visible bugs need before/after `browser-qa`. Reject guessing from the stack trace alone. Not on default `init`.

Add `docs` when `USER_GUIDE`, `CHANGELOG`, or the living file this change moved needs an update. Reject restoring the 17-doc OS.

Add `upgrade` when bumping this pack or frameworks. Run `agent-kit update` on a branch. Read `UPGRADE.md`. Reject `init --force` as the upgrade path.

Add `ui-polish` after the main `frontend-design` pass, not instead of it. If `DESIGN.md` is missing, Design `setup` first. Still desktop + mobile. Reject using polish as a second design system.

Add `web-performance` when the ask is LCP / INP / CLS / “this page is slow.” Measure → identify → fix → re-measure. Map onto `next/image`, RSC payload, and PostgREST N+1. Reject optimizing from a guess. Not on default `init`.

## Updating

```bash
npx agent-kit update
```

Pristine files refresh automatically using recorded install hashes. Local edits win or land in `.agent-kit/conflicts/`. Do not re-init. `update` never deletes your old files unless you pass `--prune-legacy`, which lists 0.3 council leftovers and 0.4 duplicate skill copies and asks before removing them.

When upgrading from 0.4 or earlier:

```bash
git switch -c agent-kit-0.5
npx agent-kit update --prune-legacy
npx agent-kit doctor
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Agent missing in an IDE | Re-run `init --activate <ide>` (or `all`). Agents render to `.cursor/agents/`, `.claude/agents/`, `.codex/agents/`, `.github/agents/`, `.agents/agents/`. |
| Skill not triggering | Name it (`browser-qa`) or type `/browser-qa`. Skills live in `.agents/skills/` (Claude: `.claude/skills/`). |
| No browser in Copilot / Codex | Use the Playwright commands in `browser-qa`. |
| Cursor lists an agent twice | Cursor also reads `.claude/agents/` and `.codex/agents/`. Keep one host activated in Cursor-only repos, or pick the `.cursor` entry. |
| Claude subagent refuses to launch | Its `tools:` must be real Claude tool names. Run `update --force` to re-render; `doctor` fails on a stale file. |
| QA finished from the diff | Reject it. Re-run with the good QA prompt above. |
| GitHub shows `USER_GUIDE.html` as code | Open the file in a browser. Run `npx agent-kit guide` to print the path. GitHub does not render the layout. |
| `doctor` fails USER_GUIDE | The screenshot fail-closed sentence must stay in this file. |
| Still have `QUALITY_GATES.md` / `COUNCIL.md` | `doctor` lists them. Run `update --prune-legacy` on a branch to remove them and any 0.3 agent shadowing a 0.4 one. |
