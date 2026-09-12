# Frontend Design Agent And Skill — 2026-09-12 GitHub Scan

Follow-up to `research/agent-skill-gap-report.md` and the 2026-09-06 frontend-design uplift. Structure only. No skill bodies, catalogs, or proprietary layouts were copied.

## Why this pass

The installed `frontend-design` skill already had kit vs product tokens and 2026 default-cluster rejects. GitHub packs had since made the *workflow* more explicit: named modes, surface depth, persistent `DESIGN.md` tokens, and a findings table that distinguishes source tells from pixel tells. This pack still wants one skill and no second design OS.

## Sources reviewed

| Repo | Stars (approx) | What to learn | What not to copy |
| --- | --- | --- | --- |
| [anthropics/skills](https://github.com/anthropics/skills) `skills/frontend-design` | catalog | Subject-first tokens, plan-then-uniqueness-check, spend boldness once, screenshot self-critique, brief wins over model defaults | Skill body, license text, Claude-only ceremony |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) `frontend-ui-engineering` | 92k pack | States (loading/empty/error), anti-rationalization, verification checklist, design-system adherence | React/Storybook file layout as a required tree |
| [educlopez/ui-craft](https://github.com/educlopez/ui-craft) | 324 | Discovery before CSS, stack detection, surface recipes, severity-tagged review table, surgical vs rebuild | MCP, `/craft` command catalog, knobs, 40-file reference OS |
| [funboy322/avoid-ai-design](https://github.com/funboy322/avoid-ai-design) | 65 | `rewrite` vs `detect`, P0/P1/P2, context profiles, code-certain vs inferred | Their tell catalog verbatim |
| [superdesigndev/superdesign-skill](https://github.com/superdesigndev/superdesign-skill) | 543 | Init from existing tokens/components before generating UI | Canvas CLI, auth, credit-gated generation |
| [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | 15k | Persistent DESIGN.md: tokens normative, prose is usage rationale | Their YAML schema as a required install |
| JetBrains / older `frontend-design` forks | various | — | Mesh gradients, noise overlays, and decorative atmosphere as the default “bold” move |

## Repeated patterns adopted

- Name the job (`setup` / `build` / `review` / `detect`) before CSS. `setup` is first-run on a new repo: scan, compact questions, recommended principles, then a short product `DESIGN.md`.
- Pick surface depth: landing vs app chrome vs inside a design system vs this kit’s HTML.
- Pick surface depth: landing vs app chrome vs inside a design system vs this kit’s HTML.
- Read existing `DESIGN.md` / tokens; stay surgical inside a system.
- Tag findings as code-certain (source) or inferred (pixels or no render).
- Keep screenshot + desktop/mobile as the acceptance tool.
- One accent, spent on meaning, not decoration.

## Repeated patterns rejected

- A design MCP, infinite canvas, or `/command` marketplace as the default install.
- Splitting frontend work back into six critique skills.
- Read-only design-reviewer as the only design agent (this pack’s Design agent still fixes P0 pixels; QA owns the verdict).
- Atmosphere/mesh/noise as a substitute for a product-specific field, ink, and accent.

## Promoted updates

- `skills/frontend-design/SKILL.md` playbook: Mode (including `setup`), Surface, Reject, review table, Done-when.
- `agents/design/agent.md`: name mode and surface; detect is audit-only; setup writes `DESIGN.md` + style-guide rules with the user before CSS.
- Antigravity `/frontend` prompt names the same mode contract, including setup on a new repo.
- Tests lock the new contract on init.

Do not copy source code, design files, or skill bodies from reviewed repositories.
