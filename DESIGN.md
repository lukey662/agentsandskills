# Design Direction

This file is the persistent visual identity and content-direction contract for coding agents, design agents, and human reviewers.

This repo ships a CLI and markdown/JSON assets, so its user-facing surfaces are terminal output, `README.md`, rendered session markdown, and the static Agent Studio HTML export (`src/studio/export.ts`). Design decisions below target those surfaces.

## Brand And Content Inputs

| Area | Required Decision |
| --- | --- |
| Product category | Developer tool (CLI plus installable markdown/JSON kit) |
| Primary audience | Engineers and AI coding agents who live in terminals, editors, and GitHub; they already understand npm, CI, and markdown |
| User needs | Install the kit fast, see readiness at a glance, act on findings without rereading docs, review session evidence locally |
| Content inventory | Real nouns: readiness levels, findings (pass/warn/fail), agents, workflows, handoffs, sessions, corrections, conflicts, manifests, templates |
| Brand personality | Precise, calm, evidence-led, unflashy, trustworthy |
| Visual constraints | Terminal-first: monochrome-safe output with optional ANSI color; markdown must render in GitHub and common previewers; studio export must be self-contained HTML with no external assets |
| Competitive context | CLIs with strong output UX: changesets, supabase CLI, create-next-app, npm audit |
| Non-goals | Marketing-style landing pages, decorative ASCII art, emoji-heavy output, animated spinners that break CI logs |

## Reference Set And Anti-References

Use references for learning, not copying. Record what the project should absorb and what it must avoid.

| Reference | What To Learn | What Not To Copy | Source-Safety Notes |
| --- | --- | --- | --- |
| `npm audit` output | Severity-grouped findings with a summary line and one remediation per finding | Its wall-of-text verbosity at high finding counts | No brand marks, protected layout signatures, proprietary assets, or exact copy |
| changesets CLI | Human-readable status by default with machine output behind flags | Its interactive-only flows that block CI usage | Pattern learning only |
| OpenSSF Scorecard reports | A single top-line score with drill-down detail | Score-only presentation without remediation | Pattern learning only |

Anti-references:

- Raw `JSON.stringify` dumps as default human output: unreadable and signals unfinished tooling.
- Emoji-and-gradient developer-tool marketing pages with fake dashboard screenshots and invented metrics.

## Creative Direction

| Direction | What Makes It Distinct | Best For | Risks |
| --- | --- | --- | --- |
| Evidence ledger | Every command prints a compact summary line followed by an actionable findings table; readiness always appears first | Audit, diff, doctor | Dense output on small terminals |
| Guided operator | Conversational prompts drive init/onboard with progressive disclosure | First-run experience | Breaks CI unless a non-interactive fallback is preserved |
| Silent plumbing | Minimal output, JSON-only, Unix-pipe oriented | Scripting | Hides readiness insight from humans |

Chosen direction:

