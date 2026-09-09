# Screenshot Review Prompt

Use after a UI is implemented and screenshots are available across desktop and mobile.

Review the screenshots against the product goal, `DESIGN.md`, design brief, and `STYLE_GUIDE.md`.

Check:

- First screen shows the real product, task, object, or workflow.
- The selected creative direction is visible in tokens, layout, copy, imagery, density, and interaction tone.
- Layout is usable on desktop and mobile without overlapping text or controls.
- Visual direction fits the domain and does not rely on generic AI-site gradients, accent-border cards, left selection rails, glow rails, neon strokes, gradient borders, card soup, oversized glass panels, ornamental icon walls, vague SaaS copy, decorative credibility badges, filler sections, or fake metrics.
- Cards, callouts, alerts, selected rows, and status messages use radio/check + light tint, typography/weight, restrained 1px full-border surfaces, or a flat tint fill — not a `border-left` accent, inset bar, or vertical rail.
- Design tokens are visible in color, typography, spacing, radius, state color, and focus treatment.
- Loading, empty, error, disabled, success, and mobile states are represented or explicitly accounted for.
- Visual QA tier is appropriate for the risk: screenshot review, Playwright screenshots, Storybook visual tests, or visual-regression service.
- Controls use familiar patterns: icons for repeated tools, inputs for values, toggles for booleans, tabs for views, and menus for option sets.
- Text is specific, scannable, and not padded with feature explanations.
- Accessibility risks are called out: contrast, focus, keyboard order, touch target size, labels, semantics, and motion.

Return:

1. Critical blockers.
2. High-value polish fixes.
3. Evidence that the screen avoids generic AI-site defaults.
4. Evidence that the screen follows the selected creative direction.
5. Visual QA tier and baseline-review risks.
6. Follow-up screenshots or states still required.
