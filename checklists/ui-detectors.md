# UI Detector Checklist

Use this deterministic checklist for UI audit, polish, layout cleanup, responsive cleanup, screenshot critique, and browser QA. Mark each item as `blocker`, `major`, `minor`, `pass`, or `not-applicable`.

## Severity

| Severity | Meaning |
| --- | --- |
| blocker | Prevents release because a user cannot complete the workflow, the UI is inaccessible, or required evidence is missing |
| major | Degrades comprehension, trust, responsiveness, or state handling enough that high-risk UI should not ship without a fix or accepted exception |
| minor | Polish issue that should be fixed when nearby but does not block normal release |
| pass | Checked and acceptable for the target surface |
| not-applicable | The detector does not apply to this surface or state |

## Layout And Hierarchy

| Detector | Blocker Signal | Major Signal |
| --- | --- | --- |
| Crowded layout | Primary workflow cannot be identified or completed | Too many competing sections, controls, badges, or panels |
| Weak hierarchy | Primary action or current state is hidden | Headings, labels, and actions do not establish clear priority |
| Inconsistent spacing | Spacing causes overlap or unusable controls | Density, gaps, padding, or alignment shift without system logic |
| Card-within-card | Nested containers obscure the workflow or trap scroll | Decorative nested panels add visual noise without information value |
| Poor grouping | Related controls are separated or unrelated items are grouped | Scan path is unclear or section boundaries are arbitrary |

## Responsive And Mobile

| Detector | Blocker Signal | Major Signal |
| --- | --- | --- |
| Poor tap targets | Critical control is too small, overlapped, or unreachable | Repeated controls feel cramped or hard to tap |
| Truncation or overflow | Text, inputs, tables, or controls clip essential content | Labels wrap badly, overflow horizontally, or push layout off-screen |
| Mobile hierarchy | Mobile first screen hides the primary task or action | Desktop order collapses into a confusing mobile sequence |
| Sticky or fixed UI | Fixed header/footer covers content or controls | Sticky UI consumes too much viewport or causes awkward scrolling |
| Orientation and narrow widths | Page breaks at common mobile widths | Responsive behavior is untested below tablet width |

## States And Feedback

| Detector | Blocker Signal | Major Signal |
| --- | --- | --- |
| Missing loading state | User can trigger duplicate or unsafe action while waiting | Loading state exists but does not preserve layout or context |
| Missing empty state | Empty data leaves a dead end | Empty state lacks next action or domain-specific guidance |
| Missing error state | Failure is silent or blocks recovery | Error is vague, unactionable, or visually disconnected |
| Missing disabled state | Disabled action looks enabled or loses explanation | Disabled state lacks affordance, label, or contrast |
| Missing success feedback | User cannot tell whether action completed | Success message is too subtle, transient, or ambiguous |
| Missing permission state | Protected UI leaks actions or fails without explanation | Permission limitation is not clear to the affected role |
| Weak interaction feedback | Focus, selected, hover, pressed, or active state is absent on critical controls | State feedback is inconsistent across similar controls |

## Accessibility

| Detector | Blocker Signal | Major Signal |
| --- | --- | --- |
| Keyboard path | Critical workflow cannot be completed by keyboard | Tab order is confusing or focus moves unexpectedly |
| Focus visibility | Focus indicator is absent on interactive controls | Focus is low contrast or inconsistent |
| Semantic structure | Heading, landmark, form, table, or button semantics block assistive tech use | Semantics are mostly present but incomplete |
| Labels and errors | Inputs or controls lack accessible names or error association | Labels exist but are vague, duplicate, or visually disconnected |
| Contrast | Text or critical controls fail WCAG 2.1 AA contrast | Secondary text or state colors are borderline |
| Motion | Motion prevents comprehension or ignores reduced-motion need | Motion distracts from workflow or feels inconsistent |

## Distinctiveness And Source Safety

| Detector | Blocker Signal | Major Signal |
| --- | --- | --- |
| Generic SaaS styling | First screen could fit another product by changing logo and headline | Visual direction relies on common cards, gradients, fake dashboards, or vague claims |
| Missing content fingerprint | UI hides missing product decisions behind placeholders | Real nouns, records, actions, or edge cases are too sparse |
| Weak visual identity | No product-specific density, typography, imagery, or interaction point of view | Direction is coherent but category-generic |
| Unsafe reference use | Copy, assets, layout signature, or brand identity appear copied | References are cited without lessons and anti-copy notes |
| Fake or unsupported proof | Fake metrics or claims imply unavailable capability | Proof exists but is not tied to actual product behavior |

## Evidence Requirements

- Desktop screenshot reviewed.
- Mobile screenshot reviewed.
- Highest-risk state screenshot reviewed.
- Authenticated or permission-state screenshot reviewed when applicable.
- Browser route, viewport, data fixture, and user role named.
- Detector exceptions documented with rationale and owner.
