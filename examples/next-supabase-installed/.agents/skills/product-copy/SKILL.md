---
name: product-copy
description: Use for headlines, CTAs, empty states, and conversion copy. Also when someone says write copy, landing page copy, value proposition, or this copy is weak. Review rendered screenshots, not only strings in source.
---

# Product Copy

Write first. `deslop` is last. This skill is not a marketing department.

## Use when

Landing pages, CTAs, positioning, onboarding, empty states, form errors, toasts, pricing copy, or a public guide page.

## Before writing

1. Read the product's own words: `MESSAGING.md` if it exists, else the current screen and README. Do not invent a second voice file.
2. Ask before acting (`AGENTS.md`). The four unknowns are **Reader / Job / One action / Proof**. Put the open ones in one message with your default for each. Where you had to guess, the copy carries the word `assumption` next to that claim.
3. Name the surface (homepage, landing, empty state, form/toast, pricing, guide).

## Page argument

| Slot | Rule |
| --- | --- |
| Reader | One person. Not “teams” or “everyone.” |
| Job | The problem in their words. |
| One action | The next thing they do. Not “Get started.” |
| Proof | Named evidence, or the word `assumption`. |

One idea per section. A feature that does not say why the Reader cares is cut or rewritten.

## Voice

Direct, specific, slightly dry. Prefer verbs the Reader uses for the job. Avoid everywhere: supercharge, seamless, unlock, copilot for X, 10x, enterprise-grade, magic, revolutionize. The product's `MESSAGING.md` may add its own lists.

One copy register per page. Do not mix technical telemetry (“0.4 ctx-switches/day”), editorial prose, and SaaS marketing punch unless `MESSAGING.md` calls for it.

Form errors and status messages are copy: state the fact or the fix plainly; no cheerful “Oops!”, excited exclamation marks, or blaming the user.

## Headline test

If the headline could sell a competitor on the same shelf, rewrite it. Good headlines name this product's job. `The AI-powered platform for modern teams` fails; `Reconcile the month before the accountant asks` passes.

## CTA test

A CTA is a command or the next action, not “Get started,” “Learn more,” or “Sign up.” Good: the specific next thing (create the first record, invite a teammate, run the install command). Bad: `Start building today`.

Lock CTA intent across the page: two buttons with the same goal (e.g. “Contact us” in the nav, “Get in touch” in the hero, “Start a conversation” in the footer) must share one label. Primary CTAs must not wrap to multiple lines on desktop (~1280).

## Checks

- Reader, Job, One action, and Proof (or `assumption`) are named.
- Claims are backed or marked. Do not invent counts, logos, testimonials, or “best-in-class.”
- Headlines could not fit a competitor.
- CTAs say what happens next, share one label per intent, and do not wrap on desktop.
- Form errors and toasts state the fact or fix plainly without “Oops!” or exclamation marks.
- Words are reviewed on a screenshot for truncation, wrapping, and hierarchy. Copy that only exists in markdown is not approved for a public HTML page.

## Reject

- Drafting without naming Reader / Job / One action / Proof or marking the gaps `assumption`.
- Invented stats, logos, or testimonials.
- Duplicate CTA intents on one page with competing labels, or a primary CTA that wraps on desktop.
- AIDA / PAS / BAB dumps as the page.
- Importing a copy catalog or writing a second voice file.
- Handing off after this skill without `deslop`.
- Approving copy that only exists in markdown when a public HTML page exists.

## Done when

Reader / Job / One action / Proof are named or marked. Copy is specific to this product. The rendered screenshot shows the key line and CTA clearly on desktop and mobile. Copy then runs `deslop` as the last pass; this skill is not the end of the run.
