# GitHub Copilot Model Selection

Repository instructions can advise model choice, but model selection remains controlled by the Copilot surface, organization policy, and the user's active model picker.

Use `MODEL_ROUTING.md` and `.agent-kit/model-routing.json` before starting agentic work.

## June 2026 Recommendations

<!--
Select the strongest available Copilot model for architecture, security, Supabase RLS, migrations, release risk, and ambiguous planning.
Select a faster available model for docs-only cleanup, narrow test triage, or low-risk repeated checks.
These comments are dated setup guidance, not a guarantee that Copilot will enforce model choice from repository files.
-->

## Evidence To Record

- Copilot surface used: chat, edit, coding agent, PR review, or other.
- Active model or organization policy, if visible.
- Instruction file loaded: `.github/copilot-instructions.md` or `.github/instructions/*.instructions.md`.
- Date, owner, and known limitations.
