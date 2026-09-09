---
name: testing-qa
description: Use when adding unit, regression, or smoke tests. Visual proof of a screen always also uses browser-qa.
---

# Testing QA

## Use when

Adding or reviewing tests, smoke checks, or regression coverage.

## Checks

- Core logic has unit tests.
- Preserved behavior has regression tests.
- Critical flows have Playwright or equivalent smoke tests.
- Auth, RLS, and mutation paths are prioritized (other-user / anon cannot pass).
- Network failure, empty, and error behavior is covered.
- Gaps are named when infrastructure is missing.

## Visual proof

User-visible screens also require `browser-qa`. This skill does not replace screenshots. Passing `toBeVisible` is not image review.

## Done when

Commands run, results, and residual gaps are listed. RLS/auth tests fail closed when another user can read the row.
