# Reference-Led Design Critique Skill

## Use When

Reviewing or designing a user-facing screen, component system, marketing surface, dashboard, tool, onboarding flow, marketplace, content page, ecommerce flow, portfolio, venue page, community surface, education product, or AI workflow UI where visual quality and product specificity matter.

## Goal

Prevent generic AI-looking UI by grounding design decisions in a small reference set, explicit anti-references, product content, accessibility, and a written critique verdict before implementation is accepted.

## Required Inputs

- `DESIGN.md` brand/content inputs and selected creative direction.
- 3-5 category references to learn from without copying.
- 2-3 anti-references that show what the product must not look like.
- Real content, assets, data examples, and workflow constraints.
- Screenshots or preview links for desktop and mobile when implementation exists.

## Critique Workflow

1. Identify what each reference teaches: density, hierarchy, navigation, content treatment, typography, imagery, motion, or interaction behavior.
2. State what must not be copied: brand marks, layouts, proprietary components, exact copy, visual signatures, or protected assets.
3. Compare the proposed UI against the chosen creative direction and product content.
4. Score distinctiveness as `weak`, `adequate`, or `strong`.
5. Apply the frontend product-quality scorecard for user/task fit, content specificity, visual identity, IA, states, accessibility, and source safety.
6. Reject the work if the first screen could fit any generic product in the same category.
7. Require the smallest useful visual QA evidence for the risk: screenshot review, Playwright screenshots, Storybook states, visual-regression baseline, or equivalent.

## Reject By Default

- References used as permission to copy a brand, layout, or source design.
- One-reference design direction.
- A UI that has tokens and states but no product-specific point of view.
- Designs that hide missing content behind abstract gradients, fake dashboards, generic illustrations, or vague copy.
- Screenshot evidence that omits mobile, empty, error, loading, or permission states when those states affect the workflow.

## Review Output

Return:

- Reference set and anti-references used.
- What was learned from each reference without copying.
- Product-specific details that make the UI belong to this project.
- Generic or AI-slop risks that remain.
- Distinctiveness verdict: weak, adequate, or strong.
- Frontend product-quality scorecard verdict and total score.
- Required design changes before implementation or release.
- Required screenshot, accessibility, and visual QA evidence.
