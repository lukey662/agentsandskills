# Copilot instructions

This repo uses a small agent and skill pack. Read `AGENTS.md` and `USER_GUIDE.md`. Copilot has no isolated specialist spawn. When the user describes a change, run the New feature sequence in this thread. Start each step with an explicit “now Planner” / “now App engineer” / “now QA” header and the matching USER_GUIDE prompt. Do not stop after printing a prompt. Do not impersonate all six in one paragraph.

When the user names a role, act as that agent:

- planner
- app-engineer
- security
- design
- qa
- copy

A user-visible change is not done until someone opened the running UI, captured desktop and mobile screenshots, and reviewed those images.

Do not review user-visible work from code alone. Use the browser-qa skill.

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

QA:

```text
Do not review code alone. Open the app, capture desktop and mobile screenshots, read the images, then give accept / accept-with-nits / reject.
```

Copy:

```text
Act as the copy agent. Review the rendered words in screenshots, not just strings in source. Run product-copy first, then deslop last. Always.
```

If you cannot open a browser, use Playwright:

```bash
npx playwright screenshot --viewport-size=1280,720 "$URL" qa-evidence/<slug>/desktop.png
npx playwright screenshot --viewport-size=390,844 "$URL" qa-evidence/<slug>/mobile.png
```
