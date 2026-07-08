# Agent Skills Next/Supabase Kit

[![CI](https://github.com/lukey662/agentsandskills/actions/workflows/ci.yml/badge.svg)](https://github.com/lukey662/agentsandskills/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/%40appsforgood%2Fnext-supabase-kit)](https://www.npmjs.com/package/@appsforgood/next-supabase-kit)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/lukey662/agentsandskills/badge)](https://scorecard.dev/viewer/?uri=github.com/lukey662/agentsandskills)
[![CodeQL](https://github.com/lukey662/agentsandskills/actions/workflows/codeql.yml/badge.svg)](https://github.com/lukey662/agentsandskills/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`@appsforgood/next-supabase-kit` installs an agent operating system for Next.js + Supabase projects.

It gives agentic coders a default council roster, reusable skills, handoff rules, model-routing guidance, markdown docs, frontend design gates, Supabase/RLS security checks, upgrade workflows, and audit commands.

The package answers one practical question:

> Does this project have the setup needed for secure, maintainable, non-generic Next.js + Supabase delivery?

This is not just a prompt bundle. A project gets machine-readable agent routing, model profile routing, schema-backed council evidence, living documentation templates, research-backed quality gates, and CLI checks for drift.

It also includes a local Agent Studio workflow: project context, durable human corrections, append-only session events, and rendered Markdown transcripts that work without a database, web server, background daemon, or separate model API key.

## Quick Start

Use this in a Next.js + Supabase project (latest published: **v0.1.8** on npm; `main` is preparing **v0.1.9**):

```bash
npx @appsforgood/next-supabase-kit@0.1.8 init --stack next-supabase --setup --open
npx @appsforgood/next-supabase-kit audit
npx @appsforgood/next-supabase-kit audit --min-readiness baseline-setup
```

After install, the **Agent Office** setup view teaches agents about your project (~10 min). Resume anytime:

```bash
npx @appsforgood/next-supabase-kit setup --open
npx @appsforgood/next-supabase-kit setup --status
```

Promote IDE/runtime adapters after install:

```bash
npx @appsforgood/next-supabase-kit init --activate cursor --activate antigravity
npx @appsforgood/next-supabase-kit adapter validate all
```

The installer preserves existing docs. If a file already exists and differs from the template, the new version is written to `.agent-kit/conflicts/` for review.

### See It In Action

```text
$ agent-kit init --stack next-supabase
agent-kit installed (stack: next-supabase)
Created (21)
  AGENTS.md
  AGENT_ROSTER.md
  ASSISTANT_ADAPTERS.md
  ...
  .cursor/rules/cursor-agent-kit.mdc
  .agent-kit/agent-roster.json
  .agent-kit/model-routing.json

Manifest: .agent-kit/manifest.json
Next: run agent-kit audit to check readiness.

$ agent-kit audit
READINESS baseline-setup: Agent kit setup is valid, but project-specific
evidence still needs to replace starter placeholders.
SUMMARY pass=60 warn=3 fail=0
NEXT ACTIONS
- Run agent-kit onboard or agent-kit init --guided so agents can start
  with project-specific context.
```

Every command accepts `--json` for machine-readable output, and mutating commands (`init`, `update`, `add skill`) accept `--dry-run`. A `vhs` tape for regenerating the animated demo lives at `docs/demo.tape`.

For local development of this repo:

```bash
npm install
npm run build
npm test
npm run release:check
```

`npm run release:check` is the main pre-release proof command. It typechecks, tests, builds, install-smokes the package, checks examples, runs dependency audit, validates SBOM generation, and dry-runs packaging.

## Workflow Commands

Twenty slash commands map to the delivery lifecycle. Each one activates the right council agents and skills automatically. Use them in Antigravity after `init --activate antigravity`, or as prompt prefixes in any IDE. Canonical workflow steps live in `.agent-kit/prompts/lifecycle-command-index.md` (delivery) and `.agent-kit/prompts/ui-command-index.md` (UI polish).

```text
SETUP → SPEC/PLAN → BUILD → VERIFY → REVIEW → SHIP
```

**Workflow commands** (`/setup`, `/spec`, …) are runtime adapters. **Package CLI** commands (`agent-kit init`, `audit`, `session`, …) are documented under [CLI Reference](#cli-reference) below. Cursor loads rules and skills from `init`; Antigravity gets native slash commands from `init --activate antigravity`. See `ASSISTANT_ADAPTERS.md` for per-IDE setup.

### Core lifecycle commands

| What you're doing | Command | Key principle | Skills / council |
| --- | --- | --- | --- |
| Onboard project context | `/setup` | Context before code | Agent Office, project-context |
| Define what to build | `/spec` | Spec before code | Planner, docs-maintainer |
| Plan how to build it | `/plan` | Council before implementation | planning-council, lead-architect |
| Route between agents | `/handoff` | Explicit handoffs | agent-handoff-tracing |
| Build frontend/UI | `/frontend` | Content-first design | frontend-design-lead skills |
| Check kit readiness | `/audit` | Evidence before claims | best-practice-maturity-review |
| Prove behavior | `/test` | Tests are proof | testing-qa, qa-engineer |
| Review before merge | `/review` | Improve code health | qa-engineer + security-reviewer |
| Security signoff | `/security` | RLS at the boundary | owasp-security-review, supabase-auth-rls |
| Public copy | `/copy` | Proof before publish | marketing-copy-lead |
| Ship release | `/ship` | Faster is safer | deployment-observability, release gates |
| Upgrade kit/deps | `/upgrade` | Diff before overwrite | upgrade-maintenance |

### UI harness commands

Focused UI improvement commands. Full steps: `.agent-kit/prompts/ui-command-index.md`.

| What you're doing | Command | Key principle |
| --- | --- | --- |
| Audit UI before release | `/ui-audit` | Detect before ship |
| Improve visual quality | `/ui-polish` | Scope-safe polish |
| Repair layout structure | `/layout-cleanup` | Hierarchy over decoration |
| Fix responsive behavior | `/responsive-cleanup` | Mobile is not an afterthought |
| WCAG 2.1 AA pass | `/accessibility-pass` | Keyboard and contrast matter |
| Prove product distinctiveness | `/distinctiveness-pass` | Not interchangeable SaaS |
| Critique screenshots | `/screenshot-critique` | Evidence over opinion |
| Live browser QA loop | `/browser-qa` | Measure in the real UI |

Skills activate from task keywords and roster `defaultFor` tags—for example, schema/RLS work routes to **Supabase/Postgres Engineer** with `supabase-auth-rls` and `postgres-migrations`; App Router work routes to **Next.js Engineer** with `nextjs-app-router`. See `SKILLS.md` and `.agent-kit/agent-roster.json`.

### Council

| Agent | Owns | Key skills |
| --- | --- | --- |
| Planner | Scope, roadmap, ambiguous requests | planning-council, agent-handoff-tracing |
| Lead Architect | Core and cross-layer changes | nextjs-app-router, supabase-auth-rls, owasp-security-review |
| Supabase/Postgres Engineer | Schema, migrations, RLS, auth | supabase-auth-rls, postgres-migrations |
| Next.js Engineer | App Router, Server Actions, UI state | nextjs-app-router, frontend-design-system |
| Frontend Design Lead | Design gates, visual QA, anti-generic UI | content-first-design, ui-improvement-harness |
| Marketing Copy Lead | Positioning, conversion copy, CTAs | positioning-messaging, conversion-copywriting |
| Security Reviewer | OWASP, auth boundaries, secrets | owasp-security-review, supabase-auth-rls |
| QA Engineer | Tests, regression, acceptance evidence | testing-qa, visual-regression-qa |
| Documentation Maintainer | Living docs, spec, decisions | docs-maintainer, planning-council |
| Deployment/Observability Engineer | Release, rollback, monitoring | deployment-observability |

### Skills by lifecycle phase

Full skill list: `SKILLS.md`.

**Define:** planning-council, agent-handoff-tracing, best-practice-maturity-review, docs-maintainer

**Build:** nextjs-app-router, supabase-auth-rls, postgres-migrations, content-first-design, frontend-design-system, ui-improvement-harness, positioning-messaging

**Verify:** testing-qa, visual-regression-qa, owasp-security-review, accessibility-wcag, reference-led-design-critique, frontend-product-quality-rubric

**Ship:** deployment-observability, upgrade-maintenance

### How skills work

- **Canonical skills** live in `.agent-kit/skills/` as markdown checklists agents load for a task type.
- **Runtime wrappers** in `runtime-skills/*/SKILL.md` expose the same content to Antigravity and other skill-directory runtimes.
- **Roster routing** in `.agent-kit/agent-roster.json` maps `defaultFor` keywords and workflows to agents and their default skill sets—slash commands and natural-language requests both use the same contract.

## How Agentic Coders Should Use It

Start with the installed files:

- `AGENTS.md`: the high-level operating instructions.
- `.agent-kit/agent-roster.json`: the machine-readable source of truth for agent routing.
- `AGENT_ROSTER.md`: the human-readable roster summary.
- `SKILLS.md`: when each reusable skill should be used.
- `MODEL_ROUTING.md`: model-profile guidance for each agent and IDE.
- `QUALITY_GATES.md`: what separates baseline setup, strong delivery, and best-practice evidence.
- `DESIGN.md`: the frontend design and content contract.
- `MESSAGING.md`: the positioning, value proposition, proof, objections, voice, and CTA contract.
- `COUNCIL.md`: where meaningful handoffs and decisions are recorded.

Default routing:

- Planner handles plans, roadmaps, scope, and ambiguous requests first.
- Lead Architect reviews core changes before implementation.
- Security Reviewer joins auth, RLS, data mutation, dependency, secret, external-call, and release-risk work.
- Frontend Design Lead owns content-first design, reference-led critique, distinctiveness benchmarking, product-quality scoring, UI detector severity review, command-based polish/audit loops, and visual QA.
- Marketing Copy Lead owns public-facing and conversion-facing copy, positioning, proof, objections, voice, and CTA hierarchy.
- QA Engineer verifies behavior changes before completion.
- Documentation Maintainer keeps the living markdown current.

For meaningful multi-agent work, record the decision, risk, next handoff, required outputs, and verification evidence in `COUNCIL.md` or `.agent-kit/council-sessions/*.json`.

## CLI Reference

Every command accepts `--json` for machine-readable output. Mutating commands (`init`, `update`, `add skill`, `correction apply`) also accept `--dry-run`.

### Install and upgrade

| Command | Purpose |
| --- | --- |
| `init` | Install docs, roster, skills, schemas, Cursor rules, and project context |
| `diff` | Compare local docs against bundled templates |
| `update` | Hash-aware upgrade: pristine docs refresh, local edits kept, conflicts for review |
| `add skill <name>` | Copy one skill into `.agent-kit/skills/` |
| `onboard` | Print the recommended first-run checklist |

```bash
agent-kit init --stack next-supabase --guided --dry-run
agent-kit init --activate cursor --activate codex --no-setup
agent-kit diff
agent-kit update --dry-run
agent-kit add skill ui-improvement-harness
```

`init` flags: `--stack`, `--guided`, `--dry-run`, `--activate <targets...>`, `--setup`, `--no-setup`, `--open`, `--force`, `--json`.  
`update` flags: `--dry-run`, `--force`, `--json`.

### Setup and Agent Office

| Command | Purpose |
| --- | --- |
| `setup` | Serve local Agent Office (default) and form wizard at `http://127.0.0.1:9321` |
| `setup --status` | Print onboarding progress as JSON |

Routes: `/` or `/office` (pixel office, default), `/wizard` (form fallback).

```bash
agent-kit setup --open
agent-kit setup --status
```

### Audit and validation

| Command | Purpose |
| --- | --- |
| `audit` | Readiness report with pass/warn/fail findings |
| `doctor` | Validate CLI runtime prerequisites |
| `adapter validate [target]` | Validate IDE/runtime adapter assets (`cursor`, `claude`, `codex`, `copilot`, `antigravity`, `all`) |
| `package validate` | Source-repo release asset validation (maintainers) |

```bash
agent-kit audit --json --min-readiness baseline-setup
agent-kit adapter validate cursor
agent-kit doctor --json
```

Readiness levels: `needs-setup`, `baseline-setup`, `needs-improvement`, `best-practice-candidate`. Use `--min-readiness <level>` in CI.

### Project context

| Command | Purpose |
| --- | --- |
| `context init` | Create or refresh `.agent-kit/project-context.json` |
| `context scan` | Print inferred context without writing |
| `context ask` | List unanswered high-value context questions |
| `context render` | Render `.agent-kit/project-context.md` |
| `context validate` | Validate context against schema |
| `context show` | Print current context JSON |

```bash
agent-kit context init
agent-kit context validate
```

### Council sessions

| Command | Purpose |
| --- | --- |
| `session start` | Open a council session with workflow routing |
| `session list` / `session active` | Inspect sessions |
| `session note` / `decision` / `handoff` | Record collaboration events |
| `session correct` / `artifact` / `verify` / `output` | Record corrections, files, checks, required outputs |
| `session checkpoint` | Batch-apply events from a JSON file |
| `session render` / `session close` | Render Markdown and close the session |

```bash
agent-kit session start "Build checkout flow" --workflow frontend-change
agent-kit session handoff --from planner --to frontend-design-lead --decision "Start design intake." --risk "Generic UI risk."
agent-kit session verify --command "npm test" --result pass --notes "Tests passed."
agent-kit session output "visual QA evidence" --status not-applicable --evidence "No UI change."
agent-kit session checkpoint --file .agent-kit/checkpoint.json
agent-kit session render
agent-kit session close --status complete
```

### Corrections

| Command | Purpose |
| --- | --- |
| `correction list` | List durable project and agent correction rules |
| `correction add` | Add a correction (`--scope project\|agent\|session`) |
| `correction apply` | Promote a correction into active rules |
| `correction retire` | Retire a correction with reason |
| `correction propose-upstream` | Flag a correction for kit promotion |

```bash
agent-kit correction add --scope project "Prefer operational density over hero-style marketing layout."
agent-kit correction apply --id project-ui-density
```

### Studio views

| Command | Purpose |
| --- | --- |
| `studio export` | Generate self-contained static HTML at `.agent-kit/studio/index.html` |
| `studio serve` | Live localhost Agent Office with SSE session events (default port `9331`) |

```bash
agent-kit studio export
agent-kit studio serve --open
```

### Research (maintainers)

Requires `GITHUB_TOKEN` in the environment.

```bash
agent-kit research discover --limit 100
agent-kit research scan
agent-kit research summarize
agent-kit research propose-updates
```

## What Gets Installed

Root markdown docs:

```text
AGENTS.md
AGENT_ROSTER.md
ASSISTANT_ADAPTERS.md
COUNCIL.md
SKILLS.md
SPEC.md
DECISIONS.md
DOCS.md
DESIGN.md
MESSAGING.md
MODEL_ROUTING.md
QUALITY_GATES.md
STYLE_GUIDE.md
SECURITY.md
TESTING.md
DEPLOYMENT.md
UPGRADE.md
```

The `.agent-kit/` folder includes:

- `agent-roster.json` for default workflow routing.
- `model-routing.json` for provider-neutral model profile routing.
- `project-context.json`, `project-context.md`, `corrections/`, and `council-sessions/` for local Agent Studio context, correction rules, session events, and rendered transcripts.
- `schemas/` for agent roster, council-session, model-routing, project context, correction rules, session events, studio sessions, and audit-report contracts.
- `agents/`, `skills/`, `runtime-skills/`, `prompts/`, and `checklists/`.
- `assistant-adapters/` for Codex/AGENTS.md-compatible tools, GitHub Copilot/VS Code, Cursor, Claude Code, and Antigravity.
- `antigravity/` for native command and plugin assets.
- `design-briefs/` for SaaS, admin, marketplace, content, tool, ecommerce, portfolio/venue, education, community/social, and AI workflow surfaces.
- `profiles/` for product-type and adjacent-stack adaptation.

## AI Mechanisms

Agent Kit separates the mechanisms that make AI coding repeatable:

- Instructions: `AGENTS.md`, assistant adapters, and IDE-specific rule files.
- Roster: `.agent-kit/agent-roster.json` chooses agents, workflows, and handoffs.
- Skills: `.agent-kit/skills/` keeps specialist workflows reusable.
- Runtime commands: Antigravity `commands/*.toml` expose `/setup`, `/spec`, `/audit`, `/plan`, `/handoff`, `/frontend`, `/test`, `/review`, focused UI improvement commands, `/security`, `/copy`, `/ship`, and `/upgrade` as native adapter entrypoints.
- Portable skills: `runtime-skills/*/SKILL.md` wraps canonical `skills/*.md` files for runtimes that discover skill directories.
- Model routing: `MODEL_ROUTING.md` and `.agent-kit/model-routing.json` map agents to model profiles.
- Messaging: `MESSAGING.md` records audience, pain, outcome, proof, objections, voice, and conversion evidence for public-facing copy.
- Local Agent Studio: `.agent-kit/project-context.*`, `.agent-kit/corrections/*.json`, and `.agent-kit/council-sessions/*` keep context, corrections, decisions, handoffs, required-output status, artifacts, verification, and rendered Markdown transcripts local.
- Tools and MCP: `ASSISTANT_ADAPTERS.md` records browser, GitHub, Figma, Supabase, docs, or other connector setup.
- Hooks and CI: optional local enforcement plus `agent-kit audit`, tests, install smoke, SBOM, and release gates.

Some IDEs can partially enforce model settings; others only let project files advise the user. The kit records that difference instead of pretending every tool can force per-agent model selection.

Runtime command files are adapters only. `AGENTS.md`, `.agent-kit/agent-roster.json`, `QUALITY_GATES.md`, and Agent Studio session evidence remain the canonical operating model.

## Frontend Quality Bar

The kit is intentionally strict about frontend work because normal AI output often looks generic.

Significant UI work should prove:

- Brand/content intake and real user needs.
- A selected creative direction, with rejected alternatives.
- Reference lessons and anti-references without copied source designs.
- First-screen proof that the real product task, object, workflow, or content is visible.
- A content fingerprint: real product nouns, labels, data shapes, actions, and edge cases.
- Asset provenance for real, generated, licensed, and placeholder visuals.
- Product-quality scorecard evidence.
- Desktop, mobile, key states, accessibility, and visual QA evidence.

The Frontend Design Lead should reject work that would still look valid for another product after only changing the logo or headline.

Operational UI improvement workflows live in `.agent-kit/prompts/ui-command-index.md` and ship as Antigravity commands: `/ui-audit`, `/ui-polish`, `/layout-cleanup`, `/responsive-cleanup`, `/accessibility-pass`, `/distinctiveness-pass`, `/screenshot-critique`, and `/browser-qa`. Use `.agent-kit/checklists/ui-detectors.md` for deterministic blocker/major/minor findings and `.agent-kit/checklists/ui-acceptance-rubric.md` for pass/fail decisions. High-risk UI work requires desktop and mobile screenshots plus authenticated or permission-state evidence when the surface is not public.

## Security Bar

The kit treats these as defaults, not optional polish:

- OWASP Top 10 review for auth, API, Server Action, external-call, upload, and dependency changes.
- Supabase RLS at the data boundary.
- Service-role keys isolated to trusted server code.
- Input validation and safe output rendering.
- IDOR, SSRF, injection, broken auth, and misconfiguration review.
- Dependency audit before release.

## Updating An Existing Install

Use the upgrade flow instead of overwriting project-owned docs:

```bash
agent-kit diff
agent-kit update --dry-run
agent-kit update
agent-kit audit --min-readiness baseline-setup
```

Document accepted local deviations in `.agent-kit/overrides.json`. Record version changes, conflicts, migration impact, rollback notes, and verification evidence in `UPGRADE.md`.

## Research Evidence

The repo includes a 100-repo research workflow plus focused follow-up summaries.

Research volume does not count as proof by itself. A repeated pattern only becomes part of the kit when it is promoted into installed assets, audit checks, tests, release gates, schemas, workflows, or documented decisions.

Useful evidence files:

- `BEST_PRACTICE_EVIDENCE.md`: maps research signals to enforceable assets and validation paths.
- `research/summaries/`: public-safe research summaries.
- `research/proposed-updates.md`: promoted and future updates.
- `DOGFOOD.md`: public-safe downstream adoption evidence.
- `ROADMAP.md`: the phased done/left tracker.

Research commands:

```bash
export GITHUB_TOKEN=ghp_replace_me
agent-kit research discover --limit 100
agent-kit research scan
agent-kit research summarize
agent-kit research propose-updates
```

Detailed per-repo findings are committed for repository development, but the public npm package ships generalized summaries and promoted decisions only. See `RESEARCH_CITATION_POLICY.md`.

## Public Release And Supply Chain

Public package name:

```text
@appsforgood/next-supabase-kit
```

Release expectations:

- MIT license.
- Public npm access.
- npm Trusted Publishing through GitHub Actions OIDC.
- No long-lived npm publish token for automation.
- Dependency Review, CodeQL, OpenSSF Scorecard, Dependabot, SBOM validation, and SBOM attestation.
- Post-publish verification with `npm run publish:verify`.

The package is published to public npm under `@appsforgood/next-supabase-kit@0.1.8`. Every release must pass `npm run release:check` before publish and `npm run publish:verify` after (registry visibility, clean `npx` doctor/init/audit). Post-publish verification last passed **2026-07-04** against the live registry: `@0.1.8` doctor, clean init, and `audit --min-readiness baseline-setup` with zero failures. Version `0.1.9` is prepared on `main` but is not published until npm MFA or Trusted Publishing configuration allows the release workflow to complete.

## Repository Health

The repo includes issue forms, PR template, labels, CODEOWNERS, Dependabot, CodeQL, Dependency Review, OpenSSF Scorecard, `CODE_OF_CONDUCT.md`, `SUPPORT.md`, `GOVERNANCE.md`, `REPOSITORY_SETTINGS.md`, and `SUPPLY_CHAIN.md`.

These files are tested as public-readiness assets so the package can be maintained as public OSS, not just published as a tarball.

## License

MIT.
