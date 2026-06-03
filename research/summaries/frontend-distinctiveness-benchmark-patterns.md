# Frontend Distinctiveness Benchmark Patterns

Generated after reviewing the frontend gap raised during public-readiness hardening: a broad repo scan can identify strong component and documentation patterns, but frontend quality still needs a product-specific acceptance benchmark.

## Why This Pass Was Needed

The 100-repo scan and focused follow-up reviews already promoted design tokens, component states, accessibility, visual QA, content-first design, reference-led critique, and a product-quality scorecard. That is better than a normal prompt bundle, but it still left one practical failure mode: a design could satisfy many checklist items while still feeling interchangeable with other AI-generated sites in the same category.

The fix is to require proof that the first screen, content, references, assets, states, and screenshots are specific to the product before accepting significant frontend work.

## Focused Sources Reviewed

- Primer React and Primer design guidance: product-context components, accessibility foundations, and reviewable pattern discipline.
- Shopify Polaris: product-specific admin patterns, content guidance, tokens, and stateful component guidance.
- GOV.UK Design System and service/content guidance: user-need-first design, task language, accessibility, and trust.
- Storybook documentation: component state review, interaction tests, accessibility checks, and visual testing evidence.
- Radix UI Primitives: accessible behavior foundations separated from product-specific styling.
- Carbon Design System and USWDS: standards-backed accessibility, state, and service-design expectations.

## Repeated Patterns To Adopt

- Components and tokens are foundations, not proof of product fit.
- The first viewport should expose the real product object, task, workflow, content, or decision.
- Product nouns, data shapes, actions, and edge cases should drive layout before styling.
- References should become named lessons and anti-references, not copied layouts or visual signatures.
- Asset provenance should be explicit so generated, licensed, placeholder, and real media are not blurred together.
- State evidence and visual QA should be tied to the product workflow, not only to isolated component polish.

## Promoted Updates

- Add Frontend Distinctiveness Benchmark skill.
- Add frontend-distinctiveness checklist and benchmark prompt.
- Update `DESIGN.md` with first-screen proof, content fingerprint, reference benchmark, asset provenance, state proof, and visual QA proof fields.
- Wire Frontend Design Lead and frontend-change workflow to require distinctiveness benchmark evidence.
- Add audit warnings when `DESIGN.md` lacks the distinctiveness benchmark.
- Add public-readiness tests for distinctiveness assets and routing.

Do not copy third-party source code, design files, protected visual identity, brand marks, proprietary layouts, exact copy, or visual signatures from reviewed repositories. Adopt generalized practices only.
