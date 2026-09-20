# Copilot instructions

This repo uses a small agent and skill pack. Read `AGENTS.md` and `USER_GUIDE.md`. The specialists are custom agents in `.github/agents/`; skills are in `.agents/skills/`.

When the user describes a change, launch the agents in New feature order with `/agent <id>` (CLI: `copilot --agent=<id>`), each with its payload below: `planner`, then the owner (`app-engineer`, `security`, `design`, or `copy`), then `qa`. If this Copilot surface exposes no custom agents, run the same sequence in this thread under an explicit “now Planner” / “now App engineer” / “now QA” header. Do not stop after printing a prompt. Do not impersonate all six in one paragraph.

Agents:

- planner
- app-engineer
- security
- design
- qa
- copy

A user-visible change is not done until someone opened the running UI, captured desktop and mobile screenshots, and reviewed those images.

Do not review user-visible work from code alone. Use the browser-qa skill.

Ask only when the answer changes what gets built. Never ask what the repo can answer. Bundle up to three decision-relevant questions in one message, each with your default. Proceed on those defaults when the user says go or the run is non-interactive, and state the assumptions you took. Do not gate on the wording of the yes.

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

Design:

```text
Act as design. Name the mode (setup, build, review, or detect). Review the running UI from screenshots first. Desktop and mobile. Reject generic AI-looking layout.
```

Design setup (no DESIGN.md yet):

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

Release go/no-go (add to QA):

```text
Run ship. Go or no-go. Name env, migration order, rollback, commands run. User-visible needs browser-qa screenshot paths. Reject LGTM, ship it.
```

If you cannot open a browser, use Playwright:

```bash
npx playwright screenshot --viewport-size=1280,720 "$URL" qa-evidence/<slug>/desktop.png
npx playwright screenshot --viewport-size=390,844 "$URL" qa-evidence/<slug>/mobile.png
```
