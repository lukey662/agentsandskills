---
name: planning
description: Classify work, pick an owner, and name the evidence QA must capture. Use when the request is ambiguous, “what should we do,” who owns this, cross-layer, or needs a specialist.
---

# Planning

## Use when

Planning, roadmaps, “what should we do,” or any request that needs an owner.

## Do

1. Read enough of the repo to name affected routes, tables, and auth boundaries. Do not ask the user for these.
2. Ask before acting (`AGENTS.md`). The unknowns that change a plan are the outcome, who it is for, what success looks like, and any hard constraint. Put the open ones in one message with a default each. If outcome or user is genuinely open and the session is interactive, wait for the answer; otherwise state the assumption and continue.
3. Pick one owner: `app-engineer`, `security`, `design`, `qa`, or `copy`.
4. Name the skill that owner runs first:
   - App engineer: `nextjs-app-router` and, if data/auth, `supabase-auth-rls` / `postgres-migrations`
   - Security: `owasp-security-review` + `supabase-auth-rls`
   - Design: `frontend-design` (name setup, build, review, or detect) and, for screens, `accessibility-wcag`
   - QA: `browser-qa` (screens), `testing-qa` (commands), `accessibility-wcag` for user-facing screens, and `ship` for a release go/no-go
   - Copy: `product-copy` (Reader / Job / One action / Proof) then `deslop` last
5. If the work is user-visible and `DESIGN.md` is missing or TBD, or the user asked for a style guide or principles: owner is Design in `setup` first. Design asks what they need before inventing tokens. App engineer does not invent tokens.
6. Add reviewers: Security for auth/data/secrets, Design for UI, QA for behavior/UI, Copy for public words.
7. If the change is user-visible, list the desktop and mobile screenshots QA must capture. Setup may skip screenshots when nothing can render yet.
8. Launch the owner with its payload from `AGENTS.md` → Spawn payloads. Do not write a second prompt. Do not stop after printing a fence. Every host has the agents by id: Cursor Task, Claude subagent, Codex custom agent, Copilot `/agent <id>`, Antigravity `invoke_subagent`. Only if the surface exposes no subagents, continue in this thread under a “now App engineer” (or named role) header with the same text.

## Done when

Owner, extra reviewers, required skills, preserved behavior, and required screenshots are explicit. Open unknowns were asked in one message or carried as stated defaults. The session launched the owner with the canonical payload. No product code was written. You did not impersonate the owner.

## Reject

- Implementing in the planning pass, or finishing without launching the owner.
- Asking the user what the repo already answers, or asking about anything that would not change the plan.
- One chat playing every role, or a paste printed and left for the human to copy.
- Skipping a domain skill because the change is “small”: `supabase-auth-rls` on any table, `nextjs-app-router` on any route, Design `setup` on a new product UI, `accessibility-wcag` because the screenshot looks fine, `testing-qa` on auth/RLS, `ship` because someone said “LGTM.”
