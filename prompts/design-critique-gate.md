# Design Critique Gate Prompt

Use after creative direction is chosen and before accepting implementation.

Inputs:

- `DESIGN.md`
- Selected creative direction
- Reference set and anti-references
- Desktop and mobile screenshots or preview links
- Primary workflow and real content/data examples
- Accessibility and visual QA evidence
- Frontend product-quality scorecard, if already drafted

Return:

- Reference-set summary: what each reference teaches and what must not be copied.
- Anti-reference summary: patterns, palettes, layouts, copy, or interaction choices to avoid.
- First-screen critique: whether the actual product, object, task, workflow, or content is immediately visible.
- Distinctiveness verdict: `weak`, `adequate`, or `strong`.
- Product-quality scorecard: user/task fit, content specificity, visual identity, information architecture, component states, accessibility and interaction, source safety, and total score.
- AI-slop risks: generic gradients, vague SaaS copy, card soup, fake metrics, stock-like imagery, one-note palette, or placeholder content.
- UX risks: unclear primary action, weak information hierarchy, poor density, missing states, or mobile compromise.
- Accessibility risks: semantic structure, keyboard path, focus, contrast, motion, labels, and error feedback.
- Required changes before acceptance.
- Evidence still missing before release.

Reject the UI if it could be swapped into another product in the same category without changing the content.
