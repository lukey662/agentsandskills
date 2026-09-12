---
name: planning
description: Classify work, pick an owner, and name the evidence QA must capture. Use when the request is ambiguous, cross-layer, or needs a specialist.
---

# Planning

## Use when

Planning, roadmaps, “what should we do,” or any request that needs an owner.

## Steps

1. Read enough of the repo to name affected routes, tables, and auth boundaries.
2. Pick one owner: `app-engineer`, `security`, `design`, `qa`, or `copy`.
3. Name the skill that owner must run first:
   - App engineer: `nextjs-app-router` and, if data/auth, `supabase-auth-rls` / `postgres-migrations`
   - Security: `owasp-security-review` + `supabase-auth-rls`
   - Design: `frontend-design` (name setup, build, review, or detect) and, for screens, `accessibility-wcag`
   - QA: `browser-qa` (screens), `testing-qa` (commands), and `accessibility-wcag` for user-facing screens
   - Copy: `product-copy` then `deslop` last
4. If the work is user-visible and `DESIGN.md` is missing, TBD, or the user asked for a style guide / principles: owner is Design in `setup` first. Design must ask what they need before inventing tokens. Do not let App engineer invent tokens.
5. Add extra reviewers: Security for auth/data/secrets, Design for UI, QA for behavior/UI, Copy for public words.
6. If the change is user-visible, list the desktop and mobile screenshots QA must capture. Setup may skip screenshots when nothing can render yet.

## Done when

Owner, extra reviewers, required skills, preserved behavior, and required screenshots are explicit. No product code was written.

## Reject

Implementing in the planning pass. Asking one chat to play every role. Skipping `supabase-auth-rls` because “it’s just a table.” Skipping `nextjs-app-router` because the route is small. Skipping Design `setup` on a new product UI because “we’ll pick colors in CSS.” Skipping `accessibility-wcag` because “contrast looks fine in the screenshot.”
