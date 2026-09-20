# QA: USER_GUIDE.html — "How to invoke in each IDE" rewrite

- Date: 2026-09-20
- Route: `file:///Volumes/Mac%20eSSD/BaseRepo/USER_GUIDE.html` (static, self-contained)
- Viewports: desktop 1280x800, mobile 390x844 (deviceScaleFactor 2)
- Auth: none (static page)
- Browser: Playwright Chromium headless shell 1243 (`~/Library/Caches/ms-playwright`, already installed; no `npx playwright install` run). Script kept under `/tmp/qa-user-guide-ide/`, not in the repo.

## Change under review

1. Five IDE cards (Cursor, Claude Code, Codex, GitHub Copilot, Antigravity) now describe native subagents per host and one skills location `.agents/skills/`.
2. New intro paragraph under the section heading.
3. Start paragraph names `.agents/skills/` and the native agent dirs (`.cursor/`, `.claude/`, `.codex/`, `.github/agents/`, `.agents/agents/`).
4. Troubleshooting: new rows "Cursor lists an agent twice" and "Claude subagent refuses to launch"; edited "Agent missing in an IDE" and "Skill not triggering".
5. No CSS change; first viewport must be unchanged.

## What the screenshots show

`desktop.png` (full page, 1280 wide) and `mobile.png` (full page, 390 wide) — read.
Element crops read from `/tmp/qa-user-guide-ide/`: `{desktop,mobile}-ide-section.png`, `{desktop,mobile}-copilot-card.png`, `{desktop,mobile}-troubleshooting.png`, `{desktop,mobile}-first-viewport.png`, `kbd-01-skip-link.png`, `kbd-07-copilot-copy-focused.png`, `kbd-12.png`.

- **First viewport (desktop + mobile):** unchanged. Header nav, h1 "Say the change. Then open the running UI.", the orange **Fail-closed.** sentence, the Start heading, the init `pre` (`npx --yes @appsforgood/next-supabase-kit init --activate all`) and "Copy init command" button all render as before. On mobile the init command wraps inside its `pre` with no horizontal scroll.
- **Intro paragraph** renders under the h2 on both viewports: "Every host gets the same six agents as native subagents, launched by id. Skills live once in `.agents/skills/`; Claude reads its own copy at `.claude/skills/`."
- **Five IDE cards:** desktop renders a 2-column grid (Cursor | Claude Code, Codex | GitHub Copilot, Antigravity alone bottom-left). Mobile stacks all five at 350px wide. Every card is fully inside the viewport; no clipped text, no card-internal horizontal scroll (`scrollWidth == clientWidth` for every card and for the document on both viewports; zero elements extend past the viewport edge).
- **GitHub Copilot card (longest):** `copilot --agent=qa` renders on one line box on both viewports (`getClientRects().length == 1`, `white-space: nowrap`); the flag is not broken mid-token on mobile (confirmed in `mobile-copilot-card.png`). `/agent planner`, `/agent app-engineer`, `/agent qa` wrap between tokens only. The Copilot prompt `pre` (`pre-wrap`) wraps cleanly with no horizontal scroll, and the "Copy Copilot prompt" button renders below it (167x36) on both viewports.
- **Start paragraph:** shows `.agents/skills/` and the five native agent dirs; wraps cleanly on mobile at the `,` boundaries between paths.
- **Troubleshooting:** on desktop the table shows the two new rows and both edited rows in Problem/Fix columns with no clipping. On mobile the table collapses to stacked Problem-as-heading / Fix-as-body blocks; both new rows wrap cleanly, including `update --force` and `init --activate <ide>` inline code.

## Console / same-origin

- console: none (no `error`, `warning`, or `pageerror` events on either viewport)
- same-origin: none (no failed requests, no responses >= 400)

## Keyboard (accessibility-wcag, desktop)

Tab x12 from page load. Focus order and focus ring (all: `outline: 3px solid rgb(255,90,42)`, `outline-offset: 3px`):

1. `a.skip` "Skip to start" — **first**, becomes visible at top-left on focus (`kbd-01-skip-link.png`)
2. nav "Start"
3. nav "Workflows"
4. nav "Screenshot QA"
5. button "Copy init command"
6. link "Workflows" (in Start paragraph)
7. button "Copy Copilot prompt" (scrolls into view; `kbd-07-copilot-copy-focused.png`)
8. button "Copy Planner prompt"
9. button "Copy App engineer prompt"
10. button "Copy Security prompt"
11. button "Copy Design prompt"
12. button "Copy the copy prompt"

Every focused element had a visible outline. No focus trap. Note: the page uses `scroll-behavior: smooth`, so a focused element far down the page takes ~1s to scroll into view; it does arrive (verified for element 7 with a 1.2s settle).

## Interaction

- Clicking "Copy Copilot prompt" under `file://` in headless Chromium flips the label to "Copy failed — select the text" (clipboard API unavailable in this context). The failure is surfaced visibly rather than swallowed; this is pre-existing behavior of every Copy button on the page, not part of this change.

## Commands run

```bash
npm run smoke:ui-screens
# -> ui screenshot smoke passed: wrote desktop.png and mobile.png to artifacts/ui-screens

npx vitest run tests/public-readiness.test.ts
# -> 1 file, 6 tests passed

PLAYWRIGHT_BROWSERS_PATH="$HOME/Library/Caches/ms-playwright" node /tmp/qa-user-guide-ide/run.mjs
PLAYWRIGHT_BROWSERS_PATH="$HOME/Library/Caches/ms-playwright" node /tmp/qa-user-guide-ide/kbd2.mjs
```

Note: `/tmp/pw-browsers` only holds Chromium build 1193; installed Playwright 1.63.0 requires build 1243, which is already present in the default cache, so that path was used instead. Nothing was installed.

## Verdict

**accept-with-nits**

Nits (none caused by this change; recorded for a future Design pass, not a blocker):

- Desktop grid leaves the Antigravity card alone in the left column with an empty right cell (5 cards in a 2-column grid). Pre-existing layout, CSS deliberately untouched here.
- Copy buttons cannot write the clipboard when the guide is opened via `file://`; the fallback label is correct but the guide could mention selecting the text manually.

Evidence:
- `qa-evidence/2026-09-20-user-guide-ide/desktop.png`
- `qa-evidence/2026-09-20-user-guide-ide/mobile.png`
- `qa-evidence/2026-09-20-user-guide-ide/notes.md`
