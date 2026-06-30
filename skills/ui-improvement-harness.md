# UI Improvement Harness Skill

## Use When

Running operational UI improvement loops for user-facing screens, dashboards, admin flows, app shells, onboarding, marketing surfaces, component systems, or authenticated product workflows.

Use this skill when a request asks for UI audit, polish, layout cleanup, responsive cleanup, accessibility pass, screenshot critique, visual distinctiveness, live browser QA, or repeatable frontend improvement workflows.

## Goal

Turn frontend quality guidance into repeatable commands. The harness should help agents move from screenshots and browser evidence to concrete fixes, then loop until deterministic detector findings and review findings pass for the release risk.

## Required Inputs

- Target surface: route, component, flow, or screenshot set.
- Product context from `DESIGN.md`, `STYLE_GUIDE.md`, and relevant `.agent-kit/design-briefs/*`.
- Auth and permission context for protected screens, including role, tenant, and fixture user assumptions.
- Desktop and mobile viewports for meaningful UI changes.
- State coverage requirements: default, loading, empty, error, disabled, success, permission, focus, and narrow viewport states where relevant.
- Existing visual QA tier from `TESTING.md`, or a proposed tier from `.agent-kit/prompts/visual-qa-plan.md`.

## Command Workflows

Use `.agent-kit/prompts/ui-command-index.md` as the command index. It defines these command-like workflows:

- UI audit: find blockers and major issues before implementation or release.
- UI polish: improve hierarchy, density, spacing, state feedback, and visual finish without changing product scope.
- Layout cleanup: remove clutter, nesting, overflow, weak grouping, and inconsistent spacing.
- Responsive/mobile cleanup: verify mobile hierarchy, tap targets, text fit, navigation, and critical actions.
- Accessibility pass: verify semantic structure, keyboard path, focus, labels, contrast, motion, and error feedback.
- Visual distinctiveness pass: prove product specificity and avoid generic AI/SaaS defaults.
- Screenshot critique: review desktop/mobile/state screenshots against product context and detector findings.
- Live browser QA loop: inspect the running app, capture evidence, apply scoped fixes, and repeat until acceptance criteria pass.

## Deterministic Detector Checklist

Use `.agent-kit/checklists/ui-detectors.md` before and after polish. Treat each finding as `blocker`, `major`, `minor`, or `not-applicable`.

Required detector areas:

- Crowded layout and excessive competing surfaces.
- Weak hierarchy or unclear primary action.
- Inconsistent spacing, density, typography, radius, or alignment.
- Poor mobile tap targets or unreachable critical actions.
- Truncation, overflow, overlap, or text that does not fit.
- Card-within-card patterns and decorative containers that obscure workflow.
- Generic SaaS or AI-site styling, including abstract decoration that hides missing content.
- Weak hover, pressed, selected, loading, success, empty, error, disabled, focus, and permission feedback.
- Missing loading, empty, error, disabled, success, permission, and mobile states where relevant.
- Accessibility and focus issues, including contrast, labels, landmarks, keyboard order, and motion.

## Acceptance Rubric

Use `.agent-kit/checklists/ui-acceptance-rubric.md`.

- Blocker findings must be fixed before release.
- Major findings must be fixed or explicitly accepted with rationale before high-risk UI changes ship.
- High-risk UI changes require desktop and mobile screenshots plus authenticated or permission-state evidence when the workflow requires login.
- Screenshot evidence must include the first viewport, primary workflow, and the highest-risk state affected by the change.
- Visual checks do not replace semantic, keyboard, auth, data-boundary, or regression tests.

## Live Browser QA Loop

For implemented UI:

1. Start or identify the app server and route.
2. Open the target route with the required auth state or test account.
3. Capture desktop and mobile screenshots.
4. Run the deterministic detector checklist.
5. Run screenshot critique and accessibility pass.
6. Apply the smallest scoped fixes.
7. Repeat until no blockers remain and major findings are resolved or documented.
8. Record evidence with `agent-kit session output` when Agent Studio is in use.

For authenticated screens, do not substitute a public landing page screenshot. Use a real signed-in state, a seeded local fixture, or an explicit limitation note that names the missing auth evidence.

## Reject By Default

- A UI pass based only on static prose with no screenshot or browser evidence when implementation exists.
- Desktop-only review for responsive or mobile-risk changes.
- Public-page review used as evidence for authenticated app screens.
- Vague polish requests that do not name detector findings or acceptance criteria.
- Fixes that add decorative cards, gradients, fake metrics, or generic copy instead of clarifying the workflow.
- Ignoring major detector findings without rationale.

## Review Output

Return:

- Target surface and auth state reviewed.
- Commands run or command-like workflows applied.
- Detector findings by severity.
- Screenshots and viewports reviewed.
- Accessibility, responsive, state, and distinctiveness verdicts.
- Fixes made or required before acceptance.
- Tests, browser checks, visual QA evidence, and gaps.
