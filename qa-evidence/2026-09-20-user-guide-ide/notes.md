# QA + ship: USER_GUIDE.html for 0.5.0 (PR 76)

- Date: 2026-09-20
- Route: `http://127.0.0.1:8771/USER_GUIDE.html` (static; Python `http.server` on 8771)
- Viewports: desktop 1280x800, mobile 390x844
- Auth: none (static page). Empty / error / denied: N/A
- Browsers: Cursor IDE browser (lock, fold/section shots, click Copy, keyboard attempt) + Playwright Chromium (`PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright`) for full-page PNGs and Tab pass

## Must-verify (read from pixels + live DOM)

1. **Fail-closed sentence and qa-evidence path** — present on both viewports. Orange **Fail-closed.** then “Do not review code alone… Evidence is `qa-evidence/<date>-<slug>/desktop.png` and `mobile.png`.”
2. **Init command** — `npx --yes @appsforgood/next-supabase-kit init --activate all` in the Start `pre`. Desktop one line; mobile wraps inside the `pre` (`init --activate all` on the next line). No page overflow.
3. **How to invoke / five IDE hosts** — heading plus Cursor, Claude Code, Codex, GitHub Copilot, Antigravity. Desktop 2-column grid; mobile stacks at 350px. `copilot --agent=qa` is `nowrap` (1 client rect) at 390px.
4. **`--prune-legacy` does not wrap on mobile** — `code.flag` `white-space: nowrap`, 1 client rect at 390px. Updating paragraph keeps the flag on one token (`--prune-legacy, which lists…`).

## What the screenshots show

Full page: `desktop.png` (1280×7922, scrollWidth=clientWidth), `mobile.png` (390×11311, no horizontal overflow).

Section crops (same folder): `d-` / `m-` `failclosed`, `init`, `invoke`, `updating`, `prune-flag`.

- First fold matches current HTML: charcoal header, h1 “Say the change. Then open the running UI.”, fail-closed rule, Start, init `pre`, Copy button, `.agents/skills/` + five native agent dirs.
- IDE cards: five hosts named; Copilot fallback prompt + Copy button; Antigravity alone in the left column of the 2-col grid.
- Updating + troubleshooting: `--prune-legacy` / `update --prune-legacy` stay on one token.

## Console / same-origin

- console: none (Playwright: no `error`/`warning`/`pageerror` on either viewport)
- same-origin: none (no `requestfailed`, no response ≥ 400; live `GET /USER_GUIDE.html` 200)

## Keyboard (accessibility-wcag)

Playwright Tab ×12 from load (code-certain):

1. `a.skip` “Skip to start” — outline `solid 3px rgb(255, 90, 42)`, offset 3px
2. nav Start
3. nav Workflows
4. nav Screenshot QA
5. button Copy init command
6. in-body Workflows link
7–12. Copy Copilot / Planner / App engineer / Security / Design / copy prompts

No trap. Escape did not trap. Contrast measured from computed styles (not screenshot guess): body text 15.83:1 on `rgb(16,16,14)`; **Fail-closed.** orange 6.12:1.

IDE browser: Copy init click shows a visible orange focus ring. `Shift+Tab` from that button was swallowed by the host chrome (Tab also jumped away from an unfocused page). Playwright Tab is the keyboard evidence.

```text
keyboard: tab-order pass; focus-visible pass; trap none
contrast: measured
```

## Interaction

Clicking “Copy init command” over `http://127.0.0.1` in the IDE browser flipped the label to “Copy failed — select the text”. Failure is visible, not swallowed. Pre-existing clipboard limitation in this embedded browser; not a 0.5.0 content defect.

## Commands run

```text
commands:
  - npm run release:check                          # pass; 20 files / 101 tests; coverage 83.52/65.53/86.71/86.21; pack @0.5.0 111 files 161.5 kB
  - PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright npm run smoke:ui-screens
                                                   # pass; artifacts/ui-screens desktop.png + mobile.png
  - npm pack --dry-run                             # @appsforgood/next-supabase-kit@0.5.0, 111 files, 161546 bytes
  - npm view @appsforgood/next-supabase-kit version
                                                   # 0.4.11
  - Playwright capture of USER_GUIDE.html @ 1280 and 390 (this folder)
gaps: smoke:ui-screens fails in the sandbox without PLAYWRIGHT_BROWSERS_PATH; used the local Playwright cache
```

PR 76 CI: Verify matrix (ubuntu/mac/windows × Node 20/22/24), CodeQL, UI screenshot smoke, dependency review — all success. Head `982c756`. Not merged.

## Nits (not blockers)

- Desktop: Antigravity alone in a 2-column grid (Design nit; CSS unchanged).
- Start says “You do not copy a prompt”; Copilot card still has a copyable fallback prompt (Copy nit).
- `UPGRADE.md` says “sixteen council skills”; prune allowlist has 18 skill ids (Copy nit; not on this HTML).
- Mobile: `qa-evidence/<date>-<slug>` wraps after `<date>-`; “Reject init --force” splits at the hyphen (that `--force` is not `code.flag`).
- Copy buttons fail in the IDE/embedded browser; label is correct.

## Verdict

**accept-with-nits**

Evidence:
- `qa-evidence/2026-09-20-user-guide-ide/desktop.png`
- `qa-evidence/2026-09-20-user-guide-ide/mobile.png`
- `qa-evidence/2026-09-20-user-guide-ide/notes.md`
- `qa-evidence/2026-09-20-user-guide/` kept as stale chrome reference (Start/IDE there is outdated)
