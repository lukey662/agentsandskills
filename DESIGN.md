# DESIGN.md

Design contract for this repo's own surfaces. Downstream products write their own `DESIGN.md` through Design `setup`; nothing here is pasted onto an app.

## Need

An engineer opens the guide, sees who to ask and the one rule that cannot be skipped, and says the change. Nothing sells; everything assigns.

## Product

A CLI plus installable markdown. Surfaces: `USER_GUIDE.html` (the one designed page), CLI output, `README.md`.

## Who it is for

Engineers who already have an IDE and an npm project. They read terminals and GitHub all day. They do not need convincing; they need the assignment.

## First-screen job

`USER_GUIDE.html` first viewport: the init command, the named specialists, the fail-closed screenshot sentence, and “say the change.” Not a slogan, not feature cards, not fake QA frames.

## Architecture found

Self-contained HTML (no Google Fonts, no CDN CSS), `data-view="user-guide"`, a skip link, safelight `:focus-visible` outline, `lang` on `<html>`. CLI prints human text by default with `--json` behind a flag; colour degrades to monochrome when not a TTY or `NO_COLOR` is set.

## Principles

1. First screen is the work: an assignment desk, not a SaaS landing page.
2. One field, one ink, one accent, one line. Safelight only for required / fail.
3. Hierarchy from size, weight, and space. No cards, no gradients, no shadows.
4. States before decoration: pass / warn / fail wells are flat tints, never a left stroke.
5. Motion: none.
6. WCAG 2.1 AA: 4.5:1 text, visible focus, skip link, keyboard order matches visual order.

## Tokens

Object: a charcoal assignment desk under a safelight.

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#10100e` | Page field |
| Ink | `#eceae4` | Body text |
| Frame | `#070706` | Code wells, header band |
| Line | `#2a2823` | Borders, table rules |
| Safelight | `#ff5a2a` | Required / fail only; primary CTA |
| Pass | `#5ea37a` | Pass state only |
| Type | `"Helvetica Neue", Helvetica, Arial, ui-sans-serif` | Body and headings |
| Mono | `ui-monospace, Menlo, Consolas` | Commands, paths, payloads |
| Radius | `2px` | Everything |
| Shadow | none | |

CLI: ANSI semantic colours only (green pass, yellow warn, red fail, cyan headings, dim remediation), level word always printed so colour is never the only signal.

## Anti-references

- Slogan hero over equal feature cards over a numbered ticket stack.
- “Screenshots” that are styled divs.
- Tracked ALL-CAPS eyebrows and middle-dot meta with no content reason.
- Left accent bars on wells or rows.
- Emoji-and-gradient developer-tool pages with invented metrics.
- Raw `JSON.stringify` as default CLI output.

## Evidence

`qa-evidence/<date>-user-guide/desktop.png` and `mobile.png` with `notes.md`, captured by `browser-qa` whenever `USER_GUIDE.html` changes.
