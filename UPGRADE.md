# Upgrade Guide

## 0.5.0

`0.5.0` rewrites the design, copy, and planning playbooks and adds the first deleting command. Nothing is deleted unless you ask.

If you upgraded from 0.3 at any point, your install still has council files that shadow the 0.4 ones: a council `planner.md` at `.cursor/agents/planner.md`, a council `.cursor/rules/cursor-agent-kit.mdc`, and sixteen council skills that trigger on every UI task. `doctor` now fails on the first two. Fix them on a branch:

```bash
git switch -c agent-kit-0.5
npx @appsforgood/next-supabase-kit@0.5.0 update --prune-legacy --dry-run   # read the list
npx @appsforgood/next-supabase-kit@0.5.0 update --prune-legacy             # confirm with y
npx @appsforgood/next-supabase-kit@0.5.0 doctor
npx @appsforgood/next-supabase-kit@0.5.0 adapter validate all
```

The prune deletes only the allowlist in the package (`src/install/prune-legacy.ts`): council root docs (`COUNCIL.md`, `QUALITY_GATES.md`, `AGENT_ROSTER.md`, `MODEL_ROUTING.md`, `SKILLS.md`, `ASSISTANT_ADAPTERS.md`), `.agent-kit/` roster, routing, and library folders, council agent and skill files by id, council Antigravity commands, and kit-installed files whose body is the council version. Your `SPEC.md`, `DESIGN.md`, `DECISIONS.md`, and product code are never touched. Review the diff, then merge.

0.5.0 also moves skills to one location. 0.4 wrote `.cursor/skills/`, `.antigravity/runtime-skills/`, and a repo-root `skills/` folder; 0.5 writes `.agents/skills/` (read by Cursor, Codex, Copilot, and Antigravity) plus `.claude/skills/` for Claude. The same `--prune-legacy` run removes the 0.4 copies; until it does, Cursor lists every skill twice and `doctor` warns.

Agent files are now rendered per host. Claude subagents get real Claude tool names, preloaded skills, and `effort: high` for Planner, Security, and Design (0.4 Claude files carried the kit's `tools: [repo, edit, …]` vocabulary, which Claude Code refuses to launch). Copilot gets custom agents in `.github/agents/`; Antigravity gets custom subagents in `.agents/agents/` and a rule in `.agents/rules/`. Run `update` (with `--force` if you never edited the agent files) and `adapter validate all`.

Behavior changes after the prune:

- Every host launches the agents by id. Copilot uses `/agent <id>`; Antigravity uses `invoke_subagent`.
- Planner asks up to three bundled questions with defaults instead of one question and a wait for an explicit yes. Every agent follows the same rule (`AGENTS.md` → Ask before acting).
- Handoff prompts live once in `AGENTS.md` → Spawn payloads. Agents reference them.
- `frontend-design` derives tokens from your product (Object, Field/ink/accent, Type, Structure, Removed) instead of offering a palette table, and owns the visual fail list.
- `deslop` is copy-only and adds structure tells.
- Codex agents get `model_reasoning_effort = "high"` for planner, security, and design.

If you did not upgrade from 0.3, `update` is enough; `--prune-legacy` finds nothing and says so.

## 0.4.3

`0.4.3` does not change installed agent files unless you stripped `requiredTools`. `doctor` now fails that. `adapter validate all` on a Cursor-only install checks Cursor only.

```bash
npx @appsforgood/next-supabase-kit@0.4.3 update
npx @appsforgood/next-supabase-kit@0.4.3 doctor
npx @appsforgood/next-supabase-kit@0.4.3 guide
```

Open `USER_GUIDE.html` in a browser. GitHub shows it as source.

## 0.4.2

`0.4.1` is the published simplify catch-up. `0.4.2` rewrites the Next.js and Supabase domain skills. `update` refreshes pristine skill files; local edits win or land in conflicts.

```bash
npx @appsforgood/next-supabase-kit@0.4.2 update
npx @appsforgood/next-supabase-kit@0.4.2 doctor
```

Do not re-init. `update` still never deletes leftover 0.3 council docs.

## 0.4.1

npm `0.4.0` was the simplify cut. `0.4.1` adds `deslop`, the 4-token `frontend-design` skill, catalog pointers on agents, and leftover-0.3 `doctor` warnings. Those leftover warnings are not a failure. `update` still never deletes old council docs.

```bash
npx @appsforgood/next-supabase-kit@0.4.1 update
npx @appsforgood/next-supabase-kit@0.4.1 doctor
```

Do not re-init.

## 0.4.0

This is a breaking simplify. `init` now writes `AGENTS.md`, `USER_GUIDE.md`, and native IDE agents/skills. It does not install the 17-doc operating system, Studio, or orchestrator files.

`update` never deletes your existing files. Old `SPEC.md`, `QUALITY_GATES.md`, and `.agent-kit/` trees stay as unmanaged leftovers.

```bash
npx @appsforgood/next-supabase-kit@latest init --activate all
npx @appsforgood/next-supabase-kit@latest doctor
```

Use `--legacy-docs` only if you still want a copy of leftover living-doc templates.

Read `USER_GUIDE.md` for how to invoke agents. QA must capture desktop and mobile screenshots for user-visible work.

## Downstream habit

```bash
npx agent-kit update
npx agent-kit doctor
npx agent-kit adapter validate all
```

Do not re-init to upgrade.