- Name: Evidence ledger, with Guided operator elements for `init --guided` and `onboard` only.
- Rationale: The kit's differentiator is auditable evidence; output should read like an audit report, not a log dump. Guided flows remain opt-in so CI stays non-interactive.
- Rejected alternatives: Silent plumbing (hides the product's core value); full Guided operator (conflicts with CI-first usage).

## Design Tokens

Tokens are the normative values. Prose explains how to apply them.

| Token Area | Required Decisions |
| --- | --- |
| Color | ANSI semantic colors only: green pass, yellow warn, red fail, cyan headings, dim for remediation detail; must degrade to monochrome when not a TTY or `NO_COLOR` is set |
| Typography | Terminal default monospace; markdown uses sentence-case headings, tables for enumerable facts, fenced code for commands |
| Spacing | One blank line between sections; two-space indentation for remediation lines; no trailing whitespace |
| Radius | Not applicable to terminal output; studio export uses a single 6px radius token |
| Motion | None; no spinners or animation so CI logs stay clean; reduced-motion is the default and only mode |
| Shadow/Depth | Not applicable in terminal; studio export uses borders, not shadows |
| Imagery | No decorative imagery; diagrams only as Mermaid in markdown where they stay readable |

## Information Architecture

The first screen must show the real product, task, object, or workflow.

- Primary workflow: `init` then `audit`; audit output leads with readiness level, then summary counts, then top next actions.
- Secondary workflows: `diff`/`update` for upgrades, `session`/`correction` for evidence, `studio export` for local review.
- Navigation model: command groups (`install`, `session`, `correction`, `context`, `research`) mirrored in `--help` ordering.
- Data hierarchy: readiness > summary counts > findings by area > per-finding remediation.
- Empty, loading, error, disabled, success, and permission-denied states: every command defines empty-state text (for example "no sessions yet: run agent-kit session start"), errors always name the failing input and the next command to run, and long operations print a start line rather than a spinner.
- Mobile-first layout changes: not applicable to terminal; studio HTML export must remain readable at 360px width.

## Design Critique Gate

Run `.agent-kit/prompts/design-critique-gate.md` before accepting significant frontend work.

| Area | Verdict |
| --- | --- |
| First-screen specificity | Pass: audit output leads with readiness verdict and real findings, not branding |
| Product/content fit | Pass: output vocabulary matches the domain (readiness, findings, handoffs, conflicts) |
| Distinctiveness | Adequate: ledger-style output is recognizable; will strengthen with the CLI UX overhaul (human-readable default output) |
| Generic AI-site risk | Low: no landing pages ship from this repo; README copy is governed by `MESSAGING.md` |
| Accessibility risk | Low: monochrome-safe color use, no motion, screen-reader-friendly markdown structure |
| Required changes | Replace raw JSON default output across commands (tracked in the CLI UX phase) |

## Frontend Distinctiveness Benchmark

Run `.agent-kit/prompts/frontend-distinctiveness-benchmark.md` before accepting significant frontend work. This benchmark proves the UI is specific to the product, not just polished.

| Area | Required Evidence |
| --- | --- |
| First-screen proof | `agent-kit audit` first lines show readiness level, counts, and next actions: the real product decision surface |
| Content fingerprint | Findings name concrete files, schemas, agents, and commands from this project rather than generic phrases |
| Reference benchmark | npm audit, changesets, and Scorecard studied above; anti-references recorded |
| Creative divergence | Three directions compared above; Evidence ledger chosen with rationale |
| Asset provenance | No third-party assets; all output text and the studio HTML template are authored in this repo |
| State proof | Empty, error, and success states defined per command group; conflict and permission failures name recovery commands |
| Visual QA proof | Terminal output reviewed on Windows PowerShell and CI (ubuntu) logs; studio export opened locally and checked for self-containment |

Distinctiveness verdict:

- Verdict: Adequate, moving to distinctive once the human-readable output overhaul lands.
- Generic-AI-site risk: Low.
- Source-safety risks: None known; patterns learned, nothing copied.
- Required changes before acceptance: Complete the CLI UX phase (default human output plus `--json` everywhere).

## Product Quality Scorecard

Run `.agent-kit/prompts/frontend-product-quality-scorecard.md` before accepting significant frontend work. Score each dimension as `0`, `1`, or `2`.

| Dimension | Score | Evidence |
| --- | --- | --- |
| User/task fit | 2 | Audit-first output shows the real task (fix findings, raise readiness) immediately |
| Content specificity | 2 | Output names real files, schemas, commands, and agents |
| Visual identity | 1 | Ledger direction chosen but raw JSON remains the default on several commands until the UX phase completes |
| Information architecture | 2 | Readiness > summary > findings > remediation hierarchy is consistent |
| Component states | 1 | Error and empty states exist but are not yet uniform across all command groups |
| Accessibility and interaction | 2 | Monochrome-safe, no motion, non-interactive by default, `NO_COLOR` respected as part of the UX phase |
| Source safety | 2 | No copied assets, layouts, or brand marks |

Total score:

- Score: 12 / 14
- Verdict: Strong
- Critical zeroes: None
- Required changes before acceptance: Finish the human-readable output overhaul to lift visual identity and component states to 2.

## Component Direction

| Component | Purpose | States | Accessibility Notes |
| --- | --- | --- | --- |
| Readiness banner | First line of audit/doctor output | pass, warn, fail coloring; monochrome fallback | Level word always printed, never color-only |
| Findings table | Per-area finding with remediation | pass, warn, fail, with remediation sub-line | Two-space indent, no box-drawing characters that break screen readers |
| Conflict notice | Update/init conflict reporting | created, unchanged, conflict, overwritten | Always prints the conflict file path and the review command |
| Studio export page | Local HTML session review | loaded, empty (no sessions), redacted | Semantic HTML, keyboard navigable, no external requests |

## Asset Rules

- Use real command output, file paths, and audit findings when documentation needs examples.
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
- Desktop and mobile screenshots were reviewed (for the studio export and any future docs site).
- Accessibility risks and component states were reviewed.
- Visual QA tier is documented in `TESTING.md` for high-risk UI changes.
- Baseline visual changes are approved intentionally when visual regression tooling exists.
