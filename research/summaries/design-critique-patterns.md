# Reference-Led Design Critique Patterns

Generated from a follow-up design-quality review after the kit already had content-first design, design adapters, and visual QA.

## Why This Pass Was Needed

The existing frontend guidance required brand/content intake, creative-direction options, design tokens, component states, screenshot review, and visual QA. That reduced generic AI-site defaults, but it still allowed a weak design to pass if it had enough checklist artifacts. A best-practice frontend setup also needs a critique loop that compares the work to relevant references, names anti-references, and records why the result is distinct for the product.

## Focused Sources Reviewed

- `shadcn-ui/ui`: registry-oriented component distribution and reusable UI skill guidance.
- `primer/design` and Primer accessibility guidance: design-system guidelines, inclusive design, product-context review, and reusable pattern discipline.
- `radix-ui/primitives`: accessible low-level primitives that separate behavior foundations from project-specific styling.
- Carbon Design System guidance: accessibility status, component guidance, and standards-backed review expectations.
- Storybook documentation: component state, interaction, accessibility, and visual testing workflows.

## Repeated Patterns To Adopt

- Separate reusable primitives from product-specific visual direction.
- Use references to learn hierarchy, density, state treatment, and interaction patterns without copying source designs.
- Record anti-references so agents know which category tropes and AI-generated defaults to avoid.
- Treat accessibility and component-state behavior as foundations, not as visual differentiation by themselves.
- Use screenshots, stories, or visual tests to make critique evidence reviewable after implementation.
- Require a written verdict before accepting significant UI work.

## Promoted Updates

- Add Reference-Led Design Critique skill.
- Add design-critique gate prompt and checklist.
- Add reference set, anti-reference, source-safety, distinctiveness, and critique verdict fields to `DESIGN.md`.
- Wire the Frontend Design Lead and frontend-change workflow to require reference-set evidence and a design critique verdict.
- Add audit warnings when `DESIGN.md` lacks the critique gate.

Do not copy third-party source code, design files, protected visual identity, brand marks, or proprietary copy from reviewed repositories. Adopt generalized practices only.
