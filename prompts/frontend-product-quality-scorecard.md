# Frontend Product Quality Scorecard Prompt

Use before accepting significant frontend work.

Inputs:

- `DESIGN.md`
- Selected creative direction
- Reference set, anti-references, and source-safety notes
- Desktop and mobile screenshots or preview links
- Primary workflow and real content/data examples
- Component states, accessibility evidence, and visual QA tier
- Frontend distinctiveness benchmark verdict

Score each dimension from `0` to `2`:

- User/task fit
- Content specificity
- Visual identity
- Information architecture
- Component states
- Accessibility and interaction
- Source safety

Return:

- Score table with one sentence of evidence per dimension.
- Total score out of `14`.
- Critical zeroes.
- Verdict: `reject`, `adequate`, or `strong`.
- Required changes before acceptance.
- Evidence still missing before release.
- Whether distinctiveness benchmark evidence is strong enough for a best-practice frontend claim.

Reject when any critical dimension has a zero, total score is below `10`, or the first screen could be reused for another product in the same category without changing meaningful content.
