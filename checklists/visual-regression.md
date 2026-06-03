# Visual Regression Checklist

- Visual QA tier is documented: baseline screenshots, Playwright screenshots, Storybook visual tests, or visual-regression service.
- Desktop and mobile screenshots exist for primary screens.
- Reusable components have state stories or screenshot cases for default, loading, empty, error, disabled, success, permission-denied, and mobile states.
- Dynamic or volatile regions are mocked, masked, frozen, or excluded with rationale.
- Baseline updates require human review and a short rationale.
- CI or review notes link to screenshot artifacts, Storybook, Chromatic, Argos, Playwright report, or equivalent evidence.
- Visual checks cover at least one narrow/mobile viewport and one desktop viewport.
- Visual checks do not replace accessibility, keyboard, semantic, auth, or data-boundary tests.
- Known visual QA gaps are recorded in `TESTING.md` before release.
