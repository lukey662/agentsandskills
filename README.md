# Agents And Skills

A small pack of **agents**, **skills**, and a **user guide** for Next.js + Supabase apps.

QA does not review user-visible work from code alone. A change is not done until someone opened the running UI, captured desktop and mobile screenshots, and reviewed those images.

## Start here

```bash
npx --yes @appsforgood/next-supabase-kit init --activate all
```

Then open **[USER_GUIDE.html](USER_GUIDE.html)** in a browser (markdown twin: [USER_GUIDE.md](USER_GUIDE.md)). GitHub shows the HTML as source; `npx agent-kit guide` prints the local path. That guide is how you use the pack.

## What you get

- `AGENTS.md` — who to ask
- `USER_GUIDE.md` — how to invoke agents and skills in Cursor, Claude, Codex, Copilot, and Antigravity
- Native agents and skills for the IDEs you activate
- A `browser-qa` skill that fails closed without desktop + mobile screenshots

## Commands

```bash
npx agent-kit init --activate all
npx agent-kit guide
npx agent-kit doctor
npx agent-kit add skill debug
npx agent-kit add agent lead-architect
npx agent-kit update
npx agent-kit adapter validate all
```

`agents-and-skills` is the same binary.

## Default agents

Planner · App engineer · Security · Design · QA · Copy

## Default skills

planning · nextjs-app-router · supabase-auth-rls · postgres-migrations · owasp-security-review · frontend-design · accessibility-wcag · **browser-qa** · testing-qa · product-copy · **deslop** · ship
