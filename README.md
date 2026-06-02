# Agent Skills Next/Supabase Kit

`@agent-skills/next-supabase-kit` is an open-source, research-backed npm package for installing agent roles, reusable skills, default council routing, markdown documentation, frontend design standards, security checklists, and research workflows into Next.js + Supabase projects.

The package is designed to answer one question consistently:

> Does this project have the right setup for secure, maintainable, non-generic Next.js + Supabase delivery?

This is more than a prompt bundle: installs include a machine-readable agent council roster, auditable handoff rules, living documentation templates, research-backed setup checks, and CLI enforcement for drift.

## Install

```bash
npm install
npm run build
```

## CLI

```bash
agent-kit init --stack next-supabase
agent-kit audit
agent-kit audit --json
agent-kit diff
agent-kit update
agent-kit add skill frontend-design-system
agent-kit research discover
agent-kit research scan
agent-kit research summarize
agent-kit doctor
```

## Package Goals

- Install strong default docs: `AGENTS.md`, `AGENT_ROSTER.md`, `SKILLS.md`, `SPEC.md`, `DECISIONS.md`, `DOCS.md`, `STYLE_GUIDE.md`, `SECURITY.md`, `TESTING.md`, and `DEPLOYMENT.md`.
- Install a default agent council roster so Planner handles planning, Lead Architect reviews core changes, and specialist agents route to their associated skills by default.
- Enforce clear agent ownership across architecture, Next.js, Supabase/Postgres, security, frontend design, QA, docs, and deployment.
- Make Supabase Auth, SSR, RLS, migrations, service-role isolation, and IDOR prevention first-class setup concerns.
- Prevent generic AI-looking frontend output through a dedicated frontend design skill, provider-neutral design adapters, screenshot review prompts, and product-specific design briefs.
- Provide compatibility profiles for SaaS, marketplaces, admin apps, and content apps.
- Provide stack-adaptation profiles for Next/Firebase, Next/Postgres, and Remix/Supabase.
- Research 100 high-quality open-source repos and promote repeated best practices into the kit.

## Delivery Tracker

Use `ROADMAP.md` as the phased checklist for what is done, what is in progress, and what remains.

## Research Workflow

Set a GitHub token before discovery:

```bash
export GITHUB_TOKEN=ghp_replace_me
agent-kit research discover --limit 100
agent-kit research scan
agent-kit research summarize
agent-kit research propose-updates
```

The scanner uses GitHub API discovery plus shallow clones. It writes repo findings into `research/findings/` and summaries into `research/summaries/`.

## Downstream Project Workflow

From a Next.js + Supabase project:

```bash
npx @agent-skills/next-supabase-kit init --stack next-supabase
npx @agent-skills/next-supabase-kit audit
npx @agent-skills/next-supabase-kit audit --json
```

The installer preserves existing docs. If a target file already exists and differs from the template, the new template is written to `.agent-kit/conflicts/` unless `--force` is provided.
New installs record bundled template hashes in `.agent-kit/manifest.json` so future audits can identify stale template docs, local customizations, and missing manifest metadata.
Accepted local customizations can be documented in `.agent-kit/overrides.json`.
New installs also write `.agent-kit/agent-roster.json`, a machine-readable council contract. `agent-kit audit` fails if required default agents, skill routing, or architect-led core-change handoffs are missing.

See `examples/next-supabase-installed/` for a compact sample of installed output.

## Security Position

This kit treats OWASP Top 10 review, Supabase RLS, service-role key isolation, input validation, output encoding, and least-privilege data access as non-negotiable defaults.

## Research Evidence

Research candidates, findings, summaries, and promoted decisions are tracked in `research/` and `DECISIONS.md`.
Quarterly refresh automation lives in `.github/workflows/research-refresh.yml`.

## Research And Citations

Public package contents include generalized research summaries and promoted decisions, not detailed per-repo findings. See `RESEARCH_CITATION_POLICY.md` for the citation and attribution policy.

## License

MIT.
