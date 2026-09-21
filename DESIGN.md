# DESIGN.md

Design contract for this repo's own surfaces. Downstream products write their own `DESIGN.md` through Design `setup`; nothing here is pasted onto an app.

## Need

An engineer opens the guide, sees who to ask and the one rule that cannot be skipped, and says the change. Nothing sells; everything assigns.

## Product

A CLI plus installable markdown. Surfaces: `USER_GUIDE.html` (the one designed page), CLI output, `README.md`.

## Who it is for

Engineers who already have an IDE and an npm project. They read terminals and GitHub all day. They do not need convincing; they need the assignment.

## First-screen job

`USER_GUIDE.html` first viewport: the init command, the fail-closed screenshot sentence, and “say the change,” with the specialist index beside it on desktop. Not a slogan, not feature cards, not fake QA frames.

## Architecture found

Self-contained HTML (no Google Fonts, no CDN CSS). System sans stack. `data-view="user-guide"`, a skip link, accent `:focus-visible` outline, `lang` on `<html>`. Desktop is a sticky index plus the guide. Mobile is a horizontal jump bar plus stacked panels. CLI prints human text by default with `--json` behind a flag; colour degrades to monochrome when not a TTY or `NO_COLOR` is set.

## Direction

Reading this as: an engineer assigning work on a standalone field guide, with a dense register.

- **Object.** A night operations board: specialist pins on a slate wall, the init command as the one plate.
- **Field, ink, accent.** Field `#12161d`, ink `#e8eef6`, accent `#f0c36a` for the fail-closed rule and focus only, line `#5c6b80`.
- **Type.** The required system sans for the manual, mono for commands, because the command is the object.
- **Structure.** Sticky specialist index on the left, the assignment on the right. The first viewport is the init plate.
- **Removed.** The monochrome single column.

## Principles

1. First screen is the work: the init command and the fail-closed rule, beside the specialist index.
2. Information architecture chunking: use clean cards, segmented navigation, and surface depth to eliminate cognitive fatigue on content-dense pages.
3. One field, readable ink, one primary accent for actions, and purposeful semantic color badges for specialists and statuses.
4. Sections are bordered panels with subtle depth and comfortable padding so the guide scans. No unmotivated gradients, floating blur, or left accent bars.
5. States before decoration: pass / reject wells are a flat tint plus a word.
6. Motion: none, except anchor scrolling, which turns off under `prefers-reduced-motion`.
7. WCAG 2.1 AA: 4.5:1 text, 3:1 UI chrome, visible focus, skip link, keyboard order matches visual order.

## Tokens

Object: a night operations board on slate.

| Token | Value | Use |
| --- | --- | --- |
| Field | `#12161d` | Page |
| Panel | `#181e28` | Section panels |
| Well | `#10151c` | Command blocks, mast |
| Ink | `#e8eef6` | Body text |
| Muted | `#a9b6c6` | Secondary text |
| Line | `#5c6b80` | 1px borders |
| Accent | `#f0c36a` | Fail-closed rule and focus outline |
| Accent well | `#2c2218` | Required / reject fill |
| Pass | `#b7f0d0` | Accept label |
| Pass well | `#143028` | Accept fill |
| Planner | `#ddd6fe` on `#2a2340` | Planner badge |
| App engineer | `#bfdbfe` on `#1a2940` | App engineer badge |
| Security | `#fde68a` on `#332a16` | Security badge |
| Design | `#fbcfe8` on `#3a2034` | Design badge |
| QA | `#a7f3d0` on `#143028` | QA badge |
| Copy | `#bae6fd` on `#142c3d` | Copy badge |
| IDE tag | `#d7e2ef` on `#243044` | Host tags |
| Type | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | Body and headings |
| Mono | `ui-monospace, Menlo, Consolas` | Commands, paths, payloads |
| Radius | `8px` panels, `6px` controls, `4px` badges | |
| Space | `8px` | Spacing base |
| Shadow | none | |

CLI: ANSI semantic colours only (green pass, yellow warn, red fail, cyan headings, dim remediation), level word always printed so colour is never the only signal.

## Anti-references

- Slogan hero over equal feature cards over a numbered ticket stack.
- “Screenshots” that are styled divs.
- Tracked ALL-CAPS eyebrows and middle-dot meta with no content reason.
- Left accent bars on wells or rows.
- A monochrome wall of text with no index and no role distinction.
- Six saturated colors used as the page background, hero, or gradient.
- Emoji-and-gradient developer-tool pages with invented metrics.
- Raw `JSON.stringify` as default CLI output.

## Evidence

`qa-evidence/<date>-user-guide/desktop.png` and `mobile.png` with `notes.md`, captured by `browser-qa` whenever `USER_GUIDE.html` changes.
