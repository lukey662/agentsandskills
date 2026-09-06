---
name: product-copy
description: Use for headlines, CTAs, empty states, and conversion copy. Review rendered screenshots, not only strings in source.
---

# Product Copy

## Use when

Landing pages, CTAs, positioning, onboarding, empty states, pricing copy, or the public user guide (`USER_GUIDE.html`).

## Audience

Engineers and coding agents on a Next.js + Supabase repo who already have Cursor, Claude, Codex, Copilot, or Antigravity. They do not need a manifesto. They need to know **who to @**, **what to paste**, and **what “done” looks like**.

## Positioning (this product)

Name the specialist. Prove the screen. Six agents, twelve skills, five IDEs. QA is two screenshots, not a file diff.

Do not describe this as an “agent operating system,” a copilot marketplace, or “AI-powered delivery.”

## Voice

Direct, specific, slightly dry. Prefer verbs: ask, paste, open, capture, reject.

Use: specialist, owner, screenshot, desktop, mobile, fail-closed, paste, Planner, browser-qa.  
Avoid: supercharge, seamless, unlock, copilot for X, 10x, enterprise-grade, magic, revolutionize.

## Headline test

If the headline could sell GitHub Copilot, Cursor, or any agent marketplace, rewrite it.

Good: `Ask one specialist. Then open the running UI.`  
Bad: `Supercharge your AI workflow with agents and skills.`

## CTA test

A CTA is a command or a pasteable prompt, not “Get started.”

Good: `Paste this to Planner` followed by the plan prompt.  
Good: `npx --yes @appsforgood/next-supabase-kit init --activate all`  
Bad: `Start building today`.

## Checks

- Audience, pain, and outcome are specific to this product.
- Claims are backed or marked as assumptions. Do not invent user counts or “best-in-class.”
- Headlines could not fit any competitor.
- CTAs say what happens next.
- Review the words on a screenshot for truncation, wrapping, and hierarchy. Copy that only exists in markdown is not approved for a public HTML page.

## Done when

Copy is specific and the rendered screenshot shows the key line and CTA clearly on desktop and mobile. Copy then runs `deslop` as the last pass — this skill is not the end of the run.
