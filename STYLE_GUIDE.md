# Style Guide

## Code Style

- Use TypeScript with explicit command and service boundaries.
- Keep CLI handlers thin; put reusable behavior in dedicated modules under `src/`.
- Prefer structured parsing and validation over ad hoc string handling.
- Preserve existing file and command names unless a compatibility break is intentional and documented.

## Markdown Style

- Use clear headings and concise prose.
- Keep operational docs current with release and dogfood evidence.
- Record architectural decisions in `DECISIONS.md` with context, decision, and consequences.
- Keep `ROADMAP.md` short: only the open queue. History lives in `DECISIONS.md` and `CHANGELOG.md`.

## Release Workflow Style

- Release workflows must be deterministic and credential-minimal.
- Publish steps must use npm Trusted Publishing, not bypass-2FA publish tokens.
- Publish steps must scrub inherited npm token state before `npm publish`.
- Private install verification may use a read-only npm token and must fail closed or skip explicitly when the token is absent.
- Dry runs must execute quality gates without requiring npm package credentials.
- Release inspect retries `npm view` so malware-scan staging 404s are less likely to force a republish. Publish treats “Cannot publish over previously staged version” as already published and continues to GitHub release.

## Upgrade Workflow Style

- Treat package, template, renderer, and host-frontmatter updates as reviewable changes.
- `update --dry-run` before `update` when project-owned files may change; `update --prune-legacy --dry-run` before any prune.
- Local edits to managed files win or land in `.agent-kit/conflicts/`; never overwrite them silently.
- Record what each version asks downstream users to do in `UPGRADE.md`, with the exact commands.

## Agent Style

- Planning requests start with Planner. The session launches the named owner with its payload from `AGENTS.md` → Spawn payloads. Planner does not implement. One chat does not impersonate all six.
- The subagent id is the agent id (`app-engineer`, `design`, `qa`, …) on every host. Never map an agent to a council role name; those files are not rendered.
- Edit `agents/<id>/agent.md` and `skills/<id>/SKILL.md` only. Never hand-edit a rendered file under `.cursor/`, `.claude/`, `.codex/`, `.github/agents/`, or `.agents/`; run `npm run dogfood:check` and it will regenerate them. Frontmatter for each host is produced by `src/install/roster-adapters.ts` from the canonical `tools`/`requiredTools` and `catalog.json` `agentSkills`; if a host adds or changes a field, change the renderer and `src/install/host-frontmatter.ts` together.
- Canonical `tools`/`requiredTools` use the kit vocabulary (`repo`, `edit`, `terminal`, `browser`, `screenshot`, `image-review`, `test-runner`). That vocabulary never reaches a Claude file; the renderer maps or omits it.
- Every agent follows the shared ask policy in `AGENTS.md` and lists its own three or four decision-relevant unknowns under `## Ask before acting`. Ask in one message with defaults; proceed on defaults when told to go or when non-interactive. Do not write "wait for an explicit yes" or test for the wording of a yes.
- Agents inline only the QA payload (the gate) and reference the rest by name. Do not paste other agents' payloads into an agent file; `tests/payloads.test.ts` fails on drift from `catalog.json`.
- Public-facing and conversion-facing copy changes route through the Copy agent (`product-copy` then `deslop`). Name Reader / Job / One action / Proof or mark `assumption`. Do not import a marketing catalog.
- A fail-closed tell appears once, in the skill that owns it. Agents point at the skill; they do not restate its list. When a dogfood failure suggests a new rule, add it to the owning skill and to a test, not to every file that mentions the topic.
- Shipped `agents/` and `skills/` are product-neutral. This repo's palette, `USER_GUIDE.html`, and scan provenance live in `DESIGN.md`, `MESSAGING.md`, and `DECISIONS.md`; `tests/no-kit-content.test.ts` enforces it.

## Messaging And Copy Style

- `MESSAGING.md` at the repo root is the voice file for this repo's public words (`USER_GUIDE.html`, `README.md`, CLI text). Keep it current when the guide's Reader, Job, One action, Proof, or voice words change. Downstream products write their own.
- Prefer product-specific nouns, the Reader's language, proof, constraints, and the next action over broad SaaS claims.
- Mark an unknown Reader, Job, action, or proof as `assumption` in the copy instead of hiding the gap behind polished words.
- Run `deslop` on the kit's own prose too. Fragment triads ("Reject X. Reject Y. Always."), colon-led reveals, and em-dash stacks are tells here as much as on a landing page; imperative commands and table cells are not.
- Avoid unsupported superlatives, invented proof, dark patterns, forced urgency, and risky pricing, privacy, security, compliance, performance, medical, financial, or legal claims.

