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
- Auth and mutation paths are prioritized.
- Network failure, empty, and error behavior is covered.
- Gaps are named when infrastructure is missing.

## Visual proof

User-visible screens also require `browser-qa`. This skill does not replace screenshots.

## Done when

Commands run, results, and residual gaps are listed.
