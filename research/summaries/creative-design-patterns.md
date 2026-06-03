# Creative Design And Agent-Readable UI Patterns

Generated from a focused second-pass review after the initial 100-repo scan showed that frontend scoring over-weighted reusable components, tokens, and states.

## Why This Pass Was Needed

The first scan correctly promoted design tokens, component states, accessibility, screenshot review, and anti-generic UI rules. It did not fully enforce creative discovery: audience, content inventory, brand direction, visual identity, category references, and multiple design directions before implementation.

## Focused Sources Reviewed

- `google-labs-code/design.md`: first-class design identity document for coding agents, with machine-readable tokens and human-readable rationale.
- `google-labs-code/stitch-sdk`: design-generation workflow with project design systems, generated screens, screenshots, and variants.
- `storybookjs/design-system`: open design system repository with shared components, Storybook docs, packaging, CI, and visual regression testing.
- `storybookjs/storybook`: component workshop pattern for building, documenting, and testing UI states in isolation.
- `primer/react`: product design-system implementation with contributor/testing expectations.
- `Shopify/polaris-react` and `Shopify/polaris-tokens`: design-system and token packaging patterns for product-specific admin UI.
- `govuk-design-system` and GOV.UK service/content guidance: user-need-first service design and content that maps to real user tasks.

## Repeated Patterns To Adopt

- Keep a persistent design-identity document beside agent instructions, not only a style guide.
- Treat tokens as normative values and prose as usage rationale.
- Require content and user needs before visual styling.
- Generate or compare multiple creative directions before implementation.
- Keep screenshots or visual states as acceptance evidence, not optional polish.
- Prefer product/category-specific briefs over generic SaaS templates.
- Make missing real content or assets explicit instead of masking gaps with generic placeholders.

## Promoted Updates

- Add `DESIGN.md` as an installed root document.
- Add a content-first design skill.
- Add brand/content intake and creative-direction prompts.
- Add brand/content checklist.
- Expand design briefs for ecommerce, portfolio/venue, education/course, community/social, and AI workflow products.
- Require frontend audit coverage for content, brand, creative direction, and screenshot evidence.

Do not copy source code, design files, or proprietary brand systems from reviewed repositories. Adopt only generalized practices with clear rationale.
