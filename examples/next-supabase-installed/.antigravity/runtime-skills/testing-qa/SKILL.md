---
name: testing-qa
description: Use when adding unit, regression, or smoke tests, or when someone says tests pass without listing commands. Visual proof of a screen always also uses browser-qa. RLS tests must fail when another user can read the row.
---

# Testing QA

This skill is **commands**. Screenshots live in `browser-qa`. Keyboard pass lives in `accessibility-wcag`. Policies live in `supabase-auth-rls`. Do not replace those.

## Use when

Adding or reviewing tests, smoke, regression, “is this tested?”, or “tests pass.”

## Do

1. Name the kinds this change needs: unit, regression, smoke. Skip kinds that do not apply; do not skip RLS/auth when data is involved.
2. Run the commands that already exist in this repo (`package.json` scripts). Do not invent a second test runner.
3. For auth, RLS, or mutations: include a **negative** that fails when another user or anon can read or write the row.
4. List what ran, the result, and gaps. If the harness is missing, name it; do not skip silently.
5. User-visible work still goes to `browser-qa` (and `accessibility-wcag` for screens). Playwright `toBeVisible` is not that handoff.

## Kinds

| Kind | What | Not |
| --- | --- | --- |
| Unit | Core logic, schema validation, helpers | A screenshot |
| Regression | Preserved behavior still holds | Rewriting the old test to match a bug |
| Smoke | Critical path against a running app (login, primary workflow) | `browser-qa` image review |

Smoke may use Playwright if the repo already has it. `toBeVisible` proves a node is in the DOM, not that the screen is correct.

## Auth / RLS

`supabase-auth-rls` owns the policy. This skill requires a test that would **fail** if another signed-in user can `select` / `update` / `delete` the row, or if anon can read a private row. A hidden button is not a test of access.

Shape (adapt to the repo’s harness):

```ts
// Must fail the job if RLS is missing or too open
const { data } = await asOtherUser().from("widgets").select().eq("id", ownerRowId);
expect(data ?? []).toHaveLength(0);
```

`ENABLE ROW LEVEL SECURITY` without that negative is not coverage.

If the change is App Router, Auth/RLS, or a migration, tests must cover those contracts. This skill does not replace `nextjs-app-router`, `supabase-auth-rls`, `postgres-migrations`, or `owasp-security-review`.

## Evidence

```text
commands:
  - npx vitest run tests/rls.test.ts   # pass
  - npm run smoke:install              # pass
gaps: no Playwright harness yet; named
```

## Reject

- `toBeVisible` (or “the test found the button”) as visual proof. Use `browser-qa`.
- “Tests pass” with no command list and no results.
- Skipping RLS/auth tests because “it’s just a table” or “we’ll add tests later.”
- Replacing `browser-qa` or `accessibility-wcag` with this skill.
- A green suite that would still pass if another user could read the row.
- Adding Playwright as a required install of this kit. Use it when the repo already has it.

## Done when

Commands run, results, and residual gaps are listed. RLS/auth tests fail closed when another user or anon can read the row. User-visible work still has `browser-qa` evidence.
