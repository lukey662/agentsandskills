---
name: frontend-design
description: Use when setting up design on a new repo, or building, reviewing, or auditing UI. Name the mode (setup, build, review, or detect). Setup asks what the user needs, then recommends principles before CSS.
---

# Frontend Design

Build or review a screen as if a stranger must name the product from the first viewport. Simple and specific beats decorated.

Scan 2026-09-12 (structure only, no bodies copied): Anthropic `frontend-design` (2026-06), addyosmani `frontend-ui-engineering`, `educlopez/ui-craft`, `funboy322/avoid-ai-design`, `superdesigndev/superdesign-skill`, `google-labs-code/design.md`. Do not install their CLIs, canvases, MCP servers, or slash-command catalogs.

## Use when

Any user-facing layout, component, HTML page, or “it looks generic.” Required for `USER_GUIDE.html` and for app screens. Also required on a **new repo** or first UI job when `DESIGN.md` is missing or TBD — run `setup` before CSS.

## Mode

Name the mode before CSS. Default is `setup` when `DESIGN.md` is missing or TBD, `review` when the UI already exists, `build` when it does not.

| Mode | Do |
| --- | --- |
| `setup` | New repo or missing/TBD `DESIGN.md`. Scan, then ask what they need. Recommend from the answers. Record principles and style-guide rules only after that. No CSS unless they then ask to build. |
| `build` | Write tokens and one layout idea, then CSS. Screenshot after. |
| `review` | Screenshot first. Findings table, then fix P0s. |
| `detect` | Audit only. No edits. Use when asked to scan, flag, or not change code. |

## Surface

Pick one profile and stay at that depth. Setup names a likely surface after the scan; it does not require one before questions.

| Profile | Depth |
| --- | --- |
| `landing` / standalone artifact | Full direction. Spend boldness once. |
| `app-chrome` | Quiet and dense. Loading, empty, error, and success before decoration. |
| `inside-design-system` | Surgical. Keep tokens and primitives. Swap tells; do not invent a second brand. |
| `kit-html` | This pack’s charcoal assignment desk. Not a SaaS landing page. |

## Setup (new repo)

Run this when any of these is true: `DESIGN.md` is missing; it is still TBD / `[product]` / “your product”; the user asked to set up design, a style guide, or principles; this is first UI work after `init`.

The job is **asking good questions so you know what they need**. Docs and tokens are the record of that conversation. Do **not** dump a 17-doc council template. Do **not** paste this kit’s charcoal desk onto the product. `init` does not install `DESIGN.md`.

### 1. Scan first — do not re-ask what you can read

Read enough to name:

- Product name and one-line job from README / `package.json`
- Router: App Router (`app/`) vs Pages (`pages/`)
- Styling: Tailwind, CSS modules, CSS variables, shadcn/ui, Radix, other component library
- Fonts: `next/font`, self-hosted, or unset
- Auth or first useful screens (login, invite, empty app)
- Existing tokens in `globals.css`, Tailwind theme, or a mature `STYLE_GUIDE.md`

Report the architecture in a short list, then ask. If a real visual system already exists, stay surgical (`inside-design-system`) and offer to record it rather than invent a second brand.

### 2. Ask what they need

Setup is an interview. Use the scan as context, not as a quiz.

**How to ask**

- One message, in their language (the work, the person), not ours (hex, motion budget, “three personality traits”).
- Skip anything they already answered or the scan already settled.
- If an answer is vague (“make it modern,” “make it pop”), ask one follow-up: *what should a stranger see, and what would be the wrong product?*
- Do not ask them to pick a hex, a font, or a motion budget until you know the need.
- Public words still belong to Copy.

**Need questions** (ask these; drop any they already covered)

1. What are we setting up, and what do you need from this pass — principles, a style guide, a first-screen direction, or all of it?
2. Who has to succeed, and what are they trying to finish?
3. On the first useful screen, what must they be able to do?
4. What is already decided — brand, components, legal, accessibility — and what must it *not* look like?
5. When this works, what is in front of them? When it fails, what did we get wrong?

Listen. Follow up once if needed. Then recommend.

### 3. Recommend from the answers, then pause

Best practices are tailored, not a canned list. Always include:

- The **need** you heard, in one sentence.
- **Principles (4–6)** that serve that need. Default bar unless they overrode it: first screen = the work; one field, one ink, one accent, one line; states before decoration; WCAG 2.1 AA contrast (4.5:1 text); match the existing stack; no left-edge selection rails.
- **Visual direction** only if they asked for one: a token recipe from Color below that fits *this* domain, or a surgical pass if shadcn/existing tokens already exist. Downstream apps never copy kit charcoal `#10100e`. Two one-sentence options and a pick.
- **Anti-references** in their words, plus any 2026 defaults that would make this the wrong product.
- What you will write vs what can wait.

Pause for confirm. If the session is non-interactive, or the user said to proceed, **state assumptions** and continue.

### 4. Record what they need — no CSS yet

Write only the files this pass called for. Default, when they want a style guide and principles, is a **short** product `DESIGN.md` (not the 160-line kit template):

```markdown
# DESIGN.md

## Need
## Product
## Who it is for
## First-screen job
## Architecture found
## Principles
## Tokens
| Token | Value | Use |
| --- | --- | --- |
## Anti-references
```

`STYLE_GUIDE.md`: if missing, write a short **Frontend (product)** section (tokens live in `DESIGN.md`, states, stack, anti-slop). If a mature guide already exists, **append** that section — do not overwrite.

Then stop. If they asked to build a screen, switch to `build`. Setup does **not** require screenshots when nothing can render yet. Do not drop `requiredTools` on the Design agent.

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

If mode is `setup`, follow **Setup** instead of this list.

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
- Focus visible, tap targets usable. Keyboard order matches visual order. Keyboard, labels, and contrast fail-closed live in `accessibility-wcag` — a pretty screenshot is not a keyboard pass.
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
- Starting CSS on a new product before `setup` when `DESIGN.md` is missing or TBD.
- Quizzing them on hex, fonts, or motion before you know what they need.
- Writing `DESIGN.md` from a template without asking what this setup is for.
- Overwriting a mature `STYLE_GUIDE.md`.
- Pasting this kit’s charcoal desk onto a downstream product.
- Installing a design MCP, canvas CLI, or slash-command pack to “do design.”
- Detect-mode edits.
- A full rebuild inside an existing design system when a surgical pass would do.
- Mesh gradients, noise overlays, and decorative atmosphere as the default “bold” move (older `frontend-design` forks). The brief can ask; the model must not invent it.
- “We’ll make it distinctive later.” Use the product’s tokens now.

## Tools

`browser` + `screenshot` + `image-review` first for `build`, `review`, and `detect`. Do not approve UI from TSX or HTML alone. Setup may skip capture when nothing can render yet.

## Done when

**Setup:** architecture was reported, need questions were asked (and followed up if vague) or assumptions stated, recommendations match what they need, and the files this pass called for were written. No unsolicited CSS. Screenshots are not required if nothing can render.

**Build / review / detect:** Mode and surface were named. Desktop and mobile images were read (or detect listed what could not be rendered). Token list is in the change or in `DESIGN.md`. No P0 slop from `deslop` remains unless Design names it as an accepted exception. Detect ends with the table and no file edits.
