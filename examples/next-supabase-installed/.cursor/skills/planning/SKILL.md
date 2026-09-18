---
name: planning
description: Classify work, pick an owner, and name the evidence QA must capture. Use when the request is ambiguous, “what should we do,” who owns this, cross-layer, or needs a specialist.
---

# Planning

## Use when

Planning, roadmaps, “what should we do,” or any request that needs an owner.

## Do

1. Read enough of the repo to name affected routes, tables, and auth boundaries.
2. If who / why now / success / constraint is missing: ask **one** question with an attached guess. Restate **Outcome / User / Why now / Success / Constraint / Out of scope**. Wait for an explicit yes (not “sounds good”). Do not launch the owner from an unconfirmed restatement.
3. Pick one owner: `app-engineer`, `security`, `design`, `qa`, or `copy`.
4. Name the skill that owner must run first:
   - App engineer: `nextjs-app-router` and, if data/auth, `supabase-auth-rls` / `postgres-migrations`
   - Security: `owasp-security-review` + `supabase-auth-rls`
   - Design: `frontend-design` (name setup, build, review, or detect) and, for screens, `accessibility-wcag`
   - QA: `browser-qa` (screens), `testing-qa` (commands), `accessibility-wcag` for user-facing screens, and `ship` for a release go/no-go
   - Copy: `product-copy` then `deslop` last
5. If the work is user-visible and `DESIGN.md` is missing, TBD, or the user asked for a style guide / principles: owner is Design in `setup` first. Design must ask what they need before inventing tokens. Do not let App engineer invent tokens.
6. Add extra reviewers: Security for auth/data/secrets, Design for UI, QA for behavior/UI, Copy for public words.
7. If the change is user-visible, list the desktop and mobile screenshots QA must capture. Setup may skip screenshots when nothing can render yet.
8. Launch the owner. Canonical prompts stay in `USER_GUIDE.md`. Use them as the spawn payload. Do not invent a second set. Do not stop after printing a fence. The current session launches the specialist (Cursor Task / Claude or Codex named agent). Copilot and Antigravity cannot spawn isolated agents: continue in this thread with an explicit “now App engineer” (or the named role) header and the same prompt text.

## Spawn payload (from USER_GUIDE)

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

Release go/no-go (include on the QA launch when shipping):

```text
Run ship. Go or no-go. Name env, migration order, rollback, commands run. User-visible needs browser-qa screenshot paths. Reject LGTM, ship it.
```

The session must launch the owner with that payload. Do not tell the human to copy a fence.

## Done when

Owner, extra reviewers, required skills, preserved behavior, and required screenshots are explicit. Missing who / why now / success / constraint was confirmed with an explicit yes after Outcome / User / Why now / Success / Constraint / Out of scope (or those facts were already in the ask). The session launched the owner with the canonical prompt. No product code was written. You did not impersonate the owner.

## Reject

Implementing in the planning pass. Implementing from an unconfirmed restatement. Treating “sounds good” as a yes. Finishing without launching the owner. Printing a paste and stopping. Asking one chat to play every role. Skipping `supabase-auth-rls` because “it’s just a table.” Skipping `nextjs-app-router` because the route is small. Skipping Design `setup` on a new product UI because “we’ll pick colors in CSS.” Skipping `accessibility-wcag` because “contrast looks fine in the screenshot.” Skipping `testing-qa` because “we’ll add tests later” on auth/RLS. Skipping `ship` because “LGTM, ship it.”
