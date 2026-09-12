---
name: accessibility-wcag
description: Use when the user can't tab, a screen reader misses a control, contrast fails, a modal traps focus, or you need a WCAG 2.1 AA pass. Keyboard in the running browser, not a screenshot guess.
---

# Accessibility (WCAG 2.1 AA)

Scan 2026-09-12 (structure only, no bodies copied): W3C WCAG 2.1 AA; GitHub packs that split keyboard / contrast / forms into specialist swarms. This pack keeps **one** skill. Do not install axe, Pa11y, an a11y MCP, or an 11-agent accessibility roster. Visual proof stays in `browser-qa`. Access control stays in `supabase-auth-rls` — hiding a control is not an accessibility pass and not authorization.

## Use when

Interactive UI, forms, navigation, dialogs, menus, tables, or any screen a keyboard or screen-reader user will use. Also when someone says “can't tab”, “contrast looks fine”, “add aria”, “WCAG”, or “is this accessible?”

Not a substitute for `frontend-design` (look and tokens) or `owasp-security-review` (auth). Run those as their owners; this skill is the keyboard-and-semantics pass.

## Do

1. Open the **running** changed flow. Name the route, auth state, and what the user must finish.
2. Keyboard-only: Tab, Shift+Tab, Enter, Space, and Escape. Record traps, missing focus, and controls you cannot reach.
3. Check the mapping table. Skip rows that do not apply; do not skip keyboard because “it's a mouse app.”
4. Capture desktop (~1280) and mobile (~390) for `browser-qa`. Screenshots help for contrast and target size; they do not replace step 2.
5. Return a findings table (P0 / P1 / P2) with where it showed up and whether it is **code-certain** or **inferred**.

## Checks

Map the change to a concrete control. Skip rows that do not apply.

| Area | In this pack |
| --- | --- |
| Semantics (1.3.1) | Real headings, landmarks, lists, and buttons. One `h1`. ARIA only when native HTML cannot. |
| Keyboard (2.1.1, 2.1.2, 2.4.3, 2.4.7) | Tab order matches visual order. Focus is visible. No trap except a real dialog. Escape closes overlays. |
| Contrast (1.4.3, 1.4.11) | 4.5:1 normal text, 3:1 large text and UI chrome. Do not sign off from the screenshot alone. |
| Color (1.4.1) | Color or a left-edge rail is not the only selected / error / success signal. |
| Forms (3.3.1–3.3.3) | Visible `<label htmlFor>`. Errors associated (`aria-describedby` / `aria-invalid`) and announced. |
| Name, Role, Value (4.1.2) | Custom controls expose name, role, and state. A `div` with an onClick is a finding. |
| Status (4.1.3) | Save, error, and loading results are announced (live region or a focus move). |
| Non-text (1.1.1) | `next/image` (and other images) have meaningful `alt`. Decorative images use empty `alt`. |
| Bypass (2.4.1) | Skip link or landmarks so repeating chrome is skippable. Kit HTML already has a skip link. |
| Motion | Honor `prefers-reduced-motion`. Motion is not the only signal. |
| Targets | Taps are usable on mobile. WCAG 2.1 AA does not require 2.2’s 24×24 rule; this pack still rejects unusable hits. |
| Auth vs a11y | A hidden button is not an a11y fix for unauthorized users. Enforce access in RLS / the server. |

## App Router mapping

- **Server Action forms:** every field has a label. Validation errors render in the UI, bound to the field, not only a thrown Error. Disabled submit is explained; `disabled` removes the control from the tab order — do not use it as the only “you cannot do this” hint if the user still needs to reach help text.
- **Dialogs / sheets:** labelled (`aria-labelledby` or visible title), focus moves in, Tab cycles inside, Escape closes, focus returns to the opener.
- **Menus / disclosure:** keyboard opens and closes; collapsed content is not in the tab order.
- **`next/image`:** `alt` describes the image’s job, not the filename.
- **Kit HTML (`USER_GUIDE.html`):** keep the skip link and safelight `:focus-visible` outline. Do not add `border-left` selection rails. Do not drop `lang` on `<html>`.

Field checklist: `checklists/accessibility.md`.

## Tools

Confirm in the running browser. Preferred: host IDE browser. Playwright is backup for capture, not a substitute for Tab.

Screenshots are evidence for contrast, clipping, and target size. **Keyboard must still be exercised.** Optional automated scanners (axe, Pa11y) may run *after* the keyboard pass; they are not the pass.

Visual proof: `browser-qa` (`qa-evidence/<date>-<slug>/` plus `notes.md`). Record keyboard results in `notes.md`:

```text
keyboard: tab-order pass|fail; focus-visible pass|fail; trap none|expected-modal|unexpected
contrast: measured|inferred-from-screenshot
```

`inferred-from-screenshot` is not enough to accept.

## Reject

- “Contrast looks fine in the screenshot” without a keyboard pass.
- Approving from TSX, ARIA comments, or a Storybook file without opening the running UI.
- Color or a left-edge rail as the only selected / error / success signal.
- Installing axe, Pa11y, or an accessibility MCP as the required tool.
- Copying a third-party accessibility skill body or standing up an a11y-agent swarm.
- Treating a hidden control as the accessibility fix for a user who is not allowed to act (that is `supabase-auth-rls`).
- A modal that does not restore focus, or that traps the page with no Escape.
- `aria-label` that contradicts visible text.
- Skipping keyboard because the flow is “mouse-only” or “admin-only.”
- Kit HTML: dropping the skip link or the `:focus-visible` outline.

## Done when

A **keyboard-only pass works on the changed flow in the running UI**. Tab order matches visual order. Focus is visible. Remaining gaps are named with severity and code-certain vs inferred. Visual proof is in `browser-qa` evidence. Contrast was not signed off from the screenshot alone.
