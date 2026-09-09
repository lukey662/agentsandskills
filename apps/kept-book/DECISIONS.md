# Decisions — Kept Book

## 2026-09-09 — In-tree dogfood app, file store first

### Context

The kit needed a real Next.js product to run agents against. Mixbook, ReciScan, and Heirloom Recipe Box already exist; none are a Next.js + this-kit household box. GitHub would not allow this environment to create a second repository.

### Decision

Build **Kept Book** in `apps/kept-book`. Install the kit there. Persist to a JSON file until a Supabase project exists. Ship PDF download now; Gelato stays key-gated and documented.

### Consequences

The npm pack does not include `apps/` (`package.json` `files` is explicit). Kit CI ignores `apps/` for eslint/prettier. Persistence on Vercel is ephemeral. Moving to Supabase means applying `supabase/migrations/` and replacing the file store — do not treat cookie + JSON as the heirloom.
