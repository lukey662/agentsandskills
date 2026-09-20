---
name: frontend-design
description: Use when the UI looks generic, to de-slop a UI, when someone says don't change the code, or when setting up design on a new repo, or building, reviewing, or auditing UI. Name the mode (setup, build, review, or detect). Setup asks what the user needs, then recommends principles before CSS.
---

# Frontend Design

Build or review a screen as if a stranger must name the product from the first viewport. Simple and specific beats decorated. This skill owns the visual fail list; `deslop` owns words.

## Use when

Any user-facing layout, component, or HTML page, or “it looks generic.” Also required on a new repo or first UI job when `DESIGN.md` is missing or TBD: run `setup` before CSS.

## Mode

Name the mode before CSS. Default is `setup` when `DESIGN.md` is missing or TBD, `review` when the UI exists, `build` when it does not.

| Mode | Do |
| --- | --- |
| `setup` | New repo or missing/TBD `DESIGN.md`. Scan, then ask what they need. Recommend from the answers. Record principles and tokens only after that. No CSS unless they then ask to build. |
| `build` | Derive the direction (below), write tokens and one layout idea, then CSS. Screenshot after. |
| `review` | Screenshot first. Findings table, then fix P0s. |
| `detect` | Audit only. No edits. Use when asked to scan, flag, de-slop, or not change code. Not done while the first viewport is a slogan hero over equal cards over a numbered stack, while “screenshots” are styled divs, while tracked ALL-CAPS eyebrows or middle-dot meta appear without a content reason, or while swap / squint / signature are unnamed. A clean fail-list pass is necessary, not sufficient. |

## Surface

Pick one profile and stay at that depth. Setup names a likely surface after the scan.

| Profile | Depth |
| --- | --- |
| `landing` / standalone artifact | Full direction. Spend boldness once. |
| `app-chrome` | Quiet and dense. Loading, empty, error, and success before decoration. |
| `inside-design-system` | Surgical. Keep tokens and primitives. Swap tells; do not invent a second brand. |

## Setup (new repo)

The job is asking good questions so you know what they need. Docs and tokens are the record of that conversation, not a template dump.

**Scan first.** Read enough to name: product and one-line job (README, `package.json`); router (`app/` vs `pages/`); styling (Tailwind, CSS modules, CSS variables, shadcn/ui, Radix); fonts; the first useful screens; existing tokens in `globals.css`, the Tailwind theme, or a mature `STYLE_GUIDE.md`. Report that in a short list. If a real visual system already exists, stay `inside-design-system` and offer to record it.

**Ask what they need.** One message, in their language (the work, the person), not ours (hex, motion budget). Skip anything the scan settled. Attach your default to each question.

1. What are we setting up, and what do you need from this pass: principles, a style guide, a first-screen direction, or all of it?
2. Who has to succeed, and what are they trying to finish?
3. On the first useful screen, what must they be able to do?
4. What is already decided (brand, components, legal, accessibility), and what must it *not* look like?
5. When this works, what is in front of them? When it fails, what did we get wrong?

If an answer is vague (“make it modern”), ask once: what should a stranger see, and what would be the wrong product?

**Recommend, then pause.** The need in one sentence; four to six principles that serve it (default bar: first screen = the work; one field, one ink, one accent, one line; states before decoration; WCAG 2.1 AA contrast; match the stack; no left-edge rails); a direction only if they asked, derived as below; anti-references in their words. Non-interactive or told to go: state assumptions and continue.

**Record, no CSS yet.** Only the files this pass called for. Default is a **short** product `DESIGN.md`:

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
## Anti-references
```

`STYLE_GUIDE.md`: if missing, add a short Frontend (product) section (states, stack, anti-slop; tokens stay in `DESIGN.md`). If a mature guide exists, append; never overwrite. Then stop. Setup needs no screenshots when nothing can render.

## Derive the direction

Tokens come from the subject, not a theme pack. A toy store and a ledger cannot share a palette. Before CSS, write these five lines:

1. **Object.** The one real thing this product is about: a material, a place, a time of day, a document, a tool. Name it.
2. **Field, ink, accent.** Pull them from that object and write the hex. Field is the page (~80%, flat). Ink is body text (~15%, ≥ 4.5:1). Accent is one action or one required state (~5%). Add one line/well color one step off the field.
3. **Type.** One family, or two that are obviously different (display vs mono), with a reason tied to the object. Inter + system sans is not a pairing; Space Grotesk + slate and last week’s “tasteful” swap are defaults.
4. **Structure.** One idea for the first viewport: the table is the hero, one big number, a single narrow column, an asymmetric split, the form is the page. Not a slogan over atmosphere.
5. **Removed.** Name one accessory you took out.

Then check the plan is not this year’s default (cream editorial, neon on black as decoration, SaaS card kit, newsprint desk, mesh gradient). If it is and the brief did not ask, change one axis: field, accent, or structure.

Two worked examples. These are examples of the method, not a menu to pick from.

- *Ledger for a two-person bookkeeping firm.* Object: a green-tinted paper ledger under a desk lamp. Field `#f3f2ec`, ink `#1f2a1f`, accent `#8a1c1c` for overdue only, line `#d8d6cc`. Type: a humanist sans for labels and a tabular mono for amounts, because the amounts are the content. Structure: the running balance table is the first viewport; the app name is small. Removed: the welcome card.
- *Plant nursery shop.* Object: terracotta pots on wet slate. Field `#1c1a17`, ink `#f2ede4`, accent `#d9a441` for add-to-order, line `#33302a`. Type: one rounded grotesque, because the shop is friendly and the pots are round. Structure: a photo-first grid where the plant name and price sit on the image, no hero. Removed: the tagline.

