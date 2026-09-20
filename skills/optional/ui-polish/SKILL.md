---
name: ui-polish
description: Optional. Use for a focused UI polish loop after frontend-design — hierarchy, spacing, states, mobile. Not a second design system. If DESIGN.md is missing, Design setup first. Desktop and mobile. Not on default init.
---

# UI Polish (optional)

This skill is **surgical**. Direction lives in `frontend-design`. Screenshots live in `browser-qa`. Keyboard pass lives in `accessibility-wcag`. It is not installed by `init`.

Add with `agent-kit add skill ui-polish`.

## Use when

A focused hierarchy / spacing / states / mobile pass **after** the main `frontend-design` pass. “Tighten this screen”, “empty state looks thin”, “mobile wrap is wrong” when tokens already exist.

Not a substitute for `frontend-design` `setup` / `build` / `review`.

## Do

1. If `DESIGN.md` is missing or TBD, stop. Send Design to `setup` first. Do not invent a second brand.
2. Name that `frontend-design` already ran (or is running in `review`). This pass stays `inside-design-system`.
3. Change hierarchy, spacing, states (loading / empty / error / success), and mobile fit (`min-height: 100dvh` over `100vh`, tabular numbers on data and financial columns). Do not change product scope.
4. Capture `browser-qa` desktop (~1280) and mobile (~390). One viewport is not enough.
5. Keep kit charcoal tokens off product apps.

## Checks

| Area | Pass |
| --- | --- |
| Order | After `frontend-design`, not instead. |
| Setup | `DESIGN.md` exists, or Design `setup` ran. |
| Scope | Surgical. Same tokens and primitives. |
| Viewports | Desktop and mobile `browser-qa` paths. |

## Reject

- Using polish as a second design system (new palette, new type, new chrome).
- Skipping `frontend-design` or Design `setup` because “it’s just spacing.”
- One viewport only (desktop-only or mobile-only).
- Treating this skill as part of default `init`.
- Pasting kit charcoal (`#10100e`) onto a product screen.

## Done when

`frontend-design` already named the direction (or setup completed). Hierarchy, spacing, states, and mobile were tightened inside the existing system. Desktop and mobile `browser-qa` paths exist.
