---
name: deslop
description: Use as the last copy pass. Strip AI-writing tells and leftover visual slop. Copy must run this after product-copy, not instead of it.
---

# Deslop

Last pass. `product-copy` writes the words. This skill removes the machine accent.

Scan 2026-09-06: `conorbronsdon/avoid-ai-writing`, `funboy322/avoid-ai-design`, `educlopez/ui-craft`, `superdesigndev/superdesign-skill`. Patterns only. Do not copy their catalogs.

## Use when

Copy is about to say “done,” or anyone asked to de-slop, humanize, or “make this less AI.” Always run after `product-copy` on public or conversion copy.

## Order

1. Finish `product-copy` (audience, headline, CTA, claims).
2. Open the rendered surface if one exists.
3. Run this skill. Fix words first. If the screenshot still reads as default AI UI, hand back to Design with the P0 list. Do not skip this step.

## Writing tells — cut or rewrite

| Tell | Fix |
| --- | --- |
| Chatbot openers (“Certainly!”, “Great question!”) | Delete. Start with the point. |
| Inflators (seamless, robust, leverage, unlock, supercharge, 10x, paradigm) | Name the thing. “use,” “ships,” “blocks.” |
| Copula dodge (“serves as,” “boasting,” “featuring”) | “is” / “has.” |
| “It’s not X, it’s Y” | One positive sentence. |
| Moreover / Furthermore / In today’s X / In conclusion | Cut or join with “and.” |
| Vague experts / studies show | Cite or delete. |
| Title Case Headings on every line | Sentence case. |
| Em dash stacks, emoji headers, sparkle bullets | Periods. Real nouns. |
| “Get started” / “Learn more” with no object | Say the next action. |
| Placeholder leftovers (`[Your Name]`, `TODO copy`) | Fill or delete. |

Second pass: re-read the rewrite. If the same tell remains, rewrite the paragraph, do not synonym-swap.

## Visual P0s — fail if still on screen

These are the 2026 flat AI/SaaS chrome cluster (same family as accent-border cards, glow rails, and card soup). One is a smell. Two or more is a reject. A pick-list row or status well with a left stroke is already a fail.

- Purple-to-blue (or indigo) gradient hero, or gradient-clipped headline type
- Inter / Roboto / default shadcn zinc as the whole identity
- Centered slogan + two pills + three equal icon cards
- `rounded-2xl` + `shadow-lg` + blur on every surface
- Cream paper `#F4F1EA` + terracotta accent (the 2026 “editorial default”)
- Acid green or neon vermilion on near-black used as decoration, not meaning
- Lucide Sparkles / Zap as the product metaphor
- Fake dashboard metrics or DiceBear avatars
- Left accent bars / left-hand borderlines on selected rows, list items, cards, or success/error/warn wells (the “colored stroke on the left edge” pattern)
- Thick one-sided colored borders, glow rails, neon strokes, or gradient borders used as the main state cue

Selection must use radio/checkbox + light row tint (or weight/space) only. Status wells may use a flat tint fill. No `border-left` accent, no inset bar, no vertical rail as decoration. Keep one accent for the primary CTA, not as a row edge.

**Acceptance fixture:** a pick-list row and a “verified” well must pass with **zero** left border accents. If screenshots show a blue/green/amber left stroke, deslop fails.

Copy does not restyle the page. It lists the P0s from the screenshot and sends them to Design.

## Must keep

Facts, commands, file paths, the fail-closed screenshot sentence, and any claim that has proof. Deslop is subtraction, not a new brand voice.

## Done when

- A second read finds no writing tells above.
- If a screen exists, the screenshot was read and remaining visual P0s are named or gone.
- Copy’s verdict is not “done” until this pass ran.
