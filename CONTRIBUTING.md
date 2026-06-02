# Contributing

Contributions should improve reusable project setup, not encode one-off project preferences.

## Contribution Rules

- Add or update tests for CLI behavior.
- Keep templates concise and actionable.
- Do not copy source code from researched repositories.
- Cite research findings when promoting a pattern into a core template.
- Keep frontend guidance domain-aware and avoid generic AI-site defaults.
- Keep security guidance aligned with OWASP Top 10 and Supabase RLS practices.
- Keep public package contents neutral, reusable, and free of project-specific secrets or proprietary assumptions.

## Research Contributions

When adding a repo finding:

1. Explain why the repo was selected.
2. List strong practices.
3. List weak practices that should not be copied.
4. Identify patterns that affect kit templates, agents, skills, or checklists.

## Downstream Dogfood Contributions

When an existing project installs the kit:

1. Run `agent-kit init --stack next-supabase` without `--force`.
2. Run `agent-kit audit --json` and `agent-kit diff`.
3. Record the project type, created files, conflict files, audit summary, and top gaps in `dogfood/<project>-audit.md`.
4. Promote repeated gaps into this package's templates, skills, checklists, prompts, profiles, or audit rules.
5. Keep project-specific wording in the downstream project unless the pattern generalizes.
6. Re-run package tests and a temporary install smoke test before committing kit changes.

## Release Checklist

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run smoke:install`
- `agent-kit doctor`
- Manual install into a temporary Next.js/Supabase-like project
