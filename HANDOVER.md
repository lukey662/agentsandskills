# Session Handover — Agent Office Setup

Last updated: 2026-06-09

## What shipped

`agent-kit setup` now defaults to a **pixel top-down Agent Office** (browser canvas). Users click council agents at desks or zone stations to brief the team. The stepped form wizard remains at `/wizard` for accessibility and speed.

Initial commit: `4d2b2a1` (Agent Office + setup wizard). Follow-up commit (this session): route fixes, form↔office navigation, 2× canvas resolution, CLI port warnings, office polish.

## Routes

| URL | View |
| --- | --- |
| `/`, `/setup`, `/office` | Agent Office (default) |
| `/wizard` | Form wizard fallback |
| `/setup/wizard` | Redirects to `/wizard` |

**Self-check:** page title **“Agent Kit — Setup Office”** = office; **“Agent Kit Setup Wizard”** = form.

## Running locally

Requires **0.1.2+** (or local build until npm publish):

```bash
cd "/Volumes/Mac eSSD/BaseRepo"
npm install && npm run build

# Setup office (onboarding):
node dist/index.js setup --port 3003 --open

# Live studio (council sessions):
node dist/index.js studio serve --open
```

## Polish in 0.1.2

- High-res canvas (24px tiles, retina DPR)
- Break room: coffee machine + water cooler with idle animation
- Agent movement (break strolls, working animation at desks)
- Unified progress with onboarding `completedSections`
- Publishing Desk (`applyDrafts`) for Complete depth
- `agent-kit studio serve` for live session transcript + speech bubbles

If you still see the form at `/`, an **old setup server** is probably bound to that port. Kill it and restart with the local `dist/index.js` build above.

## Troubleshooting

- **Port in use:** CLI warns when the requested port is taken and falls back to a random port. Kill stale processes and restart to load the latest office build.
- **Wrong view:** `/wizard` is intentionally form-only. Open `/` or `/setup` for the office.
- **Pre-filled context:** Wizard drafts start empty by design; downstream projects fill `.agent-kit/project-context.json` through setup, not from kit dogfood data.

## UX changes (this session)

- `/setup` serves the office (was form on older builds).
- Form view: top banner, sidebar CTA, footer button, and home promo linking back to `/`.
- Office: agent/zone nameplates, depth modal blur, onboarding hint after depth pick, canvas renders before API load.
- Canvas scale: `CANVAS_SCALE` 3 → 6 (sharper display, less chunky pixels).

## Files and contracts

- Setup server: `src/studio/setup-server.ts`
- Office: `src/studio/office/` (`render.ts`, `map.ts`, `assets/office.js`, `office.css`)
- Form wizard: `src/studio/wizard/`
- APIs unchanged: `/api/state`, `/api/draft`, `/api/context`, checklist endpoints
- Writes: `.agent-kit/project-context.json`, `project-context.md`, `agent-briefs.md`, `onboarding/state.json`, `wizard-draft.json`

## Downstream example: AI news

Project path: `/Volumes/Mac eSSD/AI news`

Kit was installed with `init --stack next-supabase`. Setup should be run from that project root so answers land in its `.agent-kit/` directory. Do not bake Exec AI / newsletter specifics into the npm package — only into that project's context files.

## Next steps (optional)

- Publish `@appsforgood/next-supabase-kit@0.1.2` so `npx` serves Agent Office and `studio serve`.
- Run setup on AI news through the office flow and complete agent briefings + product context.
- Milestone 9 direct AI orchestration remains deferred (see `RUNTIME_ORCHESTRATION_SCOPE.md`).
