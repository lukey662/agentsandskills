# Testing

Testing should be proportional to risk. Auth, data mutations, payments, admin actions, and migrations receive the most coverage.

## Required Test Types

- Unit tests for core logic and edge cases.
- Regression tests for preserved behavior.
- Integration tests for API, Server Actions, and Supabase interactions where practical.
- Playwright smoke tests for auth and critical user workflows.

## Critical Smoke Paths

Define project-specific smoke tests for:

- Login and logout
- Protected route access
- Primary user workflow
- Data creation and update
- Error and empty states
- Mobile navigation

## Security-Focused Tests

Prioritize:

- IDOR attempts
- Cross-tenant access attempts
- Unauthorized API calls
- RLS-protected reads and writes
- Service-role-only operations

## Test Gaps

If test infrastructure does not exist, document the smallest viable setup and the risk of shipping without it.
