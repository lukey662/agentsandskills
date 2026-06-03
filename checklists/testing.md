# Testing Checklist

- Unit tests cover core logic.
- Regression tests preserve existing behavior.
- Playwright smoke tests cover critical paths.
- Visual QA evidence exists for high-risk UI changes.
- Auth, admin, and data mutations are prioritized.
- Empty/error/loading states are covered where practical.
- Test gaps and residual risks are documented.
- CI gates are documented and match the commands used by the project.
- Playwright smoke coverage exists for the primary workflow before release.
- Visual baseline updates require human review and rationale when visual-regression tooling exists.
