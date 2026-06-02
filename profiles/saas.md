# SaaS Compatibility Profile

Use for subscription products, team workspaces, and account-based apps.

## Required Emphasis

- Tenant isolation, role-based access, team membership, billing state, and usage limits.
- RLS policies for tenant-owned data and user-owned preferences.
- Trial, upgrade, downgrade, cancellation, and past-due UX.
- Smoke tests for signup, login, workspace creation, billing gates, and primary workflow.

## Agent Handoff

- Architect owns tenant boundaries and subscription model.
- Supabase/Postgres engineer owns membership schema, RLS, migrations, and seed data.
- Security reviewer owns IDOR, service-role isolation, webhook validation, and dependency exposure.
- Frontend design lead owns density, state coverage, and non-generic product surfaces.
