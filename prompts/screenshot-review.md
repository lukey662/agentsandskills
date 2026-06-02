# Screenshot Review Prompt

Use after a UI is implemented and screenshots are available across desktop and mobile.

Review the screenshots against the product goal, design brief, and `STYLE_GUIDE.md`.

Check:

- First screen shows the real product, task, object, or workflow.
- Layout is usable on desktop and mobile without overlapping text or controls.
- Visual direction fits the domain and does not rely on generic AI-site gradients, card soup, vague SaaS copy, or fake metrics.
- Design tokens are visible in color, typography, spacing, radius, state color, and focus treatment.
- Loading, empty, error, disabled, success, and mobile states are represented or explicitly accounted for.
- Controls use familiar patterns: icons for repeated tools, inputs for values, toggles for booleans, tabs for views, and menus for option sets.
- Text is specific, scannable, and not padded with feature explanations.
- Accessibility risks are called out: contrast, focus, keyboard order, touch target size, labels, semantics, and motion.

Return:

1. Critical blockers.
2. High-value polish fixes.
3. Evidence that the screen avoids generic AI-site defaults.
4. Follow-up screenshots or states still required.
