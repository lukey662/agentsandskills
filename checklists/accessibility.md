# Accessibility Checklist

Use with `skills/accessibility-wcag/SKILL.md`. Confirm in the running browser. A screenshot is not a keyboard pass.

- Semantic HTML first; ARIA only when native HTML cannot.
- Keyboard-only pass on the changed flow: Tab, Shift+Tab, Enter, Space, Escape.
- Tab order matches visual order; focus is visible; no unexpected trap.
- Contrast meets WCAG 2.1 AA (4.5:1 text, 3:1 large text and UI chrome). Do not sign off from the screenshot alone.
- Forms have visible labels (`htmlFor`) and associated, announced errors.
- Custom controls expose name, role, and state.
- Images have meaningful `alt` (or empty `alt` if decorative).
- Color or a left-edge rail is not the only selected / error / success signal.
- Content does not rely only on motion; honor `prefers-reduced-motion`.
- Dialogs move focus in, restore it, and close on Escape.
- Tap targets are usable on mobile.
- Loading, empty, error, and success exist where the flow has them.
- Remaining gaps are named with severity and code-certain vs inferred in `qa-evidence/.../notes.md`.