## Color

One field, one ink, one accent, one line. That is enough. Do not spread six mid-chroma colors evenly, use purple→blue or untouched shadcn `zinc` as the identity, or recolor as decoration. Prefer CSS variables. Self-contained HTML: no Google Fonts, no CDN CSS.

## Type and rhythm

- Line length under 80 characters. Tight display tracking on large sans. Do not italicize or recolor one word of a headline.
- No tracked ALL-CAPS eyebrows, middle-dot meta (`A · B · C`), or `WORD — fragment` labels unless the content needs them. Numbered tickets only when the content is a real sequence.
- Three or four type sizes, not eight. One spacing base (4 or 8px) and a scale you can name. Density follows surface: `app-chrome` is tight, `landing` breathes once.

## Layout and motion

- First viewport is the characteristic thing: a command, a table, a form, a named owner.
- Mobile (~390): the primary CTA still fits above the fold.
- Hierarchy from size, weight, and space, not from cards.
- Do not mark selection or severity with a left edge stroke. Use radio or check + light tint, or weight and space. One accent for the primary CTA, not a row edge.
- Motion: none, or one moment that answers a click. Respect `prefers-reduced-motion`.

## Process (build, review, detect)

1. Name mode, surface, product, user, and this screen’s job. Read `DESIGN.md` and existing tokens. If the brief names a look, follow it.
2. Build: derive the direction, write tokens and one layout idea, then CSS. Review and detect: skip to screenshots.
3. Screenshot desktop (~1280) and mobile (~390). Fix from pixels. Would a stranger believe a person chose this?
4. If you cannot render, mark visual findings **inferred**. Code-level tells (literal `from-indigo-500`, Inter, untouched shadcn zinc) stay **code-certain**.
5. Loading, empty, error, disabled, and success exist where the flow has them; color is not the only state signal. Keyboard, labels, and contrast are `accessibility-wcag`. Public words go to Copy.

## Fail list

Flat AI/SaaS chrome. One is a smell; two or more is a reject; a left stroke on a pick-list row or status well is already a fail.

- Purple-to-blue or indigo gradient hero, or gradient-clipped headline type
- Inter / Roboto / default shadcn zinc as the whole identity
- Centered slogan + two pills + three equal icon cards
- `rounded-2xl` + `shadow-lg` + blur on every surface
- Cream `#F4F1EA` + terracotta as the unrequested editorial default
- Acid green or neon vermilion on near-black as decoration
- Lucide Sparkles / Zap as the product metaphor
- Fake dashboard metrics or DiceBear avatars
- Left accent bars or `border-left` strokes on selected rows, list items, cards, or success/error/warn wells
- Thick one-sided colored borders, glow rails, or gradient borders as the main state cue
- Glass navbar, four-column empty footer, broadsheet hairlines over dense newsprint columns

Acceptance fixture: a pick-list row and a “verified” well pass with zero left border accents. Status wells use a flat tint fill.

## Review output

For `review` and `detect`, a table. Do not approve from a vibe.

| Severity | Finding | Where | Confidence | Kind |
| --- | --- | --- | --- | --- |
| P0 | Layperson would call it AI-made, or it blocks use | screenshot or file | code-certain / inferred | clear problem / judgment call |
| P1 | A designer would notice | screenshot or file | code-certain / inferred | clear problem / judgment call |
| P2 | Craft gap | screenshot or file | code-certain / inferred | clear problem / judgment call |

Name the three self-tests: **Swap** (would another product’s first screen drop in unchanged?), **Squint** (does hierarchy read with the type blurred?), **Signature** (would a stranger name this product from the first viewport?).

## Reject

- Approving UI from TSX or HTML alone.
- CSS on a new product before `setup`, or a `DESIGN.md` written from a template without asking what this setup is for.
- Quizzing them on hex, fonts, or motion before you know the need.
- Overwriting a mature `STYLE_GUIDE.md`, or a full rebuild inside an existing design system when a surgical pass would do.
- Installing a design MCP, canvas CLI, or slash-command pack to “do design.”
- Detect-mode edits, or detect called done because the fail list is clean.
- Inventing atmosphere (mesh gradients, noise, glow) as the default bold move.
- “We’ll make it distinctive later.”

## Tools

`browser` + `screenshot` + `image-review` first for `build`, `review`, and `detect`. Setup may skip capture when nothing can render yet.

## Done when

**Setup:** architecture reported, need questions asked (or assumptions stated), recommendations match the need, the files this pass called for were written, no unsolicited CSS.

**Build / review / detect:** mode and surface named. Desktop and mobile images read (or detect listed what could not render). Direction lines and tokens are in the change or in `DESIGN.md`. No fail-list P0 remains unless named as an accepted exception. Review and detect named swap / squint / signature. Detect ends with the table and no edits.
