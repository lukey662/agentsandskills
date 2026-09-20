---
"@appsforgood/next-supabase-kit": minor
---

Skills install once to `.agents/skills/` (plus `.claude/skills/` for Claude); `.cursor/skills/`, `.antigravity/`, and the repo-root `skills/` copy are gone and `--prune-legacy` removes them. Agents render per host: Cursor (Planner `readonly`), Claude Code (real tool names, preloaded skills, `effort: high` for planner/security/design; 0.4 files could not launch), Codex, Copilot (`.github/agents/*.agent.md`), and Antigravity (`.agents/agents/*/agent.md` + `.agents/rules/`). `doctor` and `adapter validate` check each host's documented frontmatter. The 0.3 studio, audit, research, council folders, and the separately published runtime package (tag `runtime-0.1.3`) leave the source tree.
