# Design — Kept Book

## Audience and job

One household that still cooks from memory, texts, and stained cards. They want a box everyone in the house can add to, then a book they can print.

This screen’s job (first viewport): open or join a kitchen. Not a marketing hero.

## Tokens (manila folder + grease pencil)

| Token | Hex | Use |
| --- | --- | --- |
| Field | `#e7d3a8` | Page. Manila folder. |
| Ink | `#1f160e` | Type. |
| Accent | `#6e1c28` | Primary action, fail banner ink on field. |
| Line | `#b08950` | Edges. |
| Well | `#f3e6c4` | Cards and forms. |
| Tab | `#8a2430` | Course tabs. |

Type: **Fraunces** (titles, like a church-cookbook heading) + **IBM Plex Sans** (forms). Not Inter, Geist, or Space Grotesk.

Radius: none. Shadow: none. The object is an index card in a tin, not a dashboard.

## Creative direction

Characteristic thing: the **recipe box** — tabbed cards, “from the kitchen of”, a book desk that prints. Copy names the household, not “your culinary legacy.”

Options considered:

1. Manila + wine tab (chosen). Reads as a physical box.
2. Night kitchen / brass (rejected). Looks like a restaurant site.
3. Scan-camera first (rejected). ReciScan already owns that.

## References (structure only)

- Metal recipe tins with A–Z tabs
- Comb-bound church / family reunion cookbooks
- Gelato photobook as the hardcover output

Anti-references: Mixbook collage spreads, Pinterest recipe cards, Mealie dashboards, cream `#F4F1EA` + terracotta editorial, Geist + zinc Create-Next-App chrome, three icon feature cards.

## Scorecard (this pass)

| Check | Verdict |
| --- | --- |
| First viewport names the product | Kitchen name + “Open this kitchen” |
| Characteristic object | Index cards + tabs |
| Generic AI layout | Rejected default Next.js / zinc hero |
| Contrast | Dark brown on manila; white-on-wine tabs |
| Keyboard | Labels, skip link, `:focus-visible` |

## Visual QA

Desktop and mobile of `/`, `/box` (empty and with cards), one recipe, `/book`. See `qa-evidence/`.
