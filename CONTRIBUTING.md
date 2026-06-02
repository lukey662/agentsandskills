# Contributing

This package is private-first. Contributions should improve reusable project setup, not encode one-off project preferences.

## Contribution Rules

- Add or update tests for CLI behavior.
- Keep templates concise and actionable.
- Do not copy source code from researched repositories.
- Cite research findings when promoting a pattern into a core template.
- Keep frontend guidance domain-aware and avoid generic AI-site defaults.
- Keep security guidance aligned with OWASP Top 10 and Supabase RLS practices.

## Research Contributions

When adding a repo finding:

1. Explain why the repo was selected.
2. List strong practices.
3. List weak practices that should not be copied.
4. Identify patterns that affect kit templates, agents, skills, or checklists.

## Release Checklist

- `npm run lint`
- `npm test`
- `npm run build`
- `agent-kit doctor`
- Manual install into a temporary Next.js/Supabase-like project
