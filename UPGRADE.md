# Upgrade Guide

## 0.4.0

This is a breaking simplify. `init` now writes `AGENTS.md`, `USER_GUIDE.md`, and native IDE agents/skills. It does not install the 17-doc operating system, Studio, or orchestrator files.

`update` never deletes your existing files. Old `SPEC.md`, `QUALITY_GATES.md`, and `.agent-kit/` trees stay as unmanaged leftovers. `doctor` warns when those 0.3 council files are still present; that warning is not a failure.

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