## Design Tokens And States For This Repo

`DESIGN.md` at the repo root is the short design contract for this repo's surfaces (`USER_GUIDE.html`, CLI output, `README.md`): need, who, first-screen job, principles, the charcoal desk tokens, and anti-references. Read it before changing any of those surfaces. Nothing in it is pasted onto a downstream app; the shipped `frontend-design` skill derives tokens from the product instead.

- CLI: semantic ANSI colour with the level word always printed, monochrome when not a TTY or `NO_COLOR`, one blank line between sections, two-space remediation indents, no spinners.
- `USER_GUIDE.html`: self-contained, skip link, safelight `:focus-visible`, `lang` on `<html>`, flat tint wells, no `border-left`. Any change to it needs `browser-qa` desktop and mobile shots under `qa-evidence/`.

## Front-End Guidance For Installed Projects

The installed `frontend-design` skill names a mode (`setup`, `build`, `review`, `detect`) and a surface (`landing`, `app-chrome`, `inside-design-system`) before CSS. Setup is the new-repo path: scan, ask what the user needs with defaults attached, recommend principles, write a short product `DESIGN.md`, no CSS. Build derives the direction in five lines (Object, Field/ink/accent, Type, Structure, Removed) before tokens; the two worked examples are examples, not a menu. Detect is audit-only, and its fail-closed tells (slogan hero over cards over tickets, styled-div screenshots, tracked caps and middle-dot meta, unnamed swap / squint / signature) appear once, in the detect row. Findings are tagged code-certain or inferred and clear problem or judgment call.

The visual fail list lives in `frontend-design`, not in `deslop`. Copy reads the screenshot and hands it to Design; Design fixes pixels. The rules below are this repo's summary of that list for reviewers.

### Anti-Slop UI Rules

Do not use generic AI-slop treatments as a substitute for product design. If a mature brand system intentionally uses one of these patterns, record the exception and rationale in `DESIGN.md`.

- No accent-border cards or left rails. Replace thick, high-contrast, one-sided colored borders (especially a left-edge stroke on selected rows, list items, cards, or success/error/warn wells), glow rails, neon strokes, and gradient borders with radio/check + light row tint, typography/weight, restrained 1px full-border surfaces, or a flat tint fill. Keep one accent for the primary CTA, not as a row edge.
- No gradient-as-design. Replace generic purple-blue gradient heroes, gradient text, and gradient blobs with product-specific imagery, workflow screenshots, object-focused media, real content, or a quiet tokenized background.
- No card soup. Replace large grids of decorative cards with task-first layouts: tables, lists, timelines, forms, split panes, dashboards with real hierarchy, or workflow-specific grouped sections.
- No fake dashboard proof. Replace invented metrics, placeholder charts, and claims like "98% faster" with real product data, honest sample labels, empty states, or "connect data to view this" states.
- No vague SaaS sayings. Replace phrases like "supercharge your workflow", "unlock insights", "seamless collaboration", or "AI-powered productivity" with concrete user actions, product nouns, constraints, and outcomes the product actually supports.
- No badge or confetti credibility. Replace decorative badges, pills, stars, awards, or "trusted by" placeholders with real proof, integration names, security posture, support details, or omit the section.
- No oversized rounded glass panels. Replace translucent blur cards, frosted panels, and soft-glow shells with normal surfaces, clear section boundaries, practical density, and brand-appropriate depth.
- No ornamental icon walls. Replace generic floating icons with functional icons attached to commands, states, navigation, feature rows, or concrete workflow steps.
- No layout filler sections. Replace generic "features", "benefits", or "how it works" sections when the user asked for an app or tool with the actual usable workflow as the first screen.
- No inaccessible decorative state styling. Replace color-only alerts, low-contrast tints, and vague status panels with semantic text, icons, ARIA-compatible state, WCAG AA contrast, and recovery actions. User-facing screens also need a keyboard-only pass (`accessibility-wcag`); do not sign off contrast from a screenshot.
