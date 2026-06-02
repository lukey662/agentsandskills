# Proposed Agent Kit Updates

Generated after the 100-repo scan on 2026-06-02.

## Repeated Evidence

- 88 of 100 findings had weak or non-discoverable Supabase/Auth/RLS signals.
- 66 of 100 findings had immature agent handoff or AI-workflow signals.
- 57 of 100 findings had weak accessibility signals.
- 54 of 100 findings had implicit or incomplete security expectations.
- Stronger repos consistently exposed docs, CI, validation, component systems, test setup, or explicit review workflows.

## Updates Promoted In This Iteration

- Added package-level `DECISIONS.md`.
- Added RLS policy inventory expectations to `templates/next-supabase/SPEC.md` and `SECURITY.md`.
- Added security control inventory expectations to `templates/next-supabase/SECURITY.md`.
- Added design token and component-state inventory expectations to `STYLE_GUIDE.md` and `SPEC.md`.
- Added CI gate expectations to `TESTING.md`.
- Strengthened frontend-design, Supabase/RLS, accessibility, and testing skills/checklists.
- Added machine-readable agent council routing with Planner-first planning and architect-led core-change handoffs.
- Added public-readiness expectations around MIT licensing, neutral package identity, citation policy, and install smoke.

## Future Updates To Consider

- Re-run dogfood installs after the public package is published.
- Add more stack-specific rosters for non-Supabase stacks.
- Add richer audit severity scoring once more downstream evidence exists.

Do not copy source code from scanned repositories. Adopt only generalized practices with clear rationale.
