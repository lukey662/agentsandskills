# AFG Next/Supabase Agent Kit

`@afg/next-supabase-agent-kit` is a private, research-backed npm package for installing agent roles, reusable skills, markdown documentation, frontend design standards, security checklists, and research workflows into Next.js + Supabase projects.

The package is designed to answer one question consistently:

> Does this project have the right setup for secure, maintainable, non-generic Next.js + Supabase delivery?

## Install

```bash
npm install
npm run build
```

## CLI

```bash
agent-kit init --stack next-supabase
agent-kit audit
agent-kit diff
agent-kit update
agent-kit add skill frontend-design-system
agent-kit research discover
agent-kit research scan
agent-kit research summarize
agent-kit doctor
```

## Package Goals

- Install strong default docs: `AGENTS.md`, `SKILLS.md`, `SPEC.md`, `DECISIONS.md`, `DOCS.md`, `STYLE_GUIDE.md`, `SECURITY.md`, `TESTING.md`, and `DEPLOYMENT.md`.
- Enforce clear agent ownership across architecture, Next.js, Supabase/Postgres, security, frontend design, QA, docs, and deployment.
- Make Supabase Auth, SSR, RLS, migrations, service-role isolation, and IDOR prevention first-class setup concerns.
- Prevent generic AI-looking frontend output through a dedicated frontend design skill and provider-neutral design briefs.
- Research 100 high-quality open-source repos and promote repeated best practices into the kit.

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
npx @afg/next-supabase-agent-kit init --stack next-supabase
npx @afg/next-supabase-agent-kit audit
```

The installer preserves existing docs. If a target file already exists and differs from the template, the new template is written to `.agent-kit/conflicts/` unless `--force` is provided.

## Security Position

This kit treats OWASP Top 10 review, Supabase RLS, service-role key isolation, input validation, output encoding, and least-privilege data access as non-negotiable defaults.

## Status

Private v0.1 package. Public release requires license review, prompt review, dependency review, and legal approval for any research citations.
