# Roadmap And Delivery Tracker

This file tracks the phased work needed to turn the kit into a maintained internal standard.

Status legend:

- `[x]` Done
- `[ ]` Not started
- `[~]` In progress or partially complete

## Phase 1: Bootstrap Package Repo

- `[x]` Create TypeScript npm package for `@afg/next-supabase-agent-kit`.
- `[x]` Add `agent-kit` CLI entrypoint.
- `[x]` Add installable asset folders: `templates`, `agents`, `skills`, `prompts`, `checklists`, and `design-adapters`.
- `[x]` Add root docs: `README.md`, `DOCS.md`, `SECURITY.md`, `CONTRIBUTING.md`, and `CHANGELOG.md`.
- `[x]` Initialize local git repo on `main`.
- `[x]` Create initial local commit.
- `[x]` Create private GitHub repo `lukey662/agentsandskills`.
- `[ ]` Push local `main` to GitHub.

Acceptance:

- Local repo exists, package builds, and remote private repo is connected.

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
- `[ ]` Add richer stale-template detection using template hashes.
- `[ ]` Add machine-readable audit output with `--json`.

Acceptance:

- Existing projects can install the kit without overwriting local docs.
- Audit reports missing docs, security gaps, frontend-design gaps, and testing gaps.

## Phase 3: Core Templates, Agents, Skills, And Checklists

- `[x]` Add downstream templates for `AGENTS.md`, `SKILLS.md`, `SPEC.md`, `DECISIONS.md`, `DOCS.md`, `STYLE_GUIDE.md`, `SECURITY.md`, `TESTING.md`, and `DEPLOYMENT.md`.
- `[x]` Add core agents: architect, Next.js, Supabase/Postgres, security, frontend design, QA, docs, deployment, and research.
- `[x]` Add core skills: Next.js App Router, Supabase Auth/RLS, Postgres migrations, OWASP review, frontend design, accessibility, testing, docs, and deployment.
- `[x]` Add checklists for OWASP, RLS, frontend quality, accessibility, testing, and deployment.
- `[ ]` Add example installed output for a sample Next.js/Supabase project.
- `[ ]` Add compatibility profiles for SaaS, marketplace, admin app, and content app.

Acceptance:

- A downstream project receives a practical agent/skills/docs setup that another engineer or agent can use immediately.

## Phase 4: Frontend Design Differentiation

- `[x]` Add anti-generic-AI-site frontend design skill.
- `[x]` Add provider-neutral design adapters for Google Stitch, Claude, Figma, and human designers.
- `[x]` Add frontend-quality checklist.
- `[ ]` Add example design briefs for SaaS, admin dashboards, marketplaces, content apps, and tools.
- `[ ]` Add audit checks for missing design tokens, missing states, and generic landing-page patterns.
- `[ ]` Add screenshot-review prompt for finished UIs.

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
- `[ ]` Run discovery for 100 repositories with `GITHUB_TOKEN`.
- `[ ]` Review and curate the final 100-repo candidate list.
- `[ ]` Run the 100-repo scan.
- `[ ]` Manually review generated findings.
- `[ ]` Promote repeated patterns into templates, skills, and checklists.
- `[ ]` Record research-backed decisions in `DECISIONS.md` or a research summary.

Acceptance:

- v0.1 recommendations are backed by reviewed findings from 100 active open-source repositories.

## Phase 6: CI, Release, And Package Publishing

- `[ ]` Add GitHub Actions workflow.
- `[ ]` CI runs `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm audit --audit-level=moderate`, and `npm pack --dry-run`.
- `[x]` Add restricted scoped package publishing config.
- `[ ]` Configure GitHub Packages or private npm publishing.
- `[ ]` Add release workflow and versioning policy.
- `[ ]` Publish private v0.1 package.

Acceptance:

- Every pushed change is verified before release.
- The package can be installed with `npx @afg/next-supabase-agent-kit`.

## Phase 7: Dogfood On Real Projects

- `[ ]` Install into one existing Next.js/Supabase project.
- `[ ]` Run `agent-kit audit`.
- `[ ]` Record gaps that the audit catches.
- `[ ]` Improve templates and audit rules based on real project feedback.
- `[ ]` Install into a second project to confirm improvements generalize.
- `[ ]` Add contribution process for downstream projects to send improvements back to the kit.

Acceptance:

- At least two real projects have installed the kit and contributed improvements back to the base.

## Phase 8: Long-Term Maturity

- `[ ]` Add quarterly research refresh workflow.
- `[ ]` Add changelog entries tied to research findings.
- `[ ]` Add more stack profiles beyond Next.js + Supabase.
- `[ ]` Add stronger automation for template diffs and local overrides.
- `[ ]` Decide whether and when to open-source the repo.
- `[ ]` Complete public release review: license, security, prompts, legal, and third-party citations.

Acceptance:

- The kit becomes a maintained project operating system, not a one-time prompt bundle.

## Current Next Actions

1. Push local `main` to `lukey662/agentsandskills`.
2. Add GitHub Actions CI.
3. Run the first 100-repo discovery.
4. Dogfood the installer on one real Next.js/Supabase project.
