# MESSAGING.md

Voice file for this repo's public words: `USER_GUIDE.html`, `README.md`, npm metadata, CLI help and errors. `product-copy` reads this first. Downstream products write their own.

## Reader / Job / One action / Proof

| Slot | Answer |
| --- | --- |
| Reader | An engineer with an IDE and an npm project who is tired of one chat playing every role. |
| Job | Get a plan, an implementation, a security pass, a design pass, and QA on a change without policing each step or copying prompts between chats. |
| One action | `npx --yes @appsforgood/next-supabase-kit init --activate all`, then say the change. |
| Proof | `doctor` and the tests fail if the screenshot rule or `requiredTools` are dropped. `qa-evidence/` in this repo holds the desktop and mobile shots for the guide itself. |

## Voice

Direct, specific, slightly dry. Verbs: say, launch, open, capture, reject, name.

Words that belong here: specialist, owner, screenshot, desktop, mobile, fail-closed, launch, Planner, `browser-qa`, payload.

Words that do not: supercharge, seamless, unlock, copilot for X, 10x, enterprise-grade, magic, revolutionize, AI-powered.

## Headline and CTA tests

A headline that could sell Cursor, Copilot, or any pack on the same shelf fails. A CTA that does not name the next action fails.

- Good headline: `Say the change. Then open the running UI.`
- Bad headline: `Supercharge your AI workflow with agents and skills.`
- Good CTA: the init command, or `Say the change.`
- Bad CTA: `Get started`, `Learn more`, `Start building today`.

## Claims

- Do not claim runtime enforcement. The kit is files and a CLI; the gate is `doctor`, tests, and the agents' own contracts.
- Do not invent adoption numbers, logos, or testimonials.
- Every claim on a public surface cites a file, a test, or a command, or is marked `assumption`.

## Surfaces

| Surface | Job | Primary action |
| --- | --- | --- |
| `USER_GUIDE.html` first viewport | Assign: who to ask, the one rule, say the change | init command |
| `README.md` | Get an engineer to run init | init command |
| CLI errors | Name the failing input and the next command | the next command |
| `doctor` output | Turn a finding into a fix | remediation line per finding |
