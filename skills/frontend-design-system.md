# Frontend Design System Skill

## Use When

Building or reviewing any user-facing screen, page, component, app shell, dashboard, admin view, onboarding flow, or marketing surface.

## Goal

Create interfaces that are domain-specific, accessible, polished, and useful. Avoid the common AI-generated look.

## Reject By Default

- Generic purple-blue gradient heroes.
- Vague SaaS value props.
- Fake dashboard metrics.
- Floating card soup.
- Oversized rounded panels without workflow purpose.
- Placeholder landing pages when the user asked for an app or tool.
- One-note color palettes.
- Styling that starts before content, audience, and workflow are understood.

## Prefer

- Task-first product screens.
- Domain-specific information architecture.
- Reusable design tokens.
- A documented component and state inventory.
- Clear density rules.
- Accessible forms and controls.
- Real loading, empty, error, disabled, and success states.
- Mobile-first layouts.
- Visual direction that fits the product category.
- A chosen creative direction that is visible in tokens, layout, copy, imagery, and interaction tone.

## Design Adapter Trigger

Use a provider-neutral design adapter and the matching `design-briefs/*` file when:

- The screen risks looking generic.
- The product category needs stronger visual direction.
- The workflow is unclear.
- A high-stakes UI needs external review.

Use `prompts/screenshot-review.md` after implementation when desktop and mobile screenshots exist.

Use `skills/content-first-design.md`, `prompts/brand-content-intake.md`, and `prompts/creative-direction-matrix.md` before implementation when the product, audience, content, brand, or visual direction is under-specified.

Use `skills/reference-led-design-critique.md` and `prompts/design-critique-gate.md` before accepting significant frontend work, especially when the screen could still look generic despite having tokens, states, and screenshots.

Use `skills/frontend-product-quality-rubric.md` and `prompts/frontend-product-quality-scorecard.md` before accepting significant frontend work. The scorecard must reject work when the product task, content specificity, accessibility, or source safety is weak, even if the UI looks polished.

Use `skills/frontend-distinctiveness-benchmark.md` and `prompts/frontend-distinctiveness-benchmark.md` before accepting significant frontend work that could still be interchangeable with another product in the same category. The benchmark must prove first-screen specificity, content fingerprint, safe reference learning, asset provenance, state proof, and visual QA evidence.

## Review Output

Return:

- What looks generic or under-specified.
- Which brand, content, audience, or creative-direction inputs are missing.
- Which reference-set, anti-reference, source-safety, or distinctiveness evidence is missing.
- Which design tokens are missing.
- Which component states are missing.
- Which accessibility risks remain.
- Which provider-neutral design brief should be used next, if any.
- Which screenshot evidence is still needed before the UI can be accepted.
- Which visual-regression or component-state evidence is needed before release.
- Which product-quality scorecard dimensions failed and what must improve before acceptance.
- Which distinctiveness benchmark evidence is missing before the UI can be accepted as product-specific.
