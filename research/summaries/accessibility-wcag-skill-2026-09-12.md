# Accessibility Skill — 2026-09-12 GitHub Scan

Structure only. No skill bodies, specialist catalogs, or proprietary checklists were copied.

## Why this pass

`accessibility-wcag` was a 27-line checklist. Keyboard and contrast were named, but there was no Reject list, no fail-closed Done-when, and no mapping onto App Router forms or dialogs. Agents could “pass” a screen because the screenshot looked fine.

## Sources reviewed

| Source | What to learn | What not to copy |
| --- | --- | --- |
| [W3C WCAG 2.1](https://www.w3.org/TR/WCAG21/) Level AA | The pack’s conformance bar. Keyboard, contrast, labels, names, status messages. | Dumping every success criterion into every review |
| Community-Access `accessibility-agents` | Keyboard, contrast, forms, and modals are *different* failure modes; a screenshot is not a keyboard pass | 11-agent specialist swarm, Copilot mega-roster, their skill bodies |
| Public `wcag-*-accessibility` / `wcag-22-accessibility-audit` skills | Automated vs manual split; axe is optional extra; findings need severity | WCAG 2.2 as the default bar, legal-exposure catalogs, CSV dumps of 80+ criteria |

## Repeated patterns adopted

- Name WCAG 2.1 AA. Require a keyboard pass in the **running** browser.
- Reject “contrast looks fine in the screenshot” without that pass.
- Map criteria onto this pack: Server Action forms, `next/image` alt, dialogs, skip/landmarks, `prefers-reduced-motion`.
- Keep one skill. Pair visual proof with `browser-qa`. Leave authorization to `supabase-auth-rls`.
- Tag findings code-certain vs inferred, same as `frontend-design` review.

## Explicitly not adopted

- Axe / Pa11y as a required tool.
- WCAG 2.2 as the pack default (2.5.8 target size and 2.4.11 focus-not-obscured may be checked if cheap; they are not the Done-when).
- Third-party skill bodies, MCP servers, or a second accessibility OS.
