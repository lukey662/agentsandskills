# Frontend Distinctiveness Benchmark Prompt

Use before accepting significant frontend work.

Inputs:

- `DESIGN.md`
- Current screen, screenshots, preview URL, or implementation notes
- Product category, audience, user needs, content inventory, and primary workflow
- Reference set, anti-references, and source-safety notes
- Asset list and provenance notes
- Product-quality scorecard and visual QA evidence

Review:

- Does the first viewport prove what this product is and what the user does here?
- Which product nouns, data shapes, records, actions, and edge cases are visible?
- Which reference lessons were applied without copying source design, copy, assets, or brand identity?
- Which anti-references were avoided?
- Do assets have clear source, generation, license, or placeholder constraints?
- Which loading, empty, error, disabled, success, permission, and focus states still need proof?
- Would this screen still look valid for another product in the same category after only changing the logo or headline?

Return:

- Verdict: `reject`, `adequate`, or `distinctive`.
- First-screen proof: missing, adequate, or strong.
- Content fingerprint: missing, adequate, or strong.
- Reference benchmark: missing, adequate, or strong.
- Asset/source-safety risks.
- Generic-AI-site risk.
- Required changes before acceptance.
