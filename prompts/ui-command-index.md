# UI Command Index

Use this index to run repeatable UI improvement workflows. These are command-like prompts for any assistant surface and the source of truth for native runtime commands.

Canonical sources:

- `DESIGN.md`
- `STYLE_GUIDE.md`
- `TESTING.md`
- `QUALITY_GATES.md`
- `.agent-kit/agent-roster.json`
- `.agent-kit/skills/ui-improvement-harness.md`
- `.agent-kit/checklists/ui-detectors.md`
- `.agent-kit/checklists/ui-acceptance-rubric.md`
- `.agent-kit/prompts/screenshot-review.md`
- `.agent-kit/prompts/visual-qa-plan.md`

## `/ui-audit`

Audit a target UI surface before release.

Required steps:

1. Identify target route, component, workflow, auth state, data state, and risk tier.
2. Load product/design context and relevant design brief.
3. Review desktop and mobile evidence, or state which evidence must still be captured.
4. Run the UI detector checklist.
5. Return blockers, majors, minors, preserved capabilities, and required fixes.

Required outputs: target surface, risk tier, detector findings by severity, missing evidence, pass/fail verdict.

## `/ui-polish`

Improve visual quality without changing product scope.

Required steps:

1. Start from detector findings, screenshots, or a named surface.
2. Preserve product behavior, auth boundaries, copy claims, and data contracts.
3. Improve hierarchy, spacing, density, alignment, component states, and interaction feedback.
4. Avoid decorative complexity and generic SaaS defaults.
5. Re-run detector and screenshot critique after changes.

Required outputs: polish goals, changes made or proposed, detector deltas, screenshots needed, residual risks.

## `/layout-cleanup`

Reduce clutter and repair layout structure.

Required steps:

1. Identify primary task, secondary tasks, and content hierarchy.
2. Remove unnecessary nesting, repeated surfaces, card-within-card patterns, and arbitrary dividers.
3. Normalize spacing, grouping, alignment, heading scale, and responsive containers.
4. Verify no truncation, overlap, or horizontal overflow remains.

Required outputs: layout findings, cleanup actions, preserved workflow, desktop/mobile evidence.

## `/responsive-cleanup`

Make a UI work across mobile and desktop.

Required steps:

1. Review mobile width, desktop width, and any tablet breakpoint used by the project.
2. Verify tap targets, text fit, navigation, primary action visibility, sticky UI, and scroll behavior.
3. Verify stateful screens on mobile, not only the happy path.
4. Capture or request mobile and desktop screenshots before acceptance.

Required outputs: viewports checked, responsive findings, fixes, screenshots, remaining risks.

## `/accessibility-pass`

Run a WCAG 2.1 AA-oriented pass on the target UI.

Required steps:

1. Check semantics, headings, landmarks, forms, labels, tables, and buttons.
2. Check keyboard navigation, visible focus, tab order, escape/close behavior, and skip path when applicable.
3. Check contrast, reduced motion, error association, touch targets, and status announcements.
4. Keep auth, state, and data-boundary tests separate from visual checks.

Required outputs: accessibility findings, severity, fixes, skipped checks, test evidence.

## `/distinctiveness-pass`

Prove the UI belongs to this product and does not look generic.

Required steps:

1. Compare the first viewport to product category, audience, workflow, and content fingerprint.
2. Confirm references were translated into lessons without copying source layouts, copy, assets, or brand marks.
3. Remove fake metrics, vague claims, abstract filler, and interchangeable card stacks.
4. Re-score distinctiveness and product quality where significant UI work is involved.

Required outputs: product-specific evidence, generic-risk findings, source-safety notes, required changes.

## `/screenshot-critique`

Review provided screenshots or captured browser screenshots.

Required steps:

1. Name each screenshot, viewport, route, auth state, data state, and UI state.
2. Run screenshot review, detector checklist, and accessibility risk scan.
3. Compare against `DESIGN.md`, `STYLE_GUIDE.md`, and selected creative direction.
4. Return concrete fixes, not broad design advice.

Required outputs: screenshot inventory, blockers, high-value fixes, accepted areas, missing screenshots.

## `/browser-qa`

Run a live browser QA loop for an implemented UI.

Required steps:

1. Start or identify the dev/preview server and target routes.
2. Open the target with required auth, role, tenant, and data state.
3. Capture desktop and mobile screenshots.
4. Run detector, screenshot critique, accessibility pass, and responsive cleanup.
5. Apply scoped fixes and repeat until acceptance criteria pass.
6. Record evidence with `agent-kit session output` when Agent Studio is in use.

Required outputs: route, auth state, commands run, screenshots, detector results, fixes, final verdict.
