# Visual QA Plan Prompt

Use before accepting a frontend change or before adding visual regression coverage.

Return:

1. Visual QA tier: baseline, strong, or mature.
2. Surfaces requiring evidence.
3. Component states to capture.
4. Viewports, themes, locales, permissions, or data states to cover.
5. Dynamic content that must be mocked, masked, frozen, or excluded.
6. Tooling recommendation: Playwright screenshots, Storybook stories, Chromatic, Argos, Loki, or manual screenshot review.
7. CI or PR evidence that should be produced.
8. Rules for approving baseline updates.

Do not recommend visual snapshots for volatile full pages unless the volatile regions can be stabilized.
