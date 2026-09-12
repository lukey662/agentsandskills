---
name: frontend-design
description: Use when building, reviewing, or auditing user-facing UI. Name the mode (build, review, or detect), commit 4–6 tokens, match the existing stack, and reject default AI layouts.
---

# Frontend Design

Build or review a screen as if a stranger must name the product from the first viewport. Simple and specific beats decorated.

Scan 2026-09-12 (structure only, no bodies copied): Anthropic `frontend-design` (2026-06), addyosmani `frontend-ui-engineering`, `educlopez/ui-craft`, `funboy322/avoid-ai-design`, `superdesigndev/superdesign-skill`, `google-labs-code/design.md`. Do not install their CLIs, canvases, MCP servers, or slash-command catalogs.

## Use when

Any user-facing layout, component, HTML page, or “it looks generic.” Required for `USER_GUIDE.html` and for app screens.

## Mode

Name the mode before CSS. Default is `review` when the UI already exists, `build` when it does not.

| Mode | Do |
| --- | --- |
| `build` | Write tokens and one layout idea, then CSS. Screenshot after. |
| `review` | Screenshot first. Findings table, then fix P0s. |
| `detect` | Audit only. No edits. Use when asked to scan, flag, or not change code. |

## Surface

Pick one profile and stay at that depth.

| Profile | Depth |
| --- | --- |
| `landing` / standalone artifact | Full direction. Spend boldness once. |
| `app-chrome` | Quiet and dense. Loading, empty, error, and success before decoration. |
| `inside-design-system` | Surgical. Keep tokens and primitives. Swap tells; do not invent a second brand. |
| `kit-html` | This pack’s charcoal assignment desk. Not a SaaS landing page. |

## Ground in the subject

Name the product, the user, and this screen’s job before CSS. Read `DESIGN.md` when it exists — tokens there are normative; prose is how to apply them. Tokens come from the domain (materials, time of day, one real object) — not from a theme pack. A toy store and a ledger cannot share a palette.

Match the project’s stack (CSS variables, Tailwind, existing component library). Do not mix a second styling approach.

**This kit’s HTML** (`USER_GUIDE.html`): charcoal assignment desk.

| Token | Value |
| --- | --- |
| Paper | `#10100e` |
| Ink | `#eceae4` |
| Frame | `#070706` |
| Line | `#2a2823` |
| Safelight | `#ff5a2a` (required / fail only) |
| Pass | `#5ea37a` |
| Type | `"Helvetica Neue", Helvetica, Arial, ui-sans-serif` |
| Mono | `ui-monospace, Menlo, Consolas` |
| Radius | `2px` |
| Shadow | none |

**Downstream Next.js apps:** do not paste the kit desk onto a product. Extract or invent **4–6 hex tokens** from *this* product’s job. Write them before CSS. Inside an existing design system, stay surgical — swap tells, do not invent a second brand.

## Color — simple schemes that hold up

One field, one ink, one accent, one line. That is enough.

1. **Dominant field** (~80%): the page. Flat. Not a gradient, not a mesh.
2. **Ink** (~15%): body text. Contrast ≥ 4.5:1 (3:1 for large type).
3. **Accent** (~5%): one action or one required state. A few placements in the first viewport (primary CTA, one required/fail). Recolor-as-decoration fails.
4. **Line / well**: borders and code wells, one step off the field.

Recipes (pick one that fits the product, then stop):

| Scheme | Field | Ink | Accent | Use when |
| --- | --- | --- | --- | --- |
| Charcoal desk | `#10100e` | `#eceae4` | `#ff5a2a` | Tools, manuals, this kit |
| Paper + ink | `#f4f4f1` | `#171717` | `#0b57d0` | Documents, settings, calm apps |
| Night + signal | `#0e1116` | `#e6edf3` | `#3fb950` | Ops, status, pass/fail |
| Warm shop | `#1c1916` | `#f3ece3` | `#e8a317` | Craft, commerce with real goods |

Do not:

- Spread six mid-chroma colors evenly.
- Use purple→blue, default `blue-600`, or untouched shadcn `zinc` as the identity.
- Use cream `#F4F1EA` + terracotta (the 2026 editorial default) unless the brief asks.
- Use acid green or neon vermilion on near-black as decoration.
- Treat Space Grotesk + slate, or any “tasteful” swap you used last week, as a new idea.

