# Agent And Skill Gap Report

Scanned 2026-09-06. Corpus: public **agent packs and skill catalogs**, not the 2026 Next.js/SaaS scan. Extracts structure and coverage only; no skill bodies were copied.

## Repos scanned

| Repo | Stars (approx) | Why selected |
| --- | --- | --- |
| [anthropics/skills](https://github.com/anthropics/skills) | 175k | Official Agent Skills standard: folder + `SKILL.md` + `name`/`description` frontmatter |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | 92k | Best-in-class engineering pack: 4 agents, 25 skills, lifecycle commands, per-IDE setup, browser verification |
| [wshobson/agents](https://github.com/wshobson/agents) | 39k | Multi-harness marketplace (Cursor, Claude, Codex, Copilot, Antigravity) from one Markdown source |
| [github/awesome-copilot](https://github.com/github/awesome-copilot) | 39k | Copilot-native agents + skills + instructions |
| [agentsmd/agents.md](https://github.com/agentsmd/agents.md) | 24k | Thin `AGENTS.md` convention — routing card, not an OS |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 75k | Catalog of how people discover and install skills |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 34k | Cross-agent skill directory |
| [microsoft/skills](https://github.com/microsoft/skills) | prior finding | Official skills layout; Azure-specific bodies are out of scope |
| [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | 36k | Plugin + skill install UX |
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | (CLI cited by addyosmani) | `npx skills add` installer used by top packs |

Also noted but not used as catalog sources: generic awesome-lists, science/design toys, and 200-agent marketplaces (too broad; violate “Next.js + Supabase pack”).

## Union of agent roles vs draft roster

Roles that appear repeatedly in **focused** packs (addyosmani, Copilot awesome, our draft):

- Planner / spec / interview (addyosmani skills, not always a named agent)
- Implementer / app engineer (implicit everywhere; few packs split Next.js vs Postgres)
- Security auditor (addyosmani `security-auditor`, wshobson security plugins)
- Frontend / design (addyosmani `frontend-ui-engineering` skill; few dedicated design *agents*)
- QA / test engineer (addyosmani `test-engineer`)
- Copy / content (rare as a default agent; common as a skill in marketing plugins)
- Code reviewer (addyosmani `code-reviewer` — we fold into QA)
- Web performance (addyosmani extra agent — optional, not default)

Roles we had that **do not** appear as default installs in strong packs:

- Documentation Maintainer, Deployment Engineer, Research Analyst, Lead Architect as mandatory council seats
- 11-person handoff chains and session ledgers (wshobson has orchestrators; we will not copy that OS)

## Union of skills vs draft catalog

Repeated skill *shapes* in top packs:

- `SKILL.md` in a named folder with YAML `name` + `description` (Anthropic official; addyosmani; wshobson)
- Use-when, step process, verification / done-when, anti-rationalization (addyosmani)
- Planning, frontend/UI, security/OWASP, testing, shipping, docs (addyosmani)
- **Browser verification** as a first-class skill (`browser-testing-with-devtools`) — screenshots + live runtime, not code review
- Debugging / error recovery (addyosmani; optional for us)
- Git/PR, CI, performance, observability (addyosmani ship phase; optional extras)

Skills we had that **only support our old OS**:

- `agent-handoff-tracing`, `best-practice-maturity-review`, `planning-council`, `upgrade-maintenance`
- Six frontend-critique skills and four copy skills (everywhere else this is one frontend skill and one copy skill)

Skills **kept despite being uncommon** in generic zoos:

- `supabase-auth-rls` — domain-critical for this pack
- `postgres-migrations` — domain-critical
- Screenshot-mandatory `browser-qa` — stronger than most packs; addyosmani requires live browser but not always desktop+mobile image review

## Tool patterns

- Best packs treat verification as non-negotiable. addyosmani: “Seems right is never sufficient”; browser skill forbids shipping UI from a mental model.
- Screenshot, DOM, console, and viewport checks live in a **browser skill**, not in QUALITY_GATES.md.
- Playwright / Chrome DevTools MCP are portable fallbacks when the IDE has no browser tool.
- wshobson copies one source into five harnesses — same pattern we keep (Cursor, Claude, Codex, Copilot, Antigravity).

## How top packs teach usage

- README is a short landing page: install, then “how to invoke.”
- Per-IDE setup pages with exact paths (`.cursor/skills`, Claude `/plugin`, Copilot instructions).
- Copy-paste commands and slash commands (`/plan`, `/ship`).
- A meta skill or adoption guide — we ship `USER_GUIDE.md` instead of `using-agent-skills`.
- `AGENTS.md` stays a one-page routing card (agentsmd), not a 12-step council.

## Locked decisions

### Add

| Item | Rationale | Sources |
| --- | --- | --- |
| Native `skills/<id>/SKILL.md` layout | Official format | anthropics/skills, addyosmani, wshobson |
| Native `agents/<id>/agent.md` with tools | Agents are personas + tool contracts, not roster JSON wrappers | addyosmani agents/, wshobson harness copy |
| `browser-qa` skill (screenshot-mandatory) | Live browser is the quality differentiator; we go further than DevTools-only | addyosmani browser-testing-with-devtools |
| Optional `debug` skill | Repeated verify-phase skill; not default | addyosmani debugging-and-error-recovery |
| `USER_GUIDE.md` as the how-to | Top packs teach invocation in-repo | addyosmani docs/*, agentsmd |

### Update

| Item | Rationale |
| --- | --- |
| Merge Next.js + Supabase implementers into `app-engineer` | No strong pack splits these as two default agents |
| Merge frontend critique suite into `frontend-design` | One UI skill everywhere else |
| Merge copy skills into `product-copy` | One copy skill |
| Fold visual-regression + screenshot-review into `browser-qa` | Verification belongs in one skill |
| Fold `planning-council` into `planning` | Planner skill, not a council OS |
| Adapters copy canonical files | wshobson: one source, five harness-native outputs |

### Remove or demote (not default)

| Item | Rationale |
| --- | --- |
| `agent-handoff-tracing`, `best-practice-maturity-review`, council session CLI | Kit ceremony; anti-goal |
| Mandatory docs / deploy / research / lead-architect agents | Optional add-ons only |
| `runtime-skills/` wrappers | Duplicate of `SKILL.md` |
| 17 installed living docs, Studio, research CLI, LangGraph | Not what users need to use agents |

### Do not copy

- 94-plugin / 200-agent marketplaces as the default install (wshobson)
- Session memory products, LangGraph orchestrators, audit readiness OS
- Azure-only or science-only skill bodies
- “Read 12 docs first” generated stubs

### Kept despite being uncommon

- `supabase-auth-rls` and `postgres-migrations` — this pack’s domain
- Screenshot-mandatory QA (desktop + mobile + image-review) — our quality bar
- `copy` as a default agent — conversion surfaces are common in Next.js apps; demote only if it proves unused

## Locked default catalog

**Agents:** planner, app-engineer, security, design, qa, copy  
**Optional agents:** lead-architect, docs, deploy, research  

**Skills:** planning, nextjs-app-router, supabase-auth-rls, postgres-migrations, owasp-security-review, frontend-design, accessibility-wcag, browser-qa, testing-qa, product-copy, deslop, ship  
**Optional skills:** ui-polish, docs, upgrade, debug

### 2026-09-12 follow-up

- Uplifted `frontend-design` and the Design agent against a fresh GitHub scan (structure only, no bodies copied): Anthropic `frontend-design` (2026-06 process still current), addyosmani `frontend-ui-engineering`, `educlopez/ui-craft`, `funboy322/avoid-ai-design`, `superdesigndev/superdesign-skill`, `google-labs-code/design.md`. Added named modes (`build` / `review` / `detect`), surface profiles, `DESIGN.md` as token source of truth, and code-certain vs inferred findings. Did **not** import ui-craft MCP, Superdesign canvas/CLI, or older `frontend-design` forks that default to mesh gradients and decorative atmosphere.

### 2026-09-09 follow-up

- Uplifted `nextjs-app-router`, `supabase-auth-rls`, `postgres-migrations`, and `owasp-security-review` from checklists to playbooks. Structure from Next.js 16 App Router / `proxy.ts` / async request APIs and Supabase SSR+RLS docs. No third-party skill bodies. This pack’s auth stays Supabase (not Clerk/Auth0/NextAuth as the default).

### 2026-09-06 follow-up

- Added `deslop` as a default skill. Copy’s end run is always `product-copy` then `deslop` (second pass on the rewrite). Patterns from `conorbronsdon/avoid-ai-writing` and `funboy322/avoid-ai-design` — catalogs not copied.
- Uplifted `frontend-design` against Anthropic `frontend-design` (2026-06), `educlopez/ui-craft`, `superdesigndev/superdesign-skill`. Kit HTML keeps charcoal desk tokens. Downstream apps write 4–6 product tokens. Cream-editorial, neon-on-black decoration, SaaS card kits, and broadsheet newsprint are treated as 2026 defaults.  
