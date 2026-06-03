# Best-Practice Maturity Review

Use this skill when deciding whether a project, feature, release, or repository setup is baseline, strong, or best-practice ready.

## Required Inputs

- Current request, roadmap item, or release scope.
- `QUALITY_GATES.md`.
- Relevant `SPEC.md`, `DECISIONS.md`, `SECURITY.md`, `DESIGN.md`, `TESTING.md`, and `DEPLOYMENT.md` sections.
- Current council workflow from `.agent-kit/agent-roster.json`.

## Review Steps

1. Classify the target maturity level: baseline, strong, or best-practice.
2. Map affected areas: council, architecture, Supabase/RLS, security, frontend, accessibility, testing, release, docs, and repo health.
3. Name the evidence required for each affected area.
4. Treat missing evidence as incomplete, not as a pass with caveats.
5. Promote repeated research or dogfood findings into templates, skills, checklists, audit checks, tests, release gates, or `DECISIONS.md`.

## Output

- Maturity level claimed.
- Missing evidence by area.
- Required council handoffs.
- Verification commands or artifacts.
- Docs that must be updated before the work is considered done.
