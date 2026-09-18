---
name: web-performance
description: Optional. Use when LCP, INP, CLS, or “this page is slow.” Measure first, then fix, then re-measure. Map onto next/image, RSC payload, and PostgREST N+1. Not on default init.
---

# Web Performance (optional)

This skill is **measure then fix**. Screenshots still live in `browser-qa` when the change is user-visible. This skill does not replace `frontend-design`, `nextjs-app-router`, or `supabase-auth-rls`. It is not installed by `init`.

Add with `agent-kit add skill web-performance`.

App engineer writes the change. QA runs this skill only when the ask is LCP / INP / CLS / “this page is slow.” There is no seventh agent.

## Use when

Core Web Vitals (LCP, INP, CLS), “this page is slow,” a waterfall, a large RSC payload, `next/image` misuse, or a PostgREST select/embed N+1.

Not a substitute for `ship`. Not a reason to install Lighthouse CI on `init`.

## Do

1. **Measure.** Name the route, viewport, auth/role, and the metric (LCP / INP / CLS / TTFB / transfer size). Write the number and the tool. If you have no measurement, stop.
2. **Identify.** Name the cause: image without `next/image` or missing sizes, RSC/payload weight, client JS, or PostgREST select/embed (N+1). Say what you ruled out.
3. **Fix** only that cause. Keep the existing design system. Do not restyle to “feel faster.”
4. **Re-measure** the same route and metric. If the new number is inside noise, revert the “fix.”
5. If the change is user-visible, attach `browser-qa` desktop + mobile paths after the fix.

## Checks

| Area | Pass |
| --- | --- |
| Measure | Metric, route, and number recorded before the change. |
| Identify | Cause named (`next/image`, RSC payload, PostgREST N+1, or client JS). |
| Fix | One cause. No guessed font/CDN swap. |
| Re-measure | Same metric after. Revert if inside noise. |
| UI | User-visible: `qa-evidence/<date>-<slug>/` `desktop.png` and `mobile.png`. |

## Evidence

```text
route: /settings
metric: LCP 4.8s → 2.1s (Chrome performance, mobile 390)
cause: hero PNG without next/image sizes
fix: next/image + width/height; dropped unused embed on profiles
re-measure: LCP 2.1s (outside noise)
browser-qa: qa-evidence/2026-09-18-settings-perf/desktop.png, mobile.png
```

## Reject

- Optimizing from a guess (no measure).
- Treating this skill as part of default `init`.
- Adding a seventh agent or a required Lighthouse CI install.
- Replacing `browser-qa` or `frontend-design` with a score.
- Shipping a visual change with no after `browser-qa` paths.

## Done when

The metric was measured, the cause named, the fix re-measured, and a worse or noisy result was reverted. User-visible cases have `browser-qa` screenshot paths.
