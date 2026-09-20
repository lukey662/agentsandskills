# Roadmap

What to do next for `@appsforgood/next-supabase-kit`. History lives in `DECISIONS.md` and `CHANGELOG.md`; this file holds only the open queue.

Keep on every item: six default agents, twelve default skills, one `.agents/skills/` location, the screenshot fail-closed rule, Planner names and does not implement, `deslop` last on public words, no Studio / audit / research / orchestrator on the default install.

## Current Next Actions

1. **Ship 0.5.0.** Council residue pruned, native adapters for all five hosts, `update --prune-legacy`. Cut with `changeset:version`, `release:check`, publish, verify with `publish:verify`.
2. **External dogfood on a real Next.js + Supabase app.** Install 0.5.0 with `--activate all`, run one UI change through Planner → App engineer → Design → QA in Cursor and in Claude Code. Record in `DOGFOOD.md`: did every host launch the agents by id, did Design derive tokens from the product, did QA write `qa-evidence/`. Promote any skipped skill into a Reject line on the owning skill and a test.
3. **Cursor duplicate-agent check.** With `.cursor/agents`, `.claude/agents`, and `.codex/agents` all present, confirm Cursor lists each agent once. If not, the Cursor generator skips when Claude is also activated.
4. **Copilot and Antigravity live verification.** Frontmatter is tested against the documented schemas; a real `/agent qa` run in Copilot CLI and an `invoke_subagent` run in Antigravity are still unrecorded.
5. **Second stack profile.** Only after 2–4 are green. The catalog and renderers are stack-neutral; the domain skills are not.

## Parked

- Skip-intake fixtures: wait for external dogfood to name a skipped skill.
- `ui-polish`, `debug`, `docs`, `upgrade`, `web-performance` stay optional. Do not add a thirteenth default skill.
- `frontend-design` is 1,944 words. Trim further only with a screenshot that shows the cut cost nothing.
