# Visual Regression QA Skill

## Use When

Reviewing or changing user-facing UI, reusable components, app shells, dashboards, marketing pages, visual design tokens, responsive layouts, image-heavy pages, or any screen where appearance is part of the acceptance criteria.

## Goal

Turn visual quality from subjective review into repeatable evidence. Capture important UI states, compare them across changes, and require intentional approval for visual diffs.

## Coverage Tiers

- Baseline: desktop and mobile screenshots reviewed with `prompts/screenshot-review.md`.
- Strong: Playwright screenshot checks for primary workflows and responsive breakpoints.
- Mature: Storybook stories for reusable component states plus visual regression in CI through a tool such as Chromatic, Argos, Loki, or Playwright snapshots.

## Required Checks

- Primary screens have screenshot evidence for desktop and mobile.
- Reusable components have meaningful state coverage: default, hover/focus where practical, loading, empty, error, disabled, success, permission-denied, and mobile.
- Dynamic data, animations, dates, avatars, ads, third-party widgets, and generated media are stabilized, mocked, or masked before visual comparison.
- Baseline updates are reviewed as product changes, not accepted automatically.
- Visual diffs are linked in PRs, CI artifacts, or review notes.
- Accessibility and interaction tests still run; visual diffs do not replace semantic checks.

## Reject By Default

- A single happy-path screenshot as final UI evidence.
- Visual baselines updated without rationale.
- Full-page visual snapshots that are flaky because dynamic content is uncontrolled.
- Screenshot tests that ignore mobile, long text, empty data, or error states.
- Treating a visual testing service as proof of good design without `DESIGN.md` and screenshot review.

## Review Output

Return:

- Visual surfaces covered and missing.
- Component states covered and missing.
- Baseline/diff evidence and where it can be reviewed.
- Flake risks and stabilization strategy.
- Whether the visual QA tier is appropriate for the change risk.
