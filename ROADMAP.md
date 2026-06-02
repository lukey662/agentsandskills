# Roadmap And Delivery Tracker

This file tracks the phased work needed to turn the kit into a maintained open-source project standard.

Status legend:

- `[x]` Done
- `[ ]` Not started
- `[~]` In progress or partially complete

## Phase 1: Bootstrap Package Repo

- `[x]` Create TypeScript npm package for `@agent-skills/next-supabase-kit`.
- `[x]` Add `agent-kit` CLI entrypoint.
- `[x]` Add installable asset folders: `templates`, `agents`, `skills`, `prompts`, `checklists`, and `design-adapters`.
- `[x]` Add root docs: `README.md`, `DOCS.md`, `SECURITY.md`, `CONTRIBUTING.md`, and `CHANGELOG.md`.
- `[x]` Initialize local git repo on `main`.
- `[x]` Create initial local commit.
- `[x]` Create GitHub repo `lukey662/agentsandskills`.
- `[x]` Push local `main` to GitHub.

Acceptance:

- Local repo exists, package builds, and remote repo is connected.

## Phase 2: CLI Install, Audit, Diff, And Update

- `[x]` Implement `agent-kit init --stack next-supabase`.
- `[x]` Implement conflict-safe template writes.
- `[x]` Track installed state in `.agent-kit/manifest.json`.
- `[x]` Copy library assets into `.agent-kit/`.
- `[x]` Implement `agent-kit audit`.
- `[x]` Implement `agent-kit diff`.
- `[x]` Implement `agent-kit update`.
- `[x]` Implement `agent-kit add skill <name>`.
- `[x]` Implement `agent-kit doctor`.
- `[x]` Add richer stale-template detection using template hashes.
- `[x]` Add machine-readable audit output with `--json`.

Acceptance:

- Existing projects can install the kit without overwriting local docs.
- Audit reports missing docs, security gaps, frontend-design gaps, and testing gaps.

## Phase 3: Core Templates, Agents, Skills, And Checklists

- `[x]` Add downstream templates for `AGENTS.md`, `AGENT_ROSTER.md`, `SKILLS.md`, `SPEC.md`, `DECISIONS.md`, `DOCS.md`, `STYLE_GUIDE.md`, `SECURITY.md`, `TESTING.md`, and `DEPLOYMENT.md`.
- `[x]` Add core agents: architect, Next.js, Supabase/Postgres, security, frontend design, QA, docs, deployment, and research.
- `[x]` Add core skills: Next.js App Router, Supabase Auth/RLS, Postgres migrations, OWASP review, frontend design, accessibility, testing, docs, and deployment.
- `[x]` Add checklists for OWASP, RLS, frontend quality, accessibility, testing, and deployment.
- `[x]` Add example installed output for a sample Next.js/Supabase project.
- `[x]` Add compatibility profiles for SaaS, marketplace, admin app, and content app.

Acceptance:

- A downstream project receives a practical agent/skills/docs setup that another engineer or agent can use immediately.

## Phase 4: Frontend Design Differentiation

- `[x]` Add anti-generic-AI-site frontend design skill.
- `[x]` Add provider-neutral design adapters for Google Stitch, Claude, Figma, and human designers.
- `[x]` Add frontend-quality checklist.
- `[x]` Add example design briefs for SaaS, admin dashboards, marketplaces, content apps, and tools.
- `[x]` Add audit checks for missing design tokens, missing states, and generic landing-page patterns.
- `[x]` Add screenshot-review prompt for finished UIs.

Acceptance:

- The kit actively prevents generic AI-generated UI defaults and provides reusable design-review workflows.

## Phase 5: 100 Repo Research Engine

- `[x]` Add GitHub research config.
- `[x]` Implement `agent-kit research discover`.
- `[x]` Implement `agent-kit research scan`.
- `[x]` Implement static repo scoring.
- `[x]` Generate per-repo findings.
- `[x]` Generate summary stubs.
- `[x]` Generate proposed update brief.
- `[x]` Run discovery for 100 repositories with `GITHUB_TOKEN`.
- `[x]` Review and curate the final 100-repo candidate list.
- `[x]` Run the 100-repo scan.
- `[x]` Manually review generated findings.
- `[x]` Promote repeated patterns into templates, skills, and checklists.
- `[x]` Record research-backed decisions in `DECISIONS.md` or a research summary.

