---
name: deslop
description: Use as the last copy pass. Strip AI-writing tells from public or conversion words. Copy must run this after product-copy, not instead of it. Visual slop belongs to frontend-design.
---

# Deslop

Last pass on words. `product-copy` writes them; this skill removes the machine accent. Pixels are `frontend-design`'s job: if the screenshot still reads as default AI UI, hand the screenshot to Design and say so.

## Use when

Copy is about to say “done,” or anyone asked to de-slop, humanize, or “make this less AI.” Always run after `product-copy` on public or conversion copy.

## Order

1. Finish `product-copy` (Reader, Job, One action, Proof; headline and CTA tests).
2. Open the rendered surface if one exists. Read the words as they sit on the page.
3. Run the word tells, then the structure tells, then the claim sweep. Rewrite; do not synonym-swap.
4. Read your own rewrite once more with the same lists.

## Word tells

| Tell | Fix |
| --- | --- |
| Chatbot openers (“Certainly!”, “Great question!”) | Delete. Start with the point. |
| Inflators (seamless, robust, leverage, unlock, supercharge, 10x, paradigm, empower) | Name the thing: use, ships, blocks. |
| Copula dodge (“serves as,” “boasting,” “featuring”) | “is” / “has.” |
| Moreover / Furthermore / In today’s X / In conclusion / In short | Cut, or join with “and.” |
| Vague experts, “studies show” | Cite or delete. |
| Title Case Headings on every line | Sentence case. |
| Any em dash (—), emoji headers, sparkle bullets | Periods. Commas. Real nouns. Zero em dashes. Never use em dashes as crutches for sentence structure. |
| “Get started” / “Learn more” with no object | Say the next action. |
| “Oops!”, “Uh oh”, excited success marks (“Saved!”) | Plain functional statement: “Saved.”, “Connection failed.” |
| Mock-humble asides, fake craftsman claims (“We obsess over…”, “Crafted with love”) | State what the software actually does. |
| Cute-but-wrong wordplay, forced metaphors | Plain sentence. |
| Placeholder leftovers (`[Your Name]`, `TODO copy`) | Fill or delete. |

## Structure tells

These survive a word-level pass and still read as generated.

| Tell | Fix |
| --- | --- |
| Fragment triads (“Fast. Simple. Done.”) and parallel bullets of identical shape | One sentence that says the actual thing, or a list whose items differ because the facts differ. |
| “Not X. Y.” and “It’s not about X, it’s about Y” | State Y. Drop the strawman. |
| Rhetorical question, then the answer | Give the answer. |
| Hedging stacks (“may potentially help to”) | Commit or cut. |
| Colon-led reveal (“The result: …”, “The truth is: …”) | Plain sentence. |
| Closing summary that repeats the section | Delete. |
| “Whether you’re X or Y” | Name the one Reader. |
| Dramatic lecture setup (“When a single developer tries to...”, “In the fast-paced world...”) | Delete the lecture. State the product's actual mechanism directly. |
| AI cliché failure tropes (“inevitably cuts corners”, “leads to chaos”, “hallucinates wildly”) | Name the specific failure mode plainly without melodrama. |
| Staccato telegrams and over-compressed fragments (“App engineer builds route. Security owns RLS.”) | Write a complete, cohesive human sentence that connects the ideas naturally. |
| Every sentence the same length | Vary. Let one be long when the fact is long. |

**Reader test & Staff Product Manager test.** Would a real technical lead or Product Manager speak this sentence out loud to a colleague? If it sounds like a machine issuing military commands or compressed JSON, rewrite it with natural human phrasing, connective tissue, and cadence. Deslop strips machine pretension; it must never strip human warmth, clarity, or explanation.

**Allowance.** Imperative commands, CLI labels, table cells, and short headings in a tool or product context are not tells. “Run doctor.” is fine. A landing page made only of those is a tell.

## Claim sweep

| Fail | Fix |
| --- | --- |
| Feature with no why | Say why the Reader cares, or cut. |
| Vague (“save time”, “scale”) | Name the unit, or cut. |
| Fake precision (`99.4%`, `4.2×`, `10x faster`) with no benchmark | Name the benchmark, or mark `assumption`. |
| Claim with no proof | Cite it, or mark `assumption`. |

## Must keep

Facts, commands, file paths, the fail-closed screenshot sentence, and any claim that has proof. Deslop is subtraction, not a new voice.

## Reject

- Replacing `product-copy` with this skill, or running it first.
- Stripping natural human transitions and explanations under the guise of deslopping, leaving behind robotic telegrams.
- Restyling the page. Copy lists what the screenshot shows and sends it to Design.
- Importing a copy-editing catalog, scoring rubric, or multi-pass edit ritual.
- Synonym-swapping a tell and calling it done.

## Done when

A second read finds no word or structure tells above, every claim has proof or an `assumption` mark, and, if a screen exists, the rendered words were read. Copy's verdict is not “done” until this pass ran.
