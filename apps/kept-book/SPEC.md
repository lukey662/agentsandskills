# Spec — Kept Book

Private household cookbook: invite-only kitchen, recipe cards, print PDF. Gelato hardcover is documented and key-gated, not a live checkout in this pass.

## Current behavior

- Open a kitchen (name + your name) or join with an 8-character invite.
- Session is an httpOnly HMAC cookie (`kept_book`). `SESSION_SECRET` required in production.
- Recipes: title, from whom, course, story, servings, ingredients, steps, notes.
- Household isolation: recipe ids from kitchen A do not load in kitchen B (`notFound`).
- Book: cover title, dedication, print preview, PDF download.
- File store: `.data/box.json` (local) or `/tmp/kept-book` (Vercel). Not durable across instances.
- SQL + RLS in `supabase/migrations/` for the Supabase move.

## Out of this pass

- Live Gelato order API (needs public PDF URL + key + address)
- Photo / card scan uploads
- Supabase Auth wired to the UI
- Public recipe SEO

## Auth note

Cookie membership is the demo tenancy. The migration uses `auth.uid()` and `open_household` / `join_household`. Do not ship the file store as the production heirloom.
