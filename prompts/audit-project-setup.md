# Audit Project Setup Prompt

Audit this project's agents, skills, and markdown documentation for a best-practice Next.js + Supabase setup.

Evaluate:

- Agent roles and handoffs
- `.agent-kit/agent-roster.json` default council routing
- Planner default planning workflow and Lead Architect core-change council workflow
- Reusable skills
- Supabase Auth, SSR, RLS, migrations, Storage, and service-role safety
- Next.js App Router architecture
- OWASP Top 10 coverage
- WCAG 2.1 AA frontend standards
- Testing, deployment, observability, and living docs

Output:

1. Verdict: Good setup, Needs minor improvement, or Needs significant improvement.
2. Strengths.
3. Gaps and risks.
4. Phased improvement plan.
5. Markdown files to create or update.
6. Implementation notes if changes are needed.
