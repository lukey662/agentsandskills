# Frontend Product Quality Rubric Skill

## Use When

Reviewing or accepting any meaningful user-facing screen, page, component system, app shell, dashboard, admin workflow, onboarding flow, marketing surface, ecommerce flow, portfolio, venue page, content experience, community surface, education product, or AI workflow UI.

## Goal

Make frontend quality review repeatable. A UI should not pass because it has modern styling, tokens, or screenshots. It must show the product's real audience, task, content, visual identity, states, accessibility, and source-safe reference learning.

## Required Inputs

- `DESIGN.md` with brand/content inputs, selected creative direction, reference set, anti-references, and source-safety notes.
- `DESIGN.md` distinctiveness benchmark evidence: first-screen proof, content fingerprint, reference benchmark, asset provenance, state proof, and visual QA proof.
- Desktop and mobile screenshots or preview links when implementation exists.
- Real content, data examples, record names, assets, or explicitly documented placeholder constraints.
- Component/state evidence for important loading, empty, error, disabled, success, permission, and focus states.
- Accessibility and visual QA evidence proportional to release risk.

## Scorecard

Score each dimension as `0`, `1`, or `2`.

| Dimension | 0 Reject | 1 Adequate | 2 Strong |
| --- | --- | --- | --- |
| User/task fit | First screen could belong to any product | Main task is visible but weakly prioritized | Product object, task, or workflow is immediately clear |
| Content specificity | Generic copy, fake metrics, or placeholder content hides missing decisions | Some real labels or data, but gaps remain | Real domain language, data shape, and content hierarchy drive the UI |
| Visual identity | Default AI-site tropes or derivative reference styling | Direction is coherent but not very distinctive | Typography, color, density, imagery, and layout express the chosen product direction |
| Information architecture | Navigation and hierarchy are unclear | Core path is understandable | Primary and secondary workflows are easy to scan and act on |
| Component states | Happy path only | Common states are documented | Important state variants are implemented or captured as visual evidence |
| Accessibility and interaction | Keyboard, focus, labels, contrast, or motion risks are unresolved | WCAG 2.1 AA basics are covered | Accessibility is verified across critical states and viewport changes |
| Source safety | References are copied or attribution/asset risk is unclear | References are summarized without copying | Lessons, anti-references, and what not to copy are explicit |

Acceptance threshold:

- Reject if any dimension scores `0` for user/task fit, content specificity, accessibility and interaction, or source safety.
- Reject if total score is below `10` of `14`.
- Treat `10-11` as adequate and `12-14` as strong.
- Best-practice frontend evidence requires a score of at least `12`, no critical zeroes, desktop/mobile review, and visual QA evidence for the change risk.
- A best-practice frontend verdict also requires a passing distinctiveness benchmark. A polished but interchangeable screen remains a reject even if it reaches the numeric threshold.

## Reject By Default

- A polished visual system with no real product nouns, data, or workflow.
- A landing page when the request was for an app, tool, dashboard, or operational workflow.
- Generic gradients, card-heavy filler, fake analytics, vague SaaS copy, stock-like decoration, or one-note palettes.
- Reference use that copies a brand, exact layout, visual signature, proprietary asset, or copy.
- Screenshots that omit mobile, important states, or the first screen's primary task.

## Review Output

Return:

- The score for each dimension and total score.
- Critical zeroes, if any.
- The acceptance verdict: `reject`, `adequate`, or `strong`.
- The smallest changes needed to reach the next verdict.
- Missing screenshot, state, accessibility, or visual QA evidence.
- Any source-safety or anti-reference risks that must be resolved before release.
