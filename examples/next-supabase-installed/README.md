# Example Installed Output

This directory shows the expected shape after running:

```bash
npx @agent-skills/next-supabase-kit init --stack next-supabase
npx @agent-skills/next-supabase-kit audit --json
npx @agent-skills/next-supabase-kit audit --min-readiness baseline-setup
```

The example is intentionally compact. It documents the generated structure, representative manifest metadata, Cursor adapter rules under `.cursor/rules/`, and expected audit shape without duplicating every template file. `npm run examples:check` verifies that these committed example files still match a clean install from the current built CLI.

The installed `.agent-kit/agent-roster.json` is the machine-readable default council contract used by agents and validated by `agent-kit audit`. New installs also include `COUNCIL.md`, `ASSISTANT_ADAPTERS.md`, `MODEL_ROUTING.md`, `UPGRADE.md`, `.agent-kit/model-routing.json`, `.agent-kit/assistant-adapters/`, `.agent-kit/schemas/`, `DESIGN.md`, and `QUALITY_GATES.md` so handoffs, tool-specific assistant activation, model selection, upgrade review, frontend brand/content intake, reference-led critique, product-quality scoring, creative direction, visual QA, and maturity evidence are explicit before implementation is accepted. Optional `.agent-kit/council-sessions/*.json` records are validated when present.

The sample audit intentionally reports `readiness.level: baseline-setup` with two warnings. A fresh install still contains starter placeholders and unverified assistant/model-selection rows; downstream projects should replace those with real project evidence before claiming strong or best-practice maturity.
