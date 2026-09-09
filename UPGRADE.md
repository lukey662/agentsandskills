# Upgrade Guide

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
