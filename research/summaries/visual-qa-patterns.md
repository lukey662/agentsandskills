# Visual QA And Regression Patterns

Generated from a focused follow-up review of visual testing and component-state practices after the content-first design hardening pass.

## Why This Pass Was Needed

The kit required desktop/mobile screenshots and screenshot review, but a best-practice repo also needs a repeatable strategy for visual state coverage, baseline approval, and visual regression when UI risk is high.

## Focused Sources Reviewed

- `storybookjs/storybook`: stories act as reusable UI state cases for render, interaction, accessibility, and visual tests.
- `storybookjs/test-runner`: turns stories into executable tests and supports CI execution against built Storybooks.
- `storybookjs/design-system`: uses Storybook for component docs and visual QA infrastructure for a shared design system.
- `chromaui/chromatic-cli` and Chromatic docs: visual testing for Storybook, responsive viewports, PR checks, and baseline review.
- `argos-ci/argos`: open-source visual testing platform with Playwright, Cypress, and Storybook integrations.
- `oblador/loki`: open-source visual regression testing for Storybook.
- Playwright visual comparison docs: `toHaveScreenshot()` and committed baselines, with cautions about deterministic environments.

## Repeated Patterns To Adopt

- Treat stories or screenshot cases as visual state specifications.
- Capture both reusable component states and critical workflow screens.
- Cover at least one mobile/narrow viewport and one desktop viewport.
- Stabilize dynamic content before comparing pixels.
- Review baseline updates as intentional product changes.
- Keep semantic, accessibility, keyboard, auth, and data tests separate from visual comparisons.
- Choose the smallest reliable visual QA tier instead of forcing heavy tooling onto every project.

## Promoted Updates

- Add Visual Regression QA skill.
- Add visual-regression checklist.
- Add visual QA planning prompt.
- Update `TESTING.md` with baseline, strong, and mature visual QA tiers.
- Require visual QA evidence in frontend workflow outputs.
- Add audit warnings when testing docs omit visual QA or visual-regression evidence.
- Update research scanner terms to look for Storybook, `toHaveScreenshot`, Chromatic, Argos, Loki, and visual-regression signals.

Do not adopt a third-party SaaS as a required default. The kit should stay provider-neutral and support manual screenshots, Playwright, Storybook, Chromatic, Argos, Loki, or equivalent evidence depending on project risk.
