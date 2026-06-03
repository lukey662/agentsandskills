# Deployment

## Environments

Document each environment:

- Local
- Preview
- Production

## Environment Variables

Document required variables with placeholder examples only.

Required Supabase variables usually include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server-only service-role key when needed

## Migration Order

Before deploying code that depends on database changes:

1. Review migration safety.
2. Apply schema and RLS changes.
3. Verify policies and constraints.
4. Deploy application code.
5. Run smoke tests.

## Observability

Document:

- Application logs
- Supabase logs
- Error reporting
- Cron or background jobs
- Alerting expectations

## Rollback

Document rollback steps for code, database migrations, and environment variable mistakes.

Link upgrade-specific rollback evidence from `UPGRADE.md` when the release includes package, framework, Agent Kit, or migration changes.
