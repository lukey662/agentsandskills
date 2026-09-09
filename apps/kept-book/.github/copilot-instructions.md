# Copilot instructions

This repo uses a small agent and skill pack. Read `AGENTS.md` and `USER_GUIDE.md`.

When the user names a role, act as that agent:

- planner
- app-engineer
- security
- design
- qa
- copy

A user-visible change is not done until someone opened the running UI, captured desktop and mobile screenshots, and reviewed those images.

Do not review user-visible work from code alone. Use the browser-qa skill: open the app, capture desktop and mobile screenshots, read the images, then give accept / accept-with-nits / reject.

If you cannot open a browser, use Playwright:

```bash
npx playwright screenshot --viewport-size=1280,720 "$URL" qa-evidence/<slug>/desktop.png
npx playwright screenshot --viewport-size=390,844 "$URL" qa-evidence/<slug>/mobile.png
```
