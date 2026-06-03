# Design Direction

This file is the persistent visual identity and content-direction contract for coding agents, design agents, and human reviewers.

Use it before designing or changing any user-facing screen. If the project already has a mature brand or design system, keep that system and record the override in `.agent-kit/overrides.json`.

## Brand And Content Inputs

Define the real product context before UI work starts.

| Area | Required Decision |
| --- | --- |
| Product category | SaaS, admin, marketplace, content, tool, ecommerce, portfolio, venue, education, community, AI workflow, or other |
| Primary audience | Who uses the product and what they already understand |
| User needs | Jobs users are trying to complete, written in the user's language |
| Content inventory | Real nouns, labels, data types, records, assets, and domain terms available to the UI |
| Brand personality | 3-5 traits that should be visible in layout, typography, imagery, and interaction tone |
| Visual constraints | Existing logo, colors, fonts, imagery, accessibility constraints, and platform conventions |
| Competitive context | Category references to learn from and avoid copying |
| Non-goals | Visual tropes, copy patterns, or interaction styles that must not be used |

## Reference Set And Anti-References

Use references for learning, not copying. Record what the project should absorb and what it must avoid.

| Reference | What To Learn | What Not To Copy | Source-Safety Notes |
| --- | --- | --- | --- |
| Reference A | TBD | TBD | No brand marks, protected layout signatures, proprietary assets, or exact copy |
| Reference B | TBD | TBD | TBD |
| Reference C | Optional | Optional | Optional |

Anti-references:

- TBD: pattern, palette, layout, copy, or interaction style to avoid.
- TBD: another explicit non-goal.

## Creative Direction

Before implementation, produce at least two distinct visual directions and choose one.

| Direction | What Makes It Distinct | Best For | Risks |
| --- | --- | --- | --- |
| Direction A | TBD | TBD | TBD |
| Direction B | TBD | TBD | TBD |
| Direction C | Optional | Optional | Optional |

Chosen direction:

- Name: TBD
- Rationale: TBD
- Rejected alternatives: TBD

## Design Tokens

Tokens are the normative values. Prose explains how to apply them.

| Token Area | Required Decisions |
| --- | --- |
| Color | Semantic colors, surface colors, text colors, state colors, contrast notes |
| Typography | Font family, scale, weights, line height, heading/body relationship |
| Spacing | Base unit, dense/admin spacing, section spacing, responsive spacing |
| Radius | Component radius defaults and exceptions |
| Motion | Duration, easing, reduced-motion behavior |
| Shadow/Depth | When elevation is allowed and when it is prohibited |
| Imagery | Product, place, person, object, or workflow asset rules |

## Information Architecture

The first screen must show the real product, task, object, or workflow.

Document:

- Primary workflow.
- Secondary workflows.
- Navigation model.
- Data hierarchy.
- Empty, loading, error, disabled, success, and permission-denied states.
- Mobile-first layout changes.

## Design Critique Gate

Run `.agent-kit/prompts/design-critique-gate.md` before accepting significant frontend work.

| Area | Verdict |
| --- | --- |
| First-screen specificity | TBD |
| Product/content fit | TBD |
| Distinctiveness | Weak, adequate, or strong |
| Generic AI-site risk | TBD |
| Accessibility risk | TBD |
| Required changes | TBD |

## Frontend Distinctiveness Benchmark

Run `.agent-kit/prompts/frontend-distinctiveness-benchmark.md` before accepting significant frontend work. This benchmark proves the UI is specific to the product, not just polished.

| Area | Required Evidence |
| --- | --- |
| First-screen proof | The first viewport shows the real product object, task, workflow, content, or decision |
| Content fingerprint | Product nouns, labels, data shapes, records, actions, edge cases, and domain terms visible in the UI |
| Reference benchmark | 3-5 references with lessons to learn and 2-3 anti-references with tropes to avoid |
| Creative divergence | At least two plausible directions compared before implementation |
| Asset provenance | Real, generated, licensed, and placeholder assets identified with usage constraints |
| State proof | Loading, empty, error, disabled, success, permission, and focus states captured where relevant |
| Visual QA proof | Desktop, mobile, and high-risk state evidence reviewed for the change risk |

Distinctiveness verdict:

- Verdict: Reject, adequate, or distinctive
- Generic-AI-site risk: TBD
- Source-safety risks: TBD
- Required changes before acceptance: TBD

## Product Quality Scorecard

Run `.agent-kit/prompts/frontend-product-quality-scorecard.md` before accepting significant frontend work. Score each dimension as `0`, `1`, or `2`.

| Dimension | Score | Evidence |
| --- | --- | --- |
| User/task fit | TBD | Does the first screen show the real product task, object, workflow, or content? |
| Content specificity | TBD | Are real nouns, labels, data shapes, assets, and domain terms visible? |
| Visual identity | TBD | Does the visual direction belong to this product instead of a generic category? |
| Information architecture | TBD | Are primary and secondary workflows clear and scannable? |
| Component states | TBD | Are loading, empty, error, disabled, success, permission, and focus states handled where relevant? |
| Accessibility and interaction | TBD | Are keyboard path, focus, contrast, labels, motion, and error feedback covered? |
| Source safety | TBD | Did references teach decisions without copied brand marks, layouts, copy, assets, or visual signatures? |

Total score:

- Score: TBD / 14
- Verdict: Reject, adequate, or strong
- Critical zeroes: TBD
- Required changes before acceptance: TBD

Acceptance threshold:

- Reject if user/task fit, content specificity, accessibility and interaction, or source safety scores `0`.
- Reject if total score is below `10`.
- Treat `10-11` as adequate and `12-14` as strong.
- Best-practice frontend evidence requires at least `12`, no critical zeroes, desktop/mobile review, and visual QA evidence for the change risk.

## Component Direction

List product-specific components and the states they require.

| Component | Purpose | States | Accessibility Notes |
| --- | --- | --- | --- |
| Primary action surface | TBD | Default, hover, focus, disabled, loading, success, error | TBD |

## Asset Rules

- Use real product, object, place, person, gameplay, workflow, or generated imagery when visual inspection matters.
- Avoid generic abstract gradients, vague device mockups, fake metrics, and stock-like decoration.
- If no assets exist, document the missing asset need and use a purposeful placeholder with clear dimensions.
- Keep image alt text specific to the content or empty only when the image is decorative.

## Acceptance Evidence

Frontend work is not accepted until the following evidence exists:

- Brand and content inputs are filled or explicitly marked as not applicable.
- Reference set, anti-references, and source-safety notes are filled.
- A creative-direction matrix was considered.
- The chosen direction is reflected in tokens, layout, copy, and imagery.
- A design critique verdict records product fit, distinctiveness, generic-risk, and required changes.
- A frontend distinctiveness benchmark records first-screen proof, content fingerprint, reference benchmark, creative divergence, asset provenance, state proof, visual QA proof, generic-risk, and source-safety risks.
- A product-quality scorecard records user/task fit, content specificity, visual identity, information architecture, component states, accessibility and interaction, source safety, total score, and verdict.
- Desktop and mobile screenshots were reviewed.
- Accessibility risks and component states were reviewed.
- Visual QA tier is documented in `TESTING.md` for high-risk UI changes.
- Baseline visual changes are approved intentionally when visual regression tooling exists.