Acceptance:

- v0.1 recommendations are backed by reviewed findings from 100 active open-source repositories.

## Phase 6: CI, Release, And Package Publishing

- `[x]` Add GitHub Actions workflow.
- `[x]` CI runs `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke:install`, `npm audit --audit-level=moderate`, and `npm pack --dry-run`.
- `[x]` Add public scoped package publishing config.
- `[x]` Configure public npm publishing workflow with Trusted Publishing.
- `[x]` Add release workflow and versioning policy.
- `[x]` Run release workflow dry run and confirm publish step is skipped.
- `[x]` Prepare draft GitHub Release `v0.1.0`.
- `[ ]` Publish public v0.1 package.

Acceptance:

- Every pushed change is verified before release.
- The package can be installed with `npx @agent-skills/next-supabase-kit`.

## Phase 7: Dogfood On Real Projects

- `[x]` Install into one existing Next.js/Supabase project.
- `[x]` Run `agent-kit audit`.
- `[x]` Record gaps that the audit catches.
- `[x]` Improve templates and audit rules based on real project feedback.
- `[x]` Install into a second project to confirm improvements generalize.
- `[x]` Add contribution process for downstream projects to send improvements back to the kit.

Acceptance:

- At least two real projects have installed the kit and contributed improvements back to the base.

## Phase 8: Long-Term Maturity

- `[x]` Add quarterly research refresh workflow.
- `[x]` Add changelog entries tied to research findings.
- `[x]` Add more stack profiles beyond Next.js + Supabase.
- `[x]` Add stronger automation for template diffs and local overrides.
- `[x]` Decide whether and when to open-source the repo.
- `[x]` Complete public release review: license, security, prompts, legal, and third-party citations.

Acceptance:

- The kit becomes a maintained project operating system, not a one-time prompt bundle.

## Current Next Actions

1. Create or claim the npm scope `@agent-skills`.
2. Configure npm Trusted Publishing for package `@agent-skills/next-supabase-kit`: GitHub user `lukey662`, repository `agentsandskills`, workflow `release.yml`, environment `npm-publish`, allowed action `npm publish`.
3. If npm requires the package to exist before trusted publishing can be configured, complete a one-time manual OTP bootstrap publish from the verified `main` checkout.
4. Delete any legacy npm publish secrets after the trusted-publisher path is confirmed.
5. Dispatch the `Release` workflow with `dry_run=false`.
6. Verify public package install with `npx @agent-skills/next-supabase-kit`.
7. Continue Phase 8 maturity work: scheduled research refresh, stronger local override automation, stack expansion, and public-release readiness.

Latest release evidence:

- Package metadata now targets public npm package `@agent-skills/next-supabase-kit`.
- Release workflow uses npm Trusted Publishing/OIDC instead of a long-lived publish token.
- Public install verification uses `npx` without a package token.
- Public release remains blocked until the npm `@agent-skills` scope is created or claimed and post-publish install verification succeeds.

Latest dogfood evidence:

- `/Volumes/Mac eSSD/qrcode`: install created five missing root docs, preserved four existing docs as conflicts, audit returned 15 pass / 7 warn / 0 fail.
- `/Volumes/Mac eSSD/AI news`: install preserved all nine existing root docs as conflicts, audit returned 10 pass / 12 warn / 0 fail.

Latest maturity evidence:

- Quarterly research refresh workflow added at `.github/workflows/research-refresh.yml`.
- Public release review added at `PUBLIC_RELEASE_REVIEW.md`; current decision is public-ready after final npm scope and package publication.
- Stack-adaptation profiles added for Next/Firebase, Next/Postgres, and Remix/Supabase.
- Local override automation added through `.agent-kit/overrides.json`.
- Default agent council routing added through `.agent-kit/agent-roster.json`, Planner, Planning and Agent Council skill, and audit enforcement for architect-led core-change handoffs.
