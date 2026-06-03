# Frontend Product Quality Rubric Patterns

Generated from a focused follow-up review after the kit already had content-first design, reference-led critique, visual QA, and anti-generic UI guidance.

## Why This Pass Was Needed

The previous frontend hardening made generic AI-site output harder, but it still relied on qualitative review language. A best-practice setup needs a repeatable product-quality rubric so design agents, coding agents, and human reviewers can reject weak UI for the same reasons.

## Focused Sources Reviewed

- `primer/react` and Primer design guidance: accessible component foundations, product-context patterns, and reviewable design-system decisions.
- GOV.UK Design System and service/content guidance: user-need-first service design, accessibility, and task-oriented content.
- Storybook documentation: stateful component review, interaction tests, accessibility checks, and visual testing as review evidence.
- Shopify Polaris: product-specific admin interface foundations, content guidance, tokens, and component guidance.
- Radix UI Primitives: accessible, unstyled primitives that separate behavior foundations from product-specific visual direction.
- Carbon Design System: accessibility status, component guidance, and design-system quality expectations.
- USWDS: design principles that prioritize real user needs, accessibility, trust, and consistent interaction patterns.

## Repeated Patterns To Adopt

- Treat accessible primitives and components as the foundation, not the product's visual identity.
- Score UI against real user task, content specificity, information architecture, visual identity, states, accessibility, and safe reference use.
- Make first-screen specificity a hard gate: users should see the real product object, task, workflow, or content immediately.
- Require source-safety review whenever references influence layout, imagery, copy, or visual style.
- Keep desktop/mobile screenshots, state evidence, and visual QA tied to the scorecard verdict.
- Reject work when polished styling hides missing content, fake data, or generic category tropes.

## Promoted Updates

- Add Frontend Product Quality Rubric skill.
- Add frontend product-quality checklist and scorecard prompt.
- Update `DESIGN.md` with a product-quality scorecard and acceptance thresholds.
- Wire Frontend Design Lead and frontend-change workflow to require the scorecard.
- Add audit warnings when the scorecard is missing from `DESIGN.md`.
- Add public-readiness tests for rubric assets and routing.

Do not copy third-party source code, design files, protected visual identity, brand marks, proprietary layouts, or exact copy from reviewed repositories. Adopt generalized practices only.
