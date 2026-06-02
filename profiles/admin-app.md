# Admin App Compatibility Profile

Use for internal operations consoles, support tools, moderation systems, and analytics back offices.

## Required Emphasis

- Least-privilege admin access, audit logs, impersonation controls, and destructive-action review.
- RLS and server-side authorization for admin-only data and actions.
- Clear stale-data, partial-data, rate-limit, and permission-denied states.
- Smoke tests for admin login, core queue processing, audit logging, and access control.

## Agent Handoff

- Architect owns admin boundaries and workflow invariants.
- Supabase/Postgres engineer owns policy bypass strategy, audit tables, and queue schema.
- Security reviewer owns privilege escalation, logging integrity, service-role use, and secrets.
- Frontend design lead owns dense scanning, filters, bulk actions, and safe destructive flows.
