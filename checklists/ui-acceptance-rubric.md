# UI Acceptance Rubric

Use this rubric after the UI detector checklist, screenshot critique, accessibility pass, and browser QA loop.

## Pass/Fail

| Verdict | Criteria |
| --- | --- |
| fail | Any blocker remains, required screenshot evidence is missing, or authenticated screens were not reviewed when auth is required |
| conditional | No blockers remain, but major findings need documented owner, rationale, or follow-up before high-risk release |
| pass | No blockers remain, major findings are fixed or explicitly accepted, and evidence covers viewports, states, and auth needs |
| strong | Pass criteria plus clear product specificity, accessible keyboard flow, responsive resilience, and state coverage for the workflow |

## Required Evidence

- Target surface: route, component, flow, or screenshot set.
- Product context source: `DESIGN.md`, `STYLE_GUIDE.md`, design brief, or documented override.
- Viewports: desktop and mobile dimensions.
- Auth state: public, signed-in, role, tenant, permission, or explicit not-applicable.
- Data state: realistic, empty, loading, error, or fixture notes.
- Screenshots: first viewport, primary workflow, mobile, and highest-risk state.
- Checks: detector checklist, accessibility pass, screenshot critique, and visual QA tier.

## Release Blocking Rules

- Block release for any blocker detector.
- Block high-risk UI release when desktop or mobile screenshot evidence is missing.
- Block authenticated workflow release when no signed-in or permission-state evidence exists.
- Block acceptance when loading, empty, error, disabled, success, permission, or focus states are relevant but omitted without rationale.
- Block best-practice claims when product specificity, accessibility, or source safety is weak.

## Risk Tiers

| Tier | Use When | Minimum Evidence |
| --- | --- | --- |
| low | Copy-only or isolated cosmetic change to a stable component | Targeted screenshot or component evidence plus detector review |
| medium | Layout, responsive, or state changes on a user-facing surface | Desktop and mobile screenshots plus relevant state evidence |
| high | Authenticated workflow, checkout, data mutation, admin, onboarding, or shared component system | Desktop, mobile, auth/permission, error/empty/loading, keyboard/focus, and smoke evidence |

## Exception Rules

Exceptions are allowed only when:

- The finding is not a blocker.
- The rationale names product or technical constraints.
- The owner and follow-up path are documented.
- The exception does not weaken auth, accessibility, data integrity, or source safety.

## Output Format

Return:

1. Verdict: fail, conditional, pass, or strong.
2. Risk tier and target surface.
3. Evidence reviewed.
4. Blockers, majors, minors, and accepted exceptions.
5. Required fixes before release.
6. Follow-up work after release.
