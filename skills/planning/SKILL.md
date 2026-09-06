---
name: planning
description: Classify work, pick an owner, and name the evidence QA must capture. Use when the request is ambiguous, cross-layer, or needs a specialist.
---

# Planning

## Use when

Planning, roadmaps, “what should we do,” or any request that needs an owner.

## Steps

1. Read enough of the repo to name affected routes and data.
2. Pick one owner: `app-engineer`, `security`, `design`, `qa`, or `copy`.
3. Add Security for auth/data/secrets, Design for UI, QA for behavior/UI, Copy for public words.
4. If the change is user-visible, list the desktop and mobile screenshots QA must capture.

## Done when

Owner, extra reviewers, preserved behavior, and required screenshots are explicit. No product code was written.

## Reject

Implementing in the planning pass. Asking one chat to play every role.
