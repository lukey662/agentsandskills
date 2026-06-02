# Supabase RLS Checklist

- RLS enabled on every user-owned or tenant-owned table.
- Policies exist for each required operation.
- Policies enforce `auth.uid()` or tenant membership.
- Admin policies are explicit and least-privilege.
- Storage buckets have policies.
- Service-role use is isolated to server-only code.
- IDOR attempts are tested.
- Policy assumptions are documented.
