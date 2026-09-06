---
name: frontend-design
description: Use when building or reviewing user-facing UI. Prefer task-first screens. Reject generic AI-looking gradients, card soup, and fake metrics.
---

# Frontend Design

## Use when

Screens, components, layout, visual design, or anti-generic UI review. Required for any HTML page this kit ships, including `USER_GUIDE.html`.

## Product surfaces

This kit is a specialist pack, not a SaaS dashboard. HTML must look like an **assignment desk + contact sheet**: job tickets, named agents, pasteable prompts, and two required photo frames (desktop / mobile).

Do not ship a marketing landing page.

## Tokens for kit HTML

| Token | Value | Why |
| --- | --- | --- |
| Paper | `#10100e` | Charcoal desk, not dingy cream or SaaS white |
| Ink | `#eceae4` | Warm type on dark |
| Frame | `#070706` | Contact-sheet well |
| Safelight | `#ff5a2a` | Required / fail-closed only |
| Pass | `#5ea37a` | Verdicts, not decoration |
| Type display | `"Helvetica Neue", Helvetica, Arial, ui-sans-serif` | Tight grotesque, not Palatino |
| Type mono | `ui-monospace, Menlo, Consolas` | Commands and prompts |
| Radius | `2px` | Tickets, not pills |
| Shadow | none | Borders only |
| Motion | none except `:focus-visible` |

Self-contained HTML. No Google Fonts, no CDN CSS, no stock photos, no fake avatars.

## First screen

The first viewport must show:

1. Who to ask (named agents, not “your AI copilot”).
2. The fail-closed QA rule in plain language.
3. A pasteable Planner prompt or `init` command.

If the first screen is a slogan over a gradient, reject it.

On a 390-wide viewport the first screen must still show the primary CTA (init command or Planner prompt). Do not spend the whole first mobile screen on decorative frames.

## Layout rules

- One primary column, max ~68rem. Navigation is in-page anchors, not a product app shell.
- Prompts live in **tickets**: label, body, copy control. The copy control is a button with a name, not an icon-only control.
- Agent roster is a table or definition list of jobs, not six equal cards with icons.
- QA evidence is two framed shots labeled `DESKTOP ~1280` and `MOBILE ~390`. One frame is a fail.
- IDE recipes are sections, not a logo wall.

## Checks

- First screen shows the real product, task, or workflow.
- Hierarchy, density, and primary action are obvious.
- Loading, empty, error, disabled, success, and mobile states exist where relevant.
- Contrast, focus, labels, and tap targets meet WCAG 2.1 AA.
- Reject purple-blue gradient heroes, vague SaaS copy, fake dashboards, glass-card soup, glow rails, Inter-on-white card grids, and emoji icon walls.

## Tools

Critique from `browser` + `screenshot` + `image-review` first. Do not approve UI from HTML/TSX alone.

## Done when

Desktop and mobile screenshots were read. Blocker detector findings are fixed. A stranger can name the product from the first screen.
