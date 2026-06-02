# Changelog

## 0.1.0

- Initial private package scaffold.
- Added CLI commands for install, audit, diff, update, add skill, doctor, and research workflows.
- Added Next.js + Supabase markdown templates.
- Added core agent roles, skills, prompts, checklists, and provider-neutral design adapters.
- Added CI and private npm release workflows with dry-run validation.
- Added template-hash manifest tracking and `agent-kit audit --json`.
- Added compatibility profiles, product-specific design briefs, screenshot review prompt, and sample installed output.
- Promoted 100-repo research findings from `research/summaries/scan-overview.md` and `research/proposed-updates.md`.
- Promoted downstream dogfood findings from `dogfood/qrcode-audit.md` and `dogfood/ai-news-audit.md`.
- Added npm publish-token preflight and prepared draft GitHub Release `v0.1.0`.
- Fixed package bin metadata so `agent-kit` is preserved during npm publish.
- Replaced publish-token CI authentication with npm Trusted Publishing and optional read-token install verification.
- Added a Planner agent, Planning and Agent Council skill, and machine-readable default council roster enforced by audit.