Prefer CSS variables. Self-contained kit HTML: no Google Fonts, no CDN CSS.

## Type

One family, or two that are obviously different (display vs mono). Inter + system sans is not a pairing. Roboto, Space Grotesk, and “the last distinctive font you used” are second-order defaults.

- Line length < 80 characters.
- Tight display tracking on large sans. Do not italicize or recolor one word of a headline.
- No tracked-out ALL-CAPS eyebrows, middle-dot meta (`A · B · C`), or `WORD — fragment` labels unless the content needs them.
- Numbered tickets only when the content is a real sequence.

## Layout

- First viewport = the characteristic thing: command, table, form, named owner. Not a slogan over atmosphere.
- Mobile (~390): the primary CTA still fits above the fold.
- Hierarchy from size, weight, and space — not from cards.
- Landing and marketing pages take a full direction. App chrome (settings, tables) stays quiet and dense.
- Do not mark selection or severity with a left edge stroke. That pattern reads as default AI/SaaS chrome even on flat full-bleed sheets.
- Prefer: radio + tint, check + tint, or typography/weight. Keep one accent for the primary CTA, not as a row edge.
- Reject: centered hero + two pills + three icon cards; glass navbar; four-column empty footer; fake metrics; broadsheet hairlines + dense newsprint columns (that look is itself a 2026 default); left selection rails; callouts whose only cue is a thick left border.

## Motion

None, or one moment that answers a click. Fade-and-slide on every section is generated. Respect `prefers-reduced-motion`.

## Process

1. Name the mode, the surface profile, the product, the user, and the job of this screen.
2. Read `DESIGN.md` and existing tokens if they exist. If the brief names a look, follow it — including when it asks for a 2026 default.
3. Write the 4–6 tokens and one-sentence layout idea (build), or skip to screenshots (review/detect).
4. Check the plan is not a 2026 default (cream editorial, neon-on-black decoration, SaaS card kit, newsprint desk, last week’s “tasteful” swap). If it is and the brief did not ask, change one axis: field, accent, or structure.
5. Build or rewrite at the profile’s depth. Spend boldness once. Remove one accessory.
6. Screenshot desktop (~1280) and mobile (~390). Fix from pixels. Ask: would a stranger believe a person chose this?
7. If you cannot render, mark visual findings **inferred** and say so. Code-level tells (literal `from-indigo-500`, Inter, untouched shadcn zinc) stay **code-certain**.

## Checks

- A stranger can name the product from the first screen.
- Loading, empty, error, disabled, success exist where the flow has them. Color is not the only state signal.
- Focus visible, tap targets usable. Keyboard order matches visual order.
- Copy on the screen is real. If words are public-facing, Copy runs `deslop` last.

## Review output

For `review` and `detect`, use a table. Do not approve from a vibe.

| Severity | Finding | Where | Confidence |
| --- | --- | --- | --- |
| P0 | Layperson would call it AI-made, or it blocks use | screenshot or file | code-certain / inferred |
| P1 | A designer would notice | screenshot or file | code-certain / inferred |
| P2 | Craft gap | screenshot or file | code-certain / inferred |

P0 list lives in `deslop`. A clean catalog pass is necessary but not enough: the result must still look chosen for this product.

## Reject

- Approving UI from TSX or HTML alone.
- Pasting this kit’s charcoal desk onto a downstream product.
- Installing a design MCP, canvas CLI, or slash-command pack to “do design.”
- Detect-mode edits.
- A full rebuild inside an existing design system when a surgical pass would do.
- Mesh gradients, noise overlays, and decorative atmosphere as the default “bold” move (older `frontend-design` forks). The brief can ask; the model must not invent it.
- “We’ll make it distinctive later.” Use the product’s tokens now.

## Tools

`browser` + `screenshot` + `image-review` first. Do not approve UI from TSX or HTML alone.

## Done when

Mode and surface were named. Desktop and mobile images were read (or detect listed what could not be rendered). Token list is in the change or in `DESIGN.md`. No P0 slop from `deslop` remains unless Design names it as an accepted exception. Detect ends with the table and no file edits.
