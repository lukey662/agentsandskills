---
name: ship
description: Use before deploy, promote, rollback, or when someone says LGTM, ship it. Go or no-go. Name env, migration order, rollback, commands run. User-visible still needs browser-qa screenshot paths.
---

# Ship

This skill is **go / no-go**. Commands live in `testing-qa`. Screenshots live in `browser-qa`. Keyboard pass lives in `accessibility-wcag`. Policies live in `supabase-auth-rls`. Schema order lives in `postgres-migrations`. Secrets and OWASP live in `owasp-security-review`. This skill does not replace those.

## Use when

Preparing to deploy, promote, roll back, or cut a production release. Also when someone says “ship it”, “LGTM”, “is this ready?”, “promote preview”, or “rollback”.

Not a substitute for writing the feature. Run this **after** the owning specialists finish. QA names the verdict; App engineer names env and the app rollback; Security names secrets and RLS.

## Do

1. Name the target (`preview` / `production` / named env) and what commit or deployment is going out.
2. List production-critical **env var names** (not values). Confirm they exist on that target. Flag any `NEXT_PUBLIC_` secret or service role on the client.
3. Name migration order. If schema changed, say whether the migration already ran and how to reverse it (`postgres-migrations`). Do not drop a column the live app still reads.
4. Run `testing-qa`: list commands actually run. Smoke of the primary path is required for a go.
5. If anything user-visible changed: attach `browser-qa` desktop + mobile paths. For screens, `accessibility-wcag` already ran. Missing paths are a no-go.
6. Return **go** or **no-go** with gaps. Do not imply go by omitting the word.

## Checks

| Area | Pass |
| --- | --- |
| Target | Preview vs production (or named env) is explicit. |
| Env | Critical names listed. Values are not pasted into the verdict. |
| Secrets | No secrets in git, `NEXT_PUBLIC_*`, client bundle, or logs. Service role stays server-only. |
| Migrations | Order named. Rollback named, or expand/contract reverse named. Empty “N/A” only if schema did not change. |
| Commands | `testing-qa` list with results. Smoke of the primary path (login or the workflow being released). |
| UI | User-visible changes have `qa-evidence/<date>-<slug>/desktop.png` and `mobile.png`. |
| Host | If this app is on Vercel (or similar), name preview vs production and how to restore the previous deployment. Do not require a Vercel CLI install from this kit. |
| Kill switch | How to disable the change in minutes: previous production deployment, flag, or revert. Named. Do not write only “git revert” when a previous production deployment or a flag exists. |
| Post-deploy | When the target is production, the primary path was smoked after deploy. |

## Evidence

```text
verdict: go | no-go
target: preview | production
commands:
  - npx vitest run                 # pass
  - npm run smoke                  # pass
env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY set; SERVICE_ROLE not in client
migrations: 0012_widgets applied; rollback = reverse 0012 / expand-contract reverse
rollback:
  app: previous production deployment / git revert <sha>
  db: do not drop 0012 in this release if the app still reads it
kill-switch: previous production deployment | flag <name> | revert <sha>
post-deploy-smoke: production primary path smoked | preview only | named skip
browser-qa: qa-evidence/2026-09-13-settings/desktop.png, mobile.png
gaps: none | named
```

## Reject

- “LGTM, ship it” (or “looks good, deploy”) with no env list, no rollback, and no commands.
- User-visible release without `browser-qa` screenshot **paths**.
- “We’ll set env in the dashboard later” or shipping with placeholder secrets.
- `SUPABASE_SERVICE_ROLE_KEY` (or any secret) in `NEXT_PUBLIC_*`, the repo, or a client bundle.
- Skipping rollback because “it’s a small change” or “we can just migrate forward.”
- Treating `toBeVisible` or “tests pass” as the ship gate. Use `testing-qa` and, for UI, `browser-qa`.
- Replacing `testing-qa`, `browser-qa`, `postgres-migrations`, `supabase-auth-rls`, or `owasp-security-review` with this skill.
- Pasting secret **values** into the go/no-go note.
- Writing only “git revert” when a previous production deployment or a feature flag exists.
- Error-budget tables, canary matrices, or axe-as-ship-gate.
- Requiring a Vercel CLI install from this kit.

## Done when

Go or no-go is explicit. Commands run, env names, migration order, rollback, and the kill switch (previous production deployment, flag, or revert) are named. When the target is production, the primary path was smoked after deploy. User-visible work has `browser-qa` screenshot paths. Secrets were not written into the verdict.
