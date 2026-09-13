---
name: debug
description: Optional. Use to reproduce, localize, reduce, and fix a failure, or when someone guesses from the stack trace. User-visible bugs need before and after browser-qa. Not on default init.
---

# Debug (optional)

This skill is **reproduce then guard**. Screenshots live in `browser-qa`. Commands live in `testing-qa`. This skill does not replace those. It is not installed by `init`.

Add with `agent-kit add skill debug`.

## Use when

A failure to reproduce, “it’s broken”, a stack-trace-only guess, or a user-visible bug. App engineer owns the fix; QA still runs `browser-qa` on screens.

Not a substitute for `ship`. Add this only when the failure keeps coming back.

## Do

1. **Reproduce.** Name the route, command, auth/role, and data. Write the failing step. If it does not reproduce, stop — do not patch a guess.
2. **Localize.** Narrow to the file, query, Server Action, or client boundary. Say what you ruled out.
3. **Reduce.** Smallest input that still fails. Drop unrelated UI and data.
4. **Fix.** Change the cause. Do not hide the symptom (empty catch, swallowing the error, “retry and it works”).
5. **Guard.** Add or extend a test (`testing-qa`) that would have failed before the fix.
6. If the bug is user-visible: capture `browser-qa` **before** and **after** (desktop + mobile paths). Missing after paths means the screen bug is not done.

## Checks

| Area | Pass |
| --- | --- |
| Repro | Named steps, not “it threw.” |
| Localize | File or query named. A stack frame is a clue, not the diagnosis. |
| Reduce | Smallest failing case recorded. |
| Guard | A test or command that fails without the fix. |
| UI | User-visible: before and after `qa-evidence/<date>-<slug>/` `desktop.png` and `mobile.png`. |

## Evidence

```text
repro: signed-in member, POST /settings, empty displayName → 500
localized: app/settings/actions.ts updateProfile, missing null check
reduced: displayName=""
fix: reject empty displayName; show field error
guard: tests/settings-action.test.ts
browser-qa before: qa-evidence/2026-09-13-settings-bug/desktop.png, mobile.png
browser-qa after: qa-evidence/2026-09-13-settings-fix/desktop.png, mobile.png
```

## Reject

- Guessing from the stack trace alone (no repro).
- “Fixed in code” for a screen bug with no before/after `browser-qa` screenshot paths.
- Treating this skill as part of default `init`.
- Replacing `browser-qa` or `testing-qa` with a log paste.
- Swallowing the error so the stack goes away.

## Done when

The failure reproduced, the cause is named, the fix is guarded, and user-visible cases have before and after `browser-qa` screenshot paths.
