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
   - Design: `frontend-design` (name build, review, or detect)
   - QA: `browser-qa` (screens) and `testing-qa` (commands)
   - Copy: `product-copy` then `deslop` last
4. Add extra reviewers: Security for auth/data/secrets, Design for UI, QA for behavior/UI, Copy for public words.
5. If the change is user-visible, list the desktop and mobile screenshots QA must capture.

## Done when

Owner, extra reviewers, required skills, preserved behavior, and required screenshots are explicit. No product code was written.

## Reject

Implementing in the planning pass. Asking one chat to play every role. Skipping `supabase-auth-rls` because “it’s just a table.” Skipping `nextjs-app-router` because the route is small.
