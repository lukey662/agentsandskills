# Agentic Engineering Maturity Levels

Generated from the Agent Kit iceberg model for setup office gamification, `LOOP_CODING.md`, and maintainer climb planning.

## Summary

Agentic engineering maturity is modeled as **levels L3–L8**. The kit **computes L3–L6** from audit, adapter, and setup signals. **L7–L8 are deferred** (never auto-awarded) because they require stronger eval gates than agent freedom.

| Level | Name | Computed? |
| --- | --- | --- |
| L3 | AI-native IDE | Yes |
| L4 | Rules, context, MCP contract | Yes |
| L5 | Subagents, skills, council specialists | Yes |
| L6 | Eval loops, hooks, CI gates | Yes (downstream or maintainer profile) |
| L7 | Overnight / unsupervised teams | No — explore only |
| L8 | Agents managing agents | No — lab only |

## Base levels (reference)

| Lens | Level |
| --- | --- |
| What `@appsforgood/next-supabase-kit` ships | High L4 → solid L5 |
| BaseRepo maintainer day-to-day (gitignored dogfood overlay) | Mid L4 |
| BaseRepo CI (`release:check`, `adapter:validate`, audit smokes) | Partial L6 |
| Fresh downstream `init` | ~L4 capability; L3 until context complete |
| Fresh `init --activate cursor\|codex` | L5 capability when subagents exist |

## When each level was cutting edge (approximate)

| Era | Frontier | Became baseline |
| --- | --- | --- |
| 2022–2023 | Browser chat, tab completion | Copy-paste only |
| 2023–2024 | Repo-aware IDE chat (L3) | Autocomplete-only |
| Late 2024–2025 | AGENTS.md, rules, MCP (L4) | Ad-hoc prompting |
| 2025–2026 | Subagents, skills, councils (L5) | Single chat for all roles |
| 2026 now | Eval CI, loop until green (L6) | Manual “run tests when you remember” |
| 2026 hype | Overnight agent teams (L7) | Not safe as default |
| 2026+ lab | Meta-orchestration (L8) | Not mainstream production |

## Office and wizard integration

- `agent-kit setup` computes level via `computeAgenticLevel()` and returns it on `/api/state`.
- Agent Office shows **Lcurrent → Ltarget**, an iceberg strip (L3–L8), and top climb steps.
- Setup wizard complete screen links **`LOOP_CODING.md`**, **`agent-kit adapter validate`**, and audit gates.
- Maintainer source repos use a **maintainer profile** (release-check + dogfood docs) for L6 signals.

## Related assets

- `LOOP_CODING.md` — kit-safe loop patterns
- `schemas/agentic-level.schema.json` — report shape
- `src/studio/agentic-level.ts` — scoring implementation
- `research/summaries/maturity-model-patterns.md` — QUALITY_GATES evidence tiers (separate from Agentic L3–L8)

Do not conflate **Agentic L3–L8** with **QUALITY_GATES Baseline/Strong/Best-Practice** or **visual QA baseline/strong/mature** — the setup UI labels these separately.
