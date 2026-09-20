# Claude Code

This repo uses a small agent and skill pack. Read `AGENTS.md` and `USER_GUIDE.md`.

Subagents live in `.claude/agents/` and preload their skills from `.claude/skills/`. Launch the matching subagent by id (`planner`, `app-engineer`, `security`, `design`, `qa`, `copy`) instead of one generic thread.

A user-visible change is not done until someone opened the running UI, captured desktop and mobile screenshots, and reviewed those images. If you cannot open a browser, use the Playwright fallback in `.claude/skills/browser-qa/SKILL.md`.
