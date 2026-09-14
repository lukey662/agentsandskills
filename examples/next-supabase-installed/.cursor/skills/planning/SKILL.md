---
name: planning
description: Classify work, pick an owner, and name the evidence QA must capture. Use when the request is ambiguous, cross-layer, or needs a specialist.
---

# Planning

## Use when

Planning, roadmaps, “what should we do,” or any request that needs an owner.

## Do

1. Read enough of the repo to name affected routes, tables, and auth boundaries.
2. Pick one owner: `app-engineer`, `security`, `design`, `qa`, or `copy`.
3. Name the skill that owner must run first:
   - App engineer: `nextjs-app-router` and, if data/auth, `supabase-auth-rls` / `postgres-migrations`
   - Security: `owasp-security-review` + `supabase-auth-rls`
   - Design: `frontend-design` (name setup, build, review, or detect) and, for screens, `accessibility-wcag`
   - QA: `browser-qa` (screens), `testing-qa` (commands), `accessibility-wcag` for user-facing screens, and `ship` for a release go/no-go
   - Copy: `product-copy` then `deslop` last
4. If the work is user-visible and `DESIGN.md` is missing, TBD, or the user asked for a style guide / principles: owner is Design in `setup` first. Design must ask what they need before inventing tokens. Do not let App engineer invent tokens.
5. Add extra reviewers: Security for auth/data/secrets, Design for UI, QA for behavior/UI, Copy for public words.
6. If the change is user-visible, list the desktop and mobile screenshots QA must capture. Setup may skip screenshots when nothing can render yet.
7. Print paste-ready handoffs. Canonical prompts stay in `USER_GUIDE.md`. Copy them into fenced text blocks. Do not invent a second set.
   - After naming the owner, print one fenced block that owner can run.
   - Print extra fenced blocks for every extra reviewer this plan named.
   - If owner is Design and `DESIGN.md` is missing or TBD: print the Design **setup** prompt, not only the review prompt.
   - If owner is QA, or QA is an extra reviewer: print the screenshot prompt.
   - If the change is a release go/no-go: print the ship prompt.

## Paste (copy from USER_GUIDE)

Owner `app-engineer`:

```text
Implement the plan. Smoke the changed route in the browser before you hand off.
```

Owner `security` (or extra reviewer Security):

```text
Act as the security agent. Review auth, RLS, IDOR, and secrets. Exercise login or denied states in the browser when they are user-visible.
```

Owner `design` when `DESIGN.md` exists (review):

```text
Act as design. Name the mode (setup, build, review, or detect). Review the running UI from screenshots first. Desktop and mobile. Reject generic AI-looking layout.
```

Owner `design` when `DESIGN.md` is missing or TBD (setup):

```text
Act as design. This is a new repo. Scan what is already here, then ask me what we need to set up: who it is for, what they must get done, and what you should produce. Recommend from my answers. Write the style guide and principles with me before any CSS.
```

Owner `qa` or extra reviewer QA:

```text
Do not review code alone. Open the app, capture desktop and mobile screenshots, read the images, then give accept / accept-with-nits / reject.
```

Owner `copy` (or extra reviewer Copy):

```text
Act as the copy agent. Review the rendered words in screenshots, not just strings in source. Run product-copy first, then deslop last. Always.
```

Release go/no-go (print in addition when shipping):

```text
Run ship. Go or no-go. Name env, migration order, rollback, commands run. User-visible needs browser-qa screenshot paths. Reject LGTM, ship it.
```

The reply must contain at least one of those fences so the next specialist can paste without hunting USER_GUIDE.

## Done when

Owner, extra reviewers, required skills, preserved behavior, and required screenshots are explicit. The reply contains at least one fenced text copy-paste block the next specialist can run. No product code was written. You did not run the other agents.

## Reject

Implementing in the planning pass. Finishing without a fenced paste. “Ask @qa next” (or “ask design next”) with no prompt text. Asking one chat to play every role. Skipping `supabase-auth-rls` because “it’s just a table.” Skipping `nextjs-app-router` because the route is small. Skipping Design `setup` on a new product UI because “we’ll pick colors in CSS.” Skipping `accessibility-wcag` because “contrast looks fine in the screenshot.” Skipping `testing-qa` because “we’ll add tests later” on auth/RLS. Skipping `ship` because “LGTM, ship it.”
