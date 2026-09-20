# QA — USER_GUIDE.html (2026-09-20)

## Route

`file:///Volumes/Mac%20eSSD/BaseRepo/USER_GUIDE.html` (self-contained static page, no server). Auth: none.

## Viewports

- `desktop.png` — 1280x800 viewport, full page (1280x7399, no horizontal scroll: scrollWidth 1280 = clientWidth 1280)
- `mobile.png` — 390x844 viewport, full page (390x10574, no horizontal scroll: scrollWidth 390 = clientWidth 390)

Captured with Playwright Chromium (headless shell). Element-level 2x crops of the four changed regions were also captured under `/tmp` and read; not kept in the repo.

## What the screenshots show

First viewport (desktop and mobile) is unchanged: "Say the change. Then open the running UI." h1, the "Fail-closed. Do not review code alone…" sentence, the Start heading, and the `npx --yes @appsforgood/next-supabase-kit init --activate all` block with the Copy init command button. No layout change observed.

The four changed regions render with the new words, fully visible, no truncation, no clipping (no `td` with scrollWidth/scrollHeight > client size on either viewport), no element extending past the viewport:

1. Skill table row `frontend-design`: "Setup, build, review, or detect UI. Derive tokens from the product. Owns the visual fail list" — two lines on desktop, two lines on mobile (stacked card layout).
2. Skill table row `deslop`: "Last copy pass. Word and structure tells. Copy always runs this" — one line on desktop, two lines on mobile.
3. Updating paragraph: "`update` refreshes pristine files. Local edits win or land in `.agent-kit/conflicts/`. It never deletes your old docs unless you pass `--prune-legacy`, which lists the 0.3 council leftovers and asks before removing them." — three lines on desktop, five on mobile.
4. Troubleshooting row "Still have `QUALITY_GATES.md` / `COUNCIL.md`": "`doctor` lists them. Run `update --prune-legacy` on a branch to remove them and any 0.3 agent shadowing a 0.4 one." — two lines on desktop, three on mobile.

Rendered `document.body.innerText` contains all four expected strings on both viewports.

## Console

console: none (no `error`/`warning` console messages, no `pageerror`) on desktop or mobile.

## Same-origin

same-origin: none (no `requestfailed`, no response ≥ 400) on desktop or mobile.

## Keyboard (accessibility-wcag pass, desktop 1280x800)

Tabbed through the first ten focusable elements. Order: `a.skip` "Skip to start" (#start) → nav "Start" → nav "Workflows" → nav "Screenshot QA" → button "Copy init command" → link "Workflows" (#design-setup) → button "Copy Copilot prompt" → button "Copy Planner prompt" → button "Copy App engineer prompt" → button "Copy Security prompt".

- Skip link receives focus first: yes. It becomes visible at top-left (12,12; 111x38) on focus.
- Every focused element matched `:focus-visible` and had computed `outline-style: solid`, `outline-width: 3px`, `outline-color: rgb(255, 90, 42)`. None had `outline-style: none`.

## Commands run

```bash
node /tmp/qa-user-guide-capture.mjs      # Playwright: full-page desktop/mobile PNGs, console + request capture, overflow/clip checks, 10-Tab keyboard pass
node /tmp/qa-user-guide-crops.mjs        # Playwright: 2x element crops of the four changed regions for image review (written to /tmp)
npm run smoke:ui-screens                 # passed: "ui screenshot smoke passed: wrote desktop.png and mobile.png to artifacts/ui-screens"
npx vitest run tests/public-readiness.test.ts   # passed: 1 file, 6 tests
```

Environment note: the sandbox `PLAYWRIGHT_BROWSERS_PATH` had no Chromium for playwright 1.55.1 (build 1193) and `npx playwright install chromium` was stalling on download, so the scripts and the smoke ran with `PLAYWRIGHT_BROWSERS_PATH=/tmp/pw-browsers`, a symlink shim pointing at the locally installed `chromium_headless_shell-1223` in `~/Library/Caches/ms-playwright`. Nothing was written to the repo other than this evidence folder.

## Verdict

**accept-with-nits**, then the one nit was fixed and the evidence re-captured.

Nit found on the first pass: on mobile (390px) the inline `--prune-legacy` code token in the Updating paragraph wrapped at the hyphen, rendering as `--` at the end of one line and `prune-legacy` at the start of the next. Fix applied by the owner: a scoped `code.flag { white-space: nowrap }` rule on the two `--prune-legacy` tokens only (not on all inline code, so long paths still wrap). Re-capture after the fix: `desktop.png` and `mobile.png` above were regenerated; the flag stays on one line at 390px; `scrollWidth == clientWidth` on both viewports; console: none; same-origin: none.

Not a defect: focused Copy buttons at Tab 7–10 were reported outside the viewport at the moment of measurement because the page uses `scroll-behavior: smooth`; the focus ring still renders and the element scrolls into view after the animation.

Final verdict after the fix: **accept**.
