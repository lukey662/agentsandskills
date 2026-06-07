# Agent Skills Next/Supabase Kit

`@agent-skills/next-supabase-kit` installs an agent operating system for Next.js + Supabase projects.

It gives agentic coders a default council roster, reusable skills, handoff rules, model-routing guidance, markdown docs, frontend design gates, Supabase/RLS security checks, upgrade workflows, and audit commands.

The package answers one practical question:

> Does this project have the setup needed for secure, maintainable, non-generic Next.js + Supabase delivery?

This is not just a prompt bundle. A project gets machine-readable agent routing, model profile routing, schema-backed council evidence, living documentation templates, research-backed quality gates, and CLI checks for drift.

It also includes a local Agent Studio workflow: project context, durable human corrections, append-only session events, and rendered Markdown transcripts that work without a database, web server, background daemon, or separate model API key.

## Quick Start

Use this in a Next.js + Supabase project after the public package is available on npm:

```bash
npx @agent-skills/next-supabase-kit init --stack next-supabase
npx @agent-skills/next-supabase-kit audit
npx @agent-skills/next-supabase-kit audit --min-readiness baseline-setup
```

The installer preserves existing docs. If a file already exists and differs from the template, the new version is written to `.agent-kit/conflicts/` for review.

For local development of this repo:

```bash
npm install
npm run build
npm test
npm run release:check
```

`npm run release:check` is the main pre-release proof command. It typechecks, tests, builds, install-smokes the package, checks examples, runs dependency audit, validates SBOM generation, and dry-runs packaging.

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
- Frontend Design Lead owns content-first design, reference-led critique, distinctiveness benchmarking, product-quality scoring, and visual QA.
- Marketing Copy Lead owns public-facing and conversion-facing copy, positioning, proof, objections, voice, and CTA hierarchy.
- QA Engineer verifies behavior changes before completion.
- Documentation Maintainer keeps the living markdown current.

For meaningful multi-agent work, record the decision, risk, next handoff, required outputs, and verification evidence in `COUNCIL.md` or `.agent-kit/council-sessions/*.json`.

For local Agent Studio sessions, use:

```bash
agent-kit init --guided
agent-kit context validate
agent-kit session start "Build checkout flow" --workflow frontend-change
agent-kit session decision --agent planner --risk "Generic UI risk" "Use frontend-change workflow."
agent-kit session handoff --from planner --to frontend-design-lead --decision "Start design intake." --risk "Generic UI risk."
agent-kit session correct --agent frontend-design-lead --scope project "Keep UI dense and operational."
agent-kit session verify --command "npm test" --result pass --notes "Tests passed."
agent-kit session render
agent-kit correction list
agent-kit studio export
agent-kit audit --json
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
- `agents/`, `skills/`, `prompts/`, and `checklists/`.
- `assistant-adapters/` for Codex/AGENTS.md-compatible tools, GitHub Copilot/VS Code, Cursor, and Claude Code.
- `design-briefs/` for SaaS, admin, marketplace, content, tool, ecommerce, portfolio/venue, education, community/social, and AI workflow surfaces.
- `profiles/` for product-type and adjacent-stack adaptation.

## Everyday Commands

```bash
agent-kit audit
agent-kit audit --json
agent-kit audit --min-readiness baseline-setup
agent-kit context init
agent-kit session start "Short task name"
agent-kit session render
agent-kit correction list
agent-kit studio export
agent-kit diff
agent-kit update
agent-kit add skill frontend-design-system
agent-kit doctor
```

Readiness levels from `agent-kit audit --json`:

- `needs-setup`: required install or council contracts are failing.
- `baseline-setup`: setup is valid, but starter evidence placeholders remain.
- `needs-improvement`: no failures, but warnings remain.
- `best-practice-candidate`: static audit found no failures or warnings.

Use `agent-kit audit --min-readiness <level>` in CI when a project wants a merge or release threshold.

## AI Mechanisms

Agent Kit separates the mechanisms that make AI coding repeatable:

- Instructions: `AGENTS.md`, assistant adapters, and IDE-specific rule files.
- Roster: `.agent-kit/agent-roster.json` chooses agents, workflows, and handoffs.
- Skills: `.agent-kit/skills/` keeps specialist workflows reusable.
- Model routing: `MODEL_ROUTING.md` and `.agent-kit/model-routing.json` map agents to model profiles.
- Messaging: `MESSAGING.md` records audience, pain, outcome, proof, objections, voice, and conversion evidence for public-facing copy.
- Local Agent Studio: `.agent-kit/project-context.*`, `.agent-kit/corrections/*.json`, and `.agent-kit/council-sessions/*` keep context, corrections, decisions, handoffs, artifacts, verification, and rendered Markdown transcripts local.
- Tools and MCP: `ASSISTANT_ADAPTERS.md` records browser, GitHub, Figma, Supabase, docs, or other connector setup.
- Hooks and CI: optional local enforcement plus `agent-kit audit`, tests, install smoke, SBOM, and release gates.

Some IDEs can partially enforce model settings; others only let project files advise the user. The kit records that difference instead of pretending every tool can force per-agent model selection.

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
@agent-skills/next-supabase-kit
```

Release expectations:

- MIT license.
- Public npm access.
- npm Trusted Publishing through GitHub Actions OIDC.
- No long-lived npm publish token for automation.
- Dependency Review, CodeQL, OpenSSF Scorecard, Dependabot, SBOM validation, and SBOM attestation.
- Post-publish verification with `npm run publish:verify`.

Public release remains gated until the npm scope/package exists, Trusted Publishing is configured, and post-publish `npx` verification succeeds.

## Repository Health

The repo includes issue forms, PR template, labels, CODEOWNERS, Dependabot, CodeQL, Dependency Review, OpenSSF Scorecard, `CODE_OF_CONDUCT.md`, `SUPPORT.md`, `GOVERNANCE.md`, `REPOSITORY_SETTINGS.md`, and `SUPPLY_CHAIN.md`.

These files are tested as public-readiness assets so the package can be maintained as public OSS, not just published as a tarball.

## License

MIT.
