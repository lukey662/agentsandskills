# Messaging And Copy

This file is the persistent positioning, value proposition, voice, and copy-evidence contract for agents and reviewers.

Use it before writing or changing public-facing pages, onboarding, empty states, pricing, upgrade prompts, CTAs, lifecycle emails, notifications, or conversion-critical UX copy. For this repo, the public surfaces are `README.md`, npm package metadata, CLI help/output text, and GitHub repository copy.

## Discovery Questions

Answer these before final copy is accepted. If an answer is unknown, mark it as unknown and treat the copy as provisional.

| Question | Current Answer | Evidence |
| --- | --- | --- |
| Who is the primary audience? | Engineers and AI coding agents building Next.js + Supabase products who want structured agent roles, quality gates, and living docs installed into their repos. | Package description, `README.md`, `.agent-kit/project-context.json` |
| What painful, expensive, slow, risky, or annoying problem do they need solved? | AI-assisted projects collapse into one vague assistant with no security review, no design discipline, no documentation trail, and unreviewable output. | Research corpus under `research/summaries/`, dogfood audits in `DOGFOOD.md` |
| What outcome do they want? | Repeatable, auditable agent delivery: every change gets planning, architecture, security, QA, and docs coverage without manual policing. | `QUALITY_GATES.md` maturity model, audit readiness levels |
| What alternatives do they use today? | Hand-written CLAUDE.md/AGENTS.md files, ad hoc prompt folders, copy-pasted cursor rules, or nothing. | `research/findings/` per-repo scans |
| Why is this product meaningfully different? | It is installable, auditable, and upgradeable: one command installs the full operating system, `agent-kit audit` proves setup validity in CI, and `agent-kit update` upgrades without destroying local customizations. | `src/install/`, `tests/audit.test.ts`, smoke-install regression fixture |
| What proof supports the claim? | Vitest suites plus smoke scripts gate every release; this repo dogfoods its own kit (see `COUNCIL.md`, `.agent-kit/`); supply chain uses Trusted Publishing, SBOM, CodeQL, and Scorecard. | `scripts/release-check.mjs`, `.github/workflows/` |
| What objections could stop signup, activation, or purchase? | Package not yet published to npm; only one stack profile; enforcement is advisory (docs and CI gates, not runtime orchestration). | `PUBLIC_RELEASE_REVIEW.md`, `RUNTIME_ORCHESTRATION_SCOPE.md` |
| What action should the user take next? | Run `npx @appsforgood/next-supabase-kit init --stack next-supabase` in their project, then `agent-kit audit`. | `README.md` quick start |

## Positioning

One-sentence positioning statement:

> For engineers shipping Next.js + Supabase products with AI coding agents who need auditable, repeatable delivery quality, this product is an installable agent operating system that turns agent roles, security review, design discipline, and living docs into one command plus a CI-gateable audit, unlike hand-maintained prompt files that drift and cannot be verified.

Primary value proposition:

- Install a complete, auditable agent operating system into a Next.js + Supabase repo with one command, and keep it upgradeable without losing local customizations.

Secondary value propositions:

- CI-gateable readiness: `agent-kit audit --min-readiness` turns agent-setup quality into a merge gate.
- Local-first evidence: council sessions, corrections, and context live in files, with no database, daemon, or API keys.

Non-goals and claims to avoid:

- Do not claim runtime LLM orchestration or model enforcement; the kit is file- and CLI-based and enforcement is advisory.
- Do not claim npm availability until the first publish is verified.
- Do not use unsupported superlatives ("the best", "10x") or invented adoption numbers.

## Proof And Objections

| Claim | Proof Required | Current Proof | Status |
| --- | --- | --- | --- |
| Install without overwriting local docs | Regression test of upgrade path | `scripts/smoke-install.mjs` older-install fixture, `tests/update.test.ts` | Proven |
| Audit is CI-gateable | CI job using the gate | `.github/workflows/ci.yml` runs `smoke:audit-gate` with `--min-readiness baseline-setup` | Proven |
| Supply-chain hardened release | Workflow evidence | `release.yml` Trusted Publishing/OIDC, SBOM attestation, `post-publish-verify.mjs` | Proven (pending first publish) |
| Kit works on real projects | Dogfood evidence | `DOGFOOD.md` downstream audits and this repo's own install | Partial (this repo plus read-only downstream audits) |

| Objection | Response | Evidence Or Product Support |
| --- | --- | --- |
| "Not on npm yet" | First publish is the tracked release blocker; everything else is release-gated and green. | `PUBLIC_RELEASE_REVIEW.md` |
| "Only Next.js + Supabase" | Stack profiles are pluggable; a second profile is on the roadmap to prove the abstraction. | `ROADMAP.md`, `profiles/` |
| "It is just markdown" | The CLI enforces structure: schema-backed contracts, hash-tracked templates, audit findings, and conflict-safe updates. | `schemas/`, `src/install/audit.ts` |

## Voice And Tone

| Area | Decision |
| --- | --- |
| Voice traits | Direct, technical, evidence-led, calm, practical |
| Words to use | install, audit, readiness, council, handoff, evidence, conflict-safe, local-first, Trusted Publishing |
| Words to avoid | revolutionize, supercharge, AI-powered magic, 10x, enterprise-grade (unsupported), any invented metrics |
| Error tone | Clear cause, useful recovery command, no blame |
| Security/privacy tone | Specific and factual: local files only, no telemetry, tokens stay in env vars |
| Pricing/upgrade tone | Free and MIT-licensed; upgrade guidance is versioned and reviewable |

## Page And Flow Copy Inventory

| Surface | Goal | Primary Message | Primary CTA | Secondary CTA | Proof | Objections |
| --- | --- | --- | --- | --- | --- | --- |
| README hero | Get an engineer to try init | Install an auditable agent operating system in one command | `npx @appsforgood/next-supabase-kit init` | Read `DOCS.md` | CI badges, audit output sample | Not published yet: mark quick start as pending first publish |
| npm package page | Establish trust at a glance | Same as README hero, with provenance badge | Install command | Repository link | Trusted Publishing provenance | Version 0.x maturity |
| CLI `--help` and errors | Keep users unblocked | Each command states what it does and what to run next | Suggested next command in error text | `agent-kit doctor` | Exit codes documented in `SPEC.md` | None |
| Audit output | Convert findings into action | Readiness level plus prioritized next actions | Remediation line per finding | `agent-kit audit --json` | Deterministic findings | Warning fatigue: cap next actions at five |

## Acceptance Evidence

Copy work is not accepted until:

- Discovery questions are answered or explicitly marked unknown.
- Audience, pain, outcome, differentiator, proof, objections, voice, and conversion goal are documented.
- Claims are tied to proof or marked as assumptions.
- CTA hierarchy has one primary action and clear secondary actions.
- Onboarding, empty, error, permission, and upgrade copy provides a useful next step.
- Marketing Copy Lead has handed off public-facing pages to Frontend Design Lead for layout and hierarchy review.
- Risky claims are reviewed before release.
