---
name: product-copy
description: Use for headlines, CTAs, empty states, and conversion copy. Also when someone says write copy, landing page copy, value proposition, or this copy is weak. Review rendered screenshots, not only strings in source.
---

# Product Copy

Write first. `deslop` is last. This skill is not a marketing department.

Scan 2026-09-18: [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) (`product-marketing`, `copywriting`, `copy-editing` only). Structure kept: read existing product words, confirm one primary action, back claims or mark them. Do not copy their catalog, Seven Sweeps, expert-panel scores, or `.agents/product-marketing.md`.

## Use when

Landing pages, CTAs, positioning, onboarding, empty states, pricing copy, or the public user guide (`USER_GUIDE.html`).

## Before writing

1. Read existing product words: `MESSAGING.md` if it exists, else the current screen, README, and `USER_GUIDE`. Do not invent a second brand file.
2. If **Reader / Job / One action / Proof** is missing: ask **one** question with an attached guess. Restate those four. Wait for an explicit yes (not “sounds good”). Do not draft from an unconfirmed restatement.
3. Name the surface (homepage, landing, empty state, pricing, kit guide).

## Audience

When the surface is **this kit’s** `USER_GUIDE`: engineers who already have an IDE. Name the specialist. Ask them to say the change or run `init`. Headlines that could sell any copilot fail.

When the surface is a **downstream product app**: write for that product’s Reader and Job. Do not paste kit nouns (Planner, init, fail-closed) onto a customer screen unless that screen is about the kit.

## Voice

Direct, specific, slightly dry. Prefer verbs: say, launch, open, capture, reject, create, invite.

Kit guide words: specialist, owner, screenshot, desktop, mobile, fail-closed, launch, Planner, browser-qa.  
Avoid everywhere: supercharge, seamless, unlock, copilot for X, 10x, enterprise-grade, magic, revolutionize.

## Page argument

| Slot | Rule |
| --- | --- |
| Reader | One person. Not “teams” or “everyone.” |
| Job | The problem in their words. |
| One action | The next thing they do. Not “Get started.” |
| Proof | Named evidence, or the word `assumption`. |

One idea per section. A feature that does not say why the Reader cares is cut or rewritten.

## Headline test

If the headline could sell GitHub Copilot, Cursor, or any competitor on the same shelf, rewrite it.

Kit-guide good: `Say the change. Then open the running UI.`  
Kit-guide bad: `Supercharge your AI workflow with agents and skills.`  
Product-app good: names this product’s job.  
Product-app bad: `The AI-powered platform for modern teams.`

## CTA test

A CTA is a command or the next action, not “Get started,” “Learn more,” or “Sign up.”

Kit-guide good: `Say the change.`  
Kit-guide good: `npx --yes @appsforgood/next-supabase-kit init --activate all`  
Product-app good: the specific next thing (create the first record, invite a teammate).  
Bad: `Start building today`.

## Checks

- Reader, Job, One action, and Proof (or `assumption`) are named.
- Claims are backed or marked. Do not invent counts or “best-in-class.”
- Headlines could not fit a competitor.
- CTAs say what happens next.
- Review the words on a screenshot for truncation, wrapping, and hierarchy. Copy that only exists in markdown is not approved for a public HTML page.

## Reject

- Drafting from an unconfirmed restatement or treating “sounds good” as a yes.
- Invented stats, logos, or testimonials.
- AIDA / PAS / BAB dumps as the page.
- Importing a marketing-skill zoo or writing `.agents/product-marketing.md`.
- Expert-panel scores or Seven Sweeps theater.
- Handing off after this skill without `deslop`.
- Approving copy that only exists in markdown when a public HTML page exists.

## Done when

Reader / Job / One action / Proof are confirmed. Copy is specific. The rendered screenshot shows the key line and CTA clearly on desktop and mobile. Copy then runs `deslop` as the last pass — this skill is not the end of the run.
