# Roadmap And Delivery Tracker

This file is the source of truth for what to do next. Phases 1–9 are the historical record (package bootstrap through the 0.3 council OS and the 0.4 simplify). **Active work is Phase 10.**

Status legend:

- `[x]` Done
- `[ ]` Not started
- `[~]` In progress or partially complete

How to use this file:

1. Pick the first `[ ]` item in the current wave. Do not skip ahead to orchestration.
2. One item per PR when the change is a skill or agent playbook. Docs-only items can share a PR.
3. Every skill uplift uses the same bar: YAML `name` + `description`, Use when, Do/Checks, Reject, Done when. Tests lock the contract on `init`. Planner names who runs it.
4. Default `init` stays agents + skills + user guide. Do not restore session, Studio, research, or `orchestrate` as the default install.

Playbook bar (what “top class” means here): `nextjs-app-router`, `supabase-auth-rls`, `postgres-migrations`, `owasp-security-review`, `frontend-design`, `accessibility-wcag`, `testing-qa`, `ship`, `browser-qa`, and `deslop` already meet it. Optional `debug`, `docs`, `upgrade`, and `ui-polish` meet it when added.

## Phase 10: 0.4 Kit Quality — Playbooks, Skill Use, Spawn Handoff

Goal: the default pack is even. Every default skill is a playbook. Agents name the skill they must run. After `init`, the current chat launches each specialist in New feature order. You describe the change once. Planner does not implement. One chat does not impersonate all six.

Keep:

- Six default agents, twelve default skills, optional add-ons
- Screenshot fail-closed QA
- Kit charcoal desk off product apps
- One `frontend-design` skill, no design MCP/canvas OS
- Planner names the owner and does not implement. The session launches the next specialist.

### Wave 0 — Finish what is in flight

Owner: this branch / PR #38. Merge before starting Wave 1.

- `[x]` Publish `frontend-design` modes (`setup` / `build` / `review` / `detect`), the new-repo **setup interview**, and the `accessibility-wcag` playbook (10.1). Files: `skills/frontend-design/SKILL.md`, `skills/accessibility-wcag/SKILL.md`, `agents/design/agent.md`, `agents/qa/agent.md`, `USER_GUIDE.md` / `USER_GUIDE.html`, tests, examples.
- `[x]` Cut npm **0.4.4** after #38 merges (`changeset`, Version Packages, `npm run release:check`).
- `[x]` Rewrite this roadmap so remaining work is ticket-shaped (this change).

Acceptance: #38 merged, changelog 0.4.4 on npm, setup paste prompt in the user guide, `accessibility-wcag` playbook installed by `init`.

### Wave 1 — Playbook parity for remaining default skills

Do these in order. Same shape as the 2026-09-09 domain-skill uplift. Structure from public docs and GitHub skill scans; **no third-party skill bodies**.

#### 10.1 `accessibility-wcag` playbook

- **Owner:** Design (writes), QA (must run on screens)
- **Why:** 27-line checklist. Keyboard and contrast are named, but there is no Reject list, no Done-when that fails closed, and no mapping onto App Router forms / dialogs.
- **Do:** Use / Checks / Reject / Done-when. Name WCAG 2.1 AA. Require a keyboard pass in the running browser. Reject “contrast looks fine in the screenshot” without a keyboard pass. Point at `browser-qa` for visual proof.
- **Files:** `skills/accessibility-wcag/SKILL.md`, `agents/qa/agent.md`, `agents/design/agent.md`, `skills/planning/SKILL.md`, `tests/domain-skills.test.ts`, `checklists/` if the existing a11y checklist should match
- **Depends:** Wave 0 (landed on the same in-flight PR)
- **Status:** `[x]`

Acceptance: init installs the playbook; tests lock Reject + keyboard-in-browser; QA and Design still name the skill.

#### 10.2 `testing-qa` playbook

- **Owner:** QA
- **Why:** 29-line checklist. It already says it does not replace domain skills or `browser-qa`. It still lacks Reject, a required command shape, and RLS/auth fail-closed examples.
- **Do:** Use / Checks / Reject / Done-when. Name unit vs regression vs smoke. Reject `toBeVisible` as visual proof. Require auth/RLS tests to fail when another user can read the row. List commands actually run.
- **Files:** `skills/testing-qa/SKILL.md`, `agents/qa/agent.md`, `tests/domain-skills.test.ts`
- **Depends:** 10.1 can land in parallel; do not merge both without a shared test file rebase
- **Status:** `[x]`

Acceptance: tests lock “does not replace `browser-qa` / `supabase-auth-rls`” and a Reject line; QA agent still requires `testing-qa` plus `browser-qa`.

#### 10.3 `ship` playbook

- **Owner:** QA names it; App engineer / Security contribute env and RLS checks
- **Why:** 22-line checklist. No Reject, no rollback template, no “user-visible needs `browser-qa` evidence” as a fail.
- **Do:** Use / Checks / Reject / Done-when. Go/no-go. Name env, migration order, rollback, secrets, screenshot evidence. Reject “LGTM, ship it” without commands or screenshot paths for UI.
- **Files:** `skills/ship/SKILL.md`, `src/install/roster-adapters.ts` (`/ship`), `USER_GUIDE.md` skill table, `tests/`
- **Depends:** 10.2 (ship should point at the uplifted testing-qa language)
- **Status:** `[x]`

Acceptance: `/ship` and the skill agree; tests lock rollback + `browser-qa` evidence.

Wave 1 done when: every **default** skill has Use / Reject / Done-when. `wc -l` is not the bar; Reject + Done-when + an init test is.

### Wave 2 — Optional skills: honest playbooks or stay stubs

Optional skills start as stubs. Uplift to the playbook bar or stay stubs. `agent-kit add skill <id>` must install a playbook, not a three-line reminder.

#### 10.4 `debug`

- **Owner:** App engineer
- **Do:** Reproduce → localize → reduce → fix → guard. User-visible bugs require before/after `browser-qa`. Reject guessing from the stack trace alone.
- **Files:** `skills/optional/debug/SKILL.md`, `USER_GUIDE.md` “Adding more”
- **Status:** `[x]`

#### 10.5 `docs`

- **Owner:** optional Docs agent
- **Do:** Update only `USER_GUIDE`, `CHANGELOG`, and the living file the change actually moved. Reject restoring the 17-doc OS.
- **Files:** `skills/optional/docs/SKILL.md`, `agents/optional/docs/agent.md`
- **Status:** `[x]`

#### 10.6 `upgrade`

- **Owner:** optional
- **Do:** `agent-kit update` on a branch; local edits win; never delete user files. Point at `UPGRADE.md`. Reject `init --force` as the upgrade path.
- **Files:** `skills/optional/upgrade/SKILL.md`, `UPGRADE.md` (link only)
- **Status:** `[x]`

#### 10.7 `ui-polish`

- **Owner:** Design
- **Do:** After `frontend-design`, not instead of it. If `DESIGN.md` is missing, send Design to `setup` first. Still desktop + mobile.
- **Files:** `skills/optional/ui-polish/SKILL.md`
- **Status:** `[x]`

Wave 2 done when: `agent-kit add skill <id>` installs a playbook, not a three-line reminder. **Done.** `debug`, `docs`, `upgrade`, and `ui-polish` are playbooks.

### Wave 3 — Agents know which skill to run, and the relay is paste-ready

This is the “talk to each other” work **without** an orchestrator. Handoff stays: specialist A finishes → user pastes Planner’s prompt into specialist B.

#### 10.8 Planner emits a paste-ready handoff

- **Owner:** Planner
- **Why:** Planner names an owner but does not give the user the prompt to paste. USER_GUIDE has prompts; the agent does not print them.
- **Do:** `planning` Done-when includes a fenced prompt for the owning agent (and extra reviewers). Example: if owner is Design and `DESIGN.md` is missing, print the setup prompt. If owner is QA, print the screenshot prompt.
- **Files:** `skills/planning/SKILL.md`, `agents/planner/agent.md`, `USER_GUIDE.md` (keep prompts in one place; planning copies them)
- **Status:** `[x]`

Acceptance: a plan reply always contains a copy-paste block the next specialist can run.

#### 10.9 Each agent’s Handoff section names the next paste

- **Owner:** each default agent
- **Do:** After Done-when, say who gets the work next and which USER_GUIDE prompt to paste. App engineer → Security (if auth/data) and QA. Design → Copy (public words) and QA. Copy → Design (visual P0s) then QA. Security → QA.
- **Files:** `agents/*/agent.md`
- **Status:** `[x]`

Acceptance: no default agent ends with “you do not run the others” without a next paste.

#### 10.10 Skill YAML descriptions that actually trigger

- **Owner:** docs + tests
- **Why:** Cursor matches skills from `description`. Weak descriptions (`Use for…`) lose to a generic chat.
- **Do:** Every default skill description includes the trigger phrases a user would type (`RLS`, “looks generic”, “is this done”, “ship”, “empty state”). Add a test that descriptions are unique and contain Use-when nouns.
- **Files:** each `skills/<id>/SKILL.md` frontmatter, `tests/agent-catalog.test.ts` or a new `tests/skill-frontmatter.test.ts`
- **Status:** `[x]`

#### 10.11 Copilot role prompts for every specialist

- **Owner:** Copilot adapter
- **Why:** Copilot has no `@agent` picker. Today the generated instructions only paste a QA prompt.
- **Do:** `.github/copilot-instructions.md` (from `roster-adapters.ts`) includes one paste block per default agent, matching USER_GUIDE.
- **Files:** `src/install/roster-adapters.ts`, `tests/ide-activate.test.ts`
- **Status:** `[x]`

#### 10.12 USER_GUIDE workflow as one sequence

- **Owner:** Copy + Design (kit HTML)
- **Do:** Keep the charcoal desk. Make “New feature” show the relay: Plan → implement → Security if needed → Design if UI → Copy if public words → QA. Each step already has a paste; do not add a fourth ticket to the first viewport unless it is the next user action.
- **Files:** `USER_GUIDE.md`, `USER_GUIDE.html`, `npm run smoke:ui-screens`
- **Status:** `[x]`

Wave 3 done when: a new user can run a feature without inventing prompts, and Copilot can play any specialist from the generated file.

### Wave 4 — Decide and ship default spawn

Waves 1–3 are done.

- `[x]` **Decide and ship default spawn:** recorded in `DECISIONS.md` (2026-09-16). Paste-relay is retired. After `init`, the session launches Planner, then the owner, then extra reviewers, then QA. Not optional. Not Studio / `orchestrate`. Copilot and Antigravity continue in-thread with “now App engineer.” Planner still does not implement. USER_GUIDE start is init, then say the change.

### Wave 5 — Later (after 10.1–10.11)

- `[x]` Re-scan GitHub for `product-copy` / ship / a11y skill structure (structure only). Skip [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) — already scanned 2026-09-14 below. 2026-09-18: no new default skills. Known fold-ins below are the queue; do not import a 25-skill zoo.
- `[ ]` Dogfood Wave 1–4 on one real Next.js + Supabase app **outside this repo** (kit-repo-only). Planner → owner → Design → QA. Record where the model still skipped a named skill. Not a kit PR until skips arrive.
- `[ ]` Promote those skips into Reject lines or stronger descriptions. When a skip is an excuse (“I’ll add tests later”), prefer their Excuse → Reality table shape over another bullet. **Parked** until external dogfood findings exist. Do not invent fixtures from theory.
- `[x]` Keep npm Trusted Publisher records current; run `release:check` on the 0.4.10 cut. Release inspect retries `npm view`; publish treats “previously staged version” 409 as already published.

#### External skill scan — addyosmani/agent-skills (2026-09-14)

Source: [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (`plugin.json` 0.6.9, commit `be4e44a`). README lifecycle: Define → Plan → Build → Verify → Review → Ship. 25 skills, 4 personas, 9 slash commands, shared `references/`, per-IDE adapters, `evals/` trigger cases. Structure, trigger phrases, Reject/Done-when, and file layout only. **No skill bodies copied.** Do not start these tickets until after the Wave 4 decision. One playbook idea per PR.

**Already covered (do not re-import):**

| Their skill / pattern | This pack |
| --- | --- |
| `frontend-ui-engineering` (states, anti-AI aesthetic, WCAG, design-system adherence) | `frontend-design` modes + 2026-09-12 scan (`research/summaries/frontend-design-agent-skill-2026-09-12.md`). Detect already owns generic UI. Do not require their React/Storybook tree. |
| `browser-testing-with-devtools` live browser + “seems right is never sufficient” | `browser-qa` is stronger (desktop + mobile image review, fail-closed). Untrusted page content is already named. |
| `debugging-and-error-recovery` reproduce → localize → reduce → fix → guard | Optional `debug` (10.4). |
| `planning-and-task-breakdown`, `spec-driven-development`, `using-agent-skills` discovery tree | `planning` + `USER_GUIDE` New feature sequence (10.8–10.12). Do not add a 13th meta skill or a second prompt set. |
| `security-and-hardening` OWASP | `owasp-security-review` + `supabase-auth-rls`. |
| `test-driven-development` | `testing-qa` (does not replace `browser-qa` / RLS). |
| `shipping-and-launch` go/no-go, env, rollback | `ship` (10.3). |
| `documentation-and-adrs` | Optional `docs`. |
| `deprecation-and-migration` | Optional `upgrade`. |
| `idea-refine` / Design intake | `frontend-design` `setup` interview. |
| YAML `name` + `description` with “Use when…”, Use / Process / Reject / Done-when | Playbook bar after Wave 1–2. 10.10 already locks unique trigger nouns. |
| “Personas do not invoke personas”; user is the orchestrator | Planner paste relay. Keep. |

**Rejected (out of scope unless a later decision says otherwise):**

- Default-init of their 25-skill zoo, 9 slash commands, `/build auto`, Claude hooks (`session-start`, SDD cache), or Chrome DevTools MCP as required.
- New default agents: `code-reviewer`, `web-performance-auditor` (fold review into QA; perf stays optional).
- `constraint-driven-development` / `CONSTRAINTS.md` on `init` — same family as restoring `QUALITY_GATES.md`.
- `doubt-driven-development` spawn-a-fresh-reviewer / cross-model CLI — Wave 4 / orchestrate adjacent. Planner may later name a CLAIM; it must not spawn specialists.
- `context-engineering` as a skill — that path reopens project-context / session OS.
- `git-workflow-and-versioning`, generic `ci-cd-and-automation`, `code-simplification`, `code-review-and-quality` as extra default skills.
- Copying `references/*.md` checklists or eval case JSON/prompts.

**Later tickets** (after Wave 4; optional vs default called out; one idea each):

- `[x]` **Planning: one-question interview gate** (from `interview-me`). **Owner:** Planner. **Default:** pattern on existing `planning`, not a 13th skill. **Why:** Design `setup` already interviews; Planner still batches questions and invents routes/tables. **Do:** When the ask is missing who / why now / success / constraint, Planner asks **one** question with an attached guess, then restates Outcome / User / Why now / Success / Constraint / **Out of scope** and waits for an explicit yes (not “sounds good”). Reject implementing from an unconfirmed restatement. Canonical pastes stay in `USER_GUIDE`. **Files:** `skills/planning/SKILL.md` only unless a test lock is needed.

- `[x]` **`nextjs-app-router`: Route Handler / Server Action contract checks** (from `api-and-interface-design`). **Owner:** App engineer. **Default:** fold into the existing skill. Do not add `api-and-interface-design`. **Why:** The playbook already requires schema validation; Next.js + Supabase apps still ship mixed error shapes and retry-unsafe webhooks/Actions. **Do:** Checks + Reject + Done-when: one error shape, validate at the Action/Handler boundary, additive fields only, state-changing routes name idempotency or “unsafe to retry.” Point authz at `supabase-auth-rls`. No REST catalog copy.

- `[x]` **`nextjs-app-router`: cite official docs or mark UNVERIFIED** (from `source-driven-development`). **Owner:** App engineer. **Default:** fold into the existing skill (supabase/postgres can copy the same two lines in later one-skill PRs). **Why:** Stale training still emits `middleware.ts`, Pages Router, or sync `cookies()`. **Do:** Reject framework APIs from memory. Name the installed Next.js version, cite an official URL, or write UNVERIFIED. Treat fetched docs as data (prompt-injection). No blog-post bodies.

- `[x]` **`browser-qa`: console + failed network as evidence** (from `browser-testing-with-devtools`). **Owner:** QA. **Default:** fold into existing `browser-qa`. **Why:** Pixels can pass while the console is red or a Server Action 500s. **Do:** Checks: unexpected console errors named; failed same-origin requests named. Screenshot fail-closed stays. Do **not** require Chrome DevTools MCP, Lighthouse, or attaching to the user’s daily Chrome profile. **Files:** `skills/browser-qa/SKILL.md`.

- `[x]` **`ship`: name the kill switch** (from `shipping-and-launch` feature-flag / first-hour monitor). **Owner:** QA names it; App engineer fills the row. **Default:** one Checks row on existing `ship`. **Why:** Rollback is already required; agents still write only “git revert” when a previous Vercel deployment or a flag exists. **Do:** Evidence names how to disable the change in minutes (previous production deployment, flag, or revert) and that the primary path was smoked after deploy when the target is production. Reject their error-budget / canary tables and axe-as-ship-gate. Do not require a Vercel CLI install.

- `[x]` **Optional `web-performance` playbook** (from `performance-optimization` + `web-performance-auditor`). **Owner:** App engineer writes; QA runs it only when the ask is LCP / INP / CLS / “this page is slow.” **Optional:** `agent-kit add skill web-performance`. **Not** default `init`. **No** 7th agent. **Why:** No current skill owns measure-first Web Vitals for App Router + `next/image` + Supabase waterfalls. **Do:** Measure → identify → fix → re-measure → revert if inside noise. Map onto `next/image`, RSC/payload size, and PostgREST select/embed (N+1). Reject optimizing from a guess. Do not require Lighthouse CI on init.

- `[ ]` **Trigger utterance fixtures** (from their `evals/` Tier 2, not Tier 3). **Owner:** docs + tests. **Do after** the Wave 5 dogfood skip list. **Why:** 10.10 locks one noun per description; they add paraphrased user asks plus a pairwise “this phrase belongs to skill B.” **Do:** Small positive/negative phrase list in `tests/skill-frontmatter.test.ts` (or a sibling). Lexical only. No headless-Claude behavioral runner. Do not copy their `evals/cases/*.json`.

#### Frontend skill scan — 2026-09-14

Sibling to the addyosmani pack scan above. Broader **frontend** agent/skill packs (screens, not generic coding). Trigger: user opened `USER_GUIDE.html` first viewport and called it really bad. Design `kit-html` / `review` first, then structure-only GitHub scan. **No third-party bodies.** Wave 4 spawn-handoff is shipped. Do not change Wave 3 10.x checkboxes. Six default agents, twelve default skills. Planner names the owner and does not implement. Kit charcoal stays off product apps. `USER_GUIDE.html` is the one `kit-html` surface.

**Why the first viewport fails** (desktop screenshot 2026-09-14 + live HTML; mobile inferred from CSS — frames stay two-column under 520px):

| Severity | Finding | Where | Confidence |
| --- | --- | --- | --- |
| P0 | Slogan-hero + two equal feature cards + fail well + four ticket wells. Generic SaaS onboarding. First viewport is not the characteristic object (init command / one Planner paste). | `.top`, `h1`, `.frames`, `.ticket` | code-certain |
| P0 | QA “frames” are styled wells, not frames. Body type wraps in half-width columns. ui-craft pattern: fake screenshot rectangles. | `.frame` | code-certain |
| P0 | Tracked-out ALL-CAPS wordmark, middle-dot meta, tracked uppercase kicker. Our own Type reject + Anthropic / ui-craft template grammar. | `.wordmark`, `.kicker` | code-certain |
| P0 | Mast nav crowding: five items + wordmark on one baseline; wraps like SaaS chrome. | `.mast` | code-certain |
| P0 | Four numbered tickets in the first viewport. 10.12 said no fourth ticket unless it is the next user action. Ticket 04 (Design setup) is a second path. Numbered tickets only when the content is a real sequence — this is a card stack. Headers wrap (`Ticket 01` vs “Install every IDE…”). | `#start .ticket` | code-certain |
| P0 | Hierarchy from cards, not size / weight / space: frame wells, fail-closed well, ticket wells. | `.frame`, `.rule`, `.ticket` | code-certain |
| P0 | Safelight on the kicker **and** the fail-closed label. One accent, few placements, required / fail only. Kicker is decoration. | `.kicker`, `.rule strong` | code-certain |
| P0 | Display-hero headline (`clamp(2.15rem … 3.35rem)`) over a standfirst — landing-page hierarchy on a field guide. | `h1` | code-certain |
| P0 | Mobile (~390): `.top` stacks intro → rule → **four tickets** → frames. The QA object drops below the ticket wall. Frames stay `1fr 1fr` at 0.72rem. | `@media (max-width: 520px)` | code-certain (CSS); pixels inferred |
| P1 | Copy buttons wrap to two lines. Charcoal desk structure is itself a 2026 broadsheet default — keep tokens, rebuild layout. Do not paste a second brand. | `button.copy`; kit-html profile | inferred |

Verdict: reject as generic SaaS on charcoal. Do **not** restyle with a new brand. Deliberate `kit-html` rebuild ticket below.

**Repos scanned** (structure / YAML triggers / review loop / visual-QA contract only):

| Repo | Useful pattern | Already have | Take as |
| --- | --- | --- | --- |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) `frontend-ui-engineering` (not a separate repo) | States, anti-AI table, Common Rationalizations, Verification checklist, YAML “Use when” | `frontend-design` + sibling Wave 5 addyosmani tickets | Already covered. Do not duplicate. Reject Storybook tree + required DevTools MCP. |
| [anthropics/skills](https://github.com/anthropics/skills) `frontend-design` | Plan → uniqueness check → build → screenshot critique. First viewport = characteristic thing. 2026 clusters include broadsheet / numbered markers / middle-dot meta | Modes, 2026 rejects, “spend boldness once” (2026-09-12) | **Default playbook:** detect must fail this kit’s own first viewport. **kit-html only:** rebuild. Reject skill body. |
| [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | Tokens normative; prose is usage; lint / diff CLI | Short product `DESIGN.md` in `setup` | Already have. Reject YAML schema + `@google/design.md` CLI on `init`. Not an optional skill. |
| [educlopez/ui-craft](https://github.com/educlopez/ui-craft) | Discovery + stack detect before CSS; review table; surgical vs rebuild; reject div-mockup frames, numbered eyebrows, card-wrapped sections; accent budget 3–5 above the fold | `setup` / surfaces / review table | **Default playbook:** detect fail for fake screenshot frames + first-viewport card soup. **kit-html only:** one accent, no frame-cards. Reject MCP, `/craft` catalog, knobs, `.ui-craft/` OS, 0–100 score, parallel review agents. |
| [funboy322/avoid-ai-design](https://github.com/funboy322/avoid-ai-design) | `detect` vs `rewrite`; P0/P1/P2; code-certain vs inferred; YAML trigger phrases (“de-slop”, “don’t change the code”); catalog pass necessary not sufficient; clear problem vs judgment call | `detect` / `review` table | **Default playbook:** YAML triggers + detect “judgment call” column. Reject their tell catalog verbatim. |
| [superdesigndev/superdesign-skill](https://github.com/superdesigndev/superdesign-skill) | Init from existing tokens / components before generating UI | `setup` scan | Already have. Reject canvas CLI, auth, credits, `.superdesign/`, presentations / graphics. |
| [Dammyjay93/interface-design](https://github.com/Dammyjay93/interface-design) | Intent-first; one focal point; swap / squint / signature tests; desktop + mobile before presenting; review-before-code | `setup` interview + `browser-qa` | **Default playbook:** name those three self-tests on `review` / `detect` Done-when. Reject Linear/Stripe-as-the-bar, `.interface-design/` memory OS, slash commands, render widgets. Not a 13th skill. |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | VARIANCE / MOTION / DENSITY dials; image-then-code | Surface profiles; `setup` asks need first | **Reject.** Aesthetic zoo + GSAP + imagegen is a second brand pack. |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Huge style / palette catalog + `npx … init` | — | **Reject.** 79 styles / 192 palettes is a marketplace OS. |
| [Anionex/agent-vision-toolkit](https://github.com/Anionex/agent-vision-toolkit) | Screenshot OCR for text-only models | Required `browser` + `screenshot` + `image-review` | **Reject.** We already have eyes. Do not add a vision CLI. |
| [vercel-labs/skills](https://github.com/vercel-labs/skills) | `npx skills add` installer | Our `init` / adapters | **Reject** as a frontend skill (installer only). |

2026-09-12 already took named modes, surfaces, `DESIGN.md` tokens, and code-certain vs inferred from the first six. This pass is: the kit HTML now fails those adopted rules; `detect` YAML / judgment-call is thin; do not grow the default catalog.

**What we will not take**

- ui-craft MCP, Superdesign canvas, taste-skill / ui-ux-pro-max style zoos, interface-design memory OS
- Google DESIGN.md YAML + CLI as required install
- Splitting `frontend-design` or adding a 7th default agent / 13th default skill
- 17-doc OS, `QUALITY_GATES`, `COUNCIL` on default `init`
- Wave 4 orchestrate
- Pasting a second brand onto kit charcoal
- Init in kit root

**Later tickets** (after Wave 4; one idea each; optional vs default called out):

- `[x]` **`kit-html` visual rebuild** (from Anthropic first-viewport rule + ui-craft “no fake frames / no card-wrapped sections” + this screenshot). **Owner:** Design. **kit-html only.** Not a product-app restyle. **Why:** The charcoal desk is the right token set; the first viewport is a SaaS landing. **Do:** Keep `#10100e` / `#eceae4` / safelight-for-fail-only / Helvetica Neue + mono / 2px / no shadow. First viewport = the work: init command and **one** Planner paste. Drop slogan-hero scale. Drop frames-as-cards (one line of proof, or a real attached screenshot later — not two dark wells). Collapse tickets: 01–03 are the sequence; Design setup is a later “New repo” block, not ticket 04 in the fold (10.12 stands). Kill tracked ALL-CAPS / middle-dot mast and kicker. One accent on the fail-closed sentence only. Mobile ~390: single column; primary copy control above the fold; do not keep 2-col frames at 0.72rem. `npm run smoke:ui-screens`. **Files:** `USER_GUIDE.html` (and example copy). Do not rewrite `USER_GUIDE.md` New feature unless copy moves. Do not implement in the same PR as a skill uplift.

- `[x]` **`frontend-design` `detect` uplift** (from `funboy322/avoid-ai-design` + ui-craft review + Dammyjay93 self-tests). **Owner:** Design. **Default playbook** on the existing skill. Not an optional skill. **Why:** Detect already says audit-only + P0 table, but it did not fail this kit’s first viewport, and YAML will not trigger on “USER_GUIDE looks bad” / “don’t change the code.” **Do:** YAML `description` trigger phrases: “looks generic”, “de-slop a UI”, “don’t change the code”, “USER_GUIDE.html looks bad”, “kit-html”. Detect output: severity table plus **clear problem vs judgment call**. Done-when fails if (a) first viewport is slogan + equal cards + numbered ticket stack, (b) QA “frames” are styled divs, (c) tracked ALL-CAPS + middle-dot meta appear without a content reason, (d) swap / squint / signature tests are unnamed. Catalog-clean is necessary, not sufficient. **Files:** `skills/frontend-design/SKILL.md`, Design agent if one line, `tests/` lock on trigger nouns. No third-party catalogs.

**Optional vs default:** no new optional frontend skill from this scan. `ui-polish` stays the only optional design add-on. If dogfood later shows “Design skipped detect,” promote a Reject line on the existing skill — do not `agent-kit add skill ui-craft`.

### Not doing (unless Wave 4 says otherwise)

- Restoring 17 living docs, `QUALITY_GATES.md`, or `COUNCIL.md` on default `init`
- A design MCP, canvas CLI, or slash-command marketplace
- Splitting `frontend-design` back into six critique skills
- Making Planner implement, or making one chat play all six roles
- Treating `agent-kit orchestrate` as required for a “good kit”

## Historical record (Phases 1–9)

These phases built the package, the council OS, research, Studio, and the 0.4 simplify. They stay for traceability. Do not reopen them as current work.

## Phase 1: Bootstrap Package Repo

- `[x]` Create TypeScript npm package for `@appsforgood/next-supabase-kit`.
- `[x]` Add `agent-kit` CLI entrypoint.
- `[x]` Add installable asset folders: `templates`, `agents`, `skills`, `prompts`, `checklists`, and `design-adapters`.
- `[x]` Add root docs: `README.md`, `DOCS.md`, `SECURITY.md`, `CONTRIBUTING.md`, and `CHANGELOG.md`.
- `[x]` Initialize local git repo on `main`.
- `[x]` Create initial local commit.
- `[x]` Create GitHub repo `lukey662/agentsandskills`.
- `[x]` Push local `main` to GitHub.

Acceptance:

- Local repo exists, package builds, and remote repo is connected.

## Phase 2: CLI Install, Audit, Diff, And Update

- `[x]` Implement `agent-kit init --stack next-supabase`.
- `[x]` Implement conflict-safe template writes.
- `[x]` Track installed state in `.agent-kit/manifest.json`.
- `[x]` Copy library assets into `.agent-kit/`.
- `[x]` Implement `agent-kit audit`.
- `[x]` Implement `agent-kit diff`.
- `[x]` Implement `agent-kit update`.
- `[x]` Implement `agent-kit add skill <name>`.
- `[x]` Implement `agent-kit doctor`.
- `[x]` Add richer stale-template detection using template hashes.
- `[x]` Add machine-readable audit output with `--json`.

Acceptance:

- Existing projects can install the kit without overwriting local docs.
- Audit reports missing docs, security gaps, frontend-design gaps, and testing gaps.

## Phase 3: Core Templates, Agents, Skills, And Checklists

- `[x]` Add downstream templates for `AGENTS.md`, `AGENT_ROSTER.md`, `COUNCIL.md`, `SKILLS.md`, `SPEC.md`, `DECISIONS.md`, `DOCS.md`, `DESIGN.md`, `QUALITY_GATES.md`, `STYLE_GUIDE.md`, `SECURITY.md`, `TESTING.md`, and `DEPLOYMENT.md`.
- `[x]` Add core agents: architect, Next.js, Supabase/Postgres, security, frontend design, QA, docs, deployment, and research.
- `[x]` Add core skills: Next.js App Router, Supabase Auth/RLS, Postgres migrations, OWASP review, content-first design, frontend design, accessibility, testing, docs, and deployment.
- `[x]` Add checklists for OWASP, RLS, brand/content, frontend quality, accessibility, testing, and deployment.
- `[x]` Add example installed output for a sample Next.js/Supabase project.
- `[x]` Add compatibility profiles for SaaS, marketplace, admin app, and content app.

Acceptance:

- A downstream project receives a practical agent/skills/docs setup that another engineer or agent can use immediately.

## Phase 4: Frontend Design Differentiation Foundation

- `[x]` Add anti-generic-AI-site frontend design skill.
- `[x]` Add provider-neutral design adapters for Google Stitch, Claude, Figma, and human designers.
- `[x]` Add frontend-quality checklist.
- `[x]` Add example design briefs for SaaS, admin dashboards, marketplaces, content apps, and tools.
- `[x]` Add audit checks for missing design tokens, missing states, and generic landing-page patterns.
- `[x]` Add screenshot-review prompt for finished UIs.

Acceptance:

- The kit actively prevents generic AI-generated UI defaults and provides reusable design-review workflows.

## Phase 4B: Content-First Creative Design Maturity

- `[x]` Run a focused second-pass review of design identity, visual QA, content-first guidance, and agent-readable design-system repos.
- `[x]` Add `DESIGN.md` as a first-class installed root document.
- `[x]` Add content-first design skill.
- `[x]` Add brand/content intake and creative-direction matrix prompts.
- `[x]` Add brand/content checklist.
- `[x]` Expand vertical design briefs for ecommerce, portfolio/venue, education/course, community/social, and AI workflow products.
- `[x]` Wire Frontend Design Lead to content-first design and creative-direction ownership.
- `[x]` Add audit checks for `DESIGN.md`, content-first style-guide language, and frontend workflow creative-direction outputs.

Acceptance:

- Frontend changes cannot pass as best-practice setup solely because they have tokens, states, and a screenshot prompt; they must also have brand/content inputs and creative-direction evidence.

## Phase 4C: Visual QA And Regression Maturity

- `[x]` Run a focused review of Storybook, Playwright screenshot, Chromatic, Argos, Loki, and component-state testing patterns.
- `[x]` Add visual regression QA skill.
- `[x]` Add visual-regression checklist.
- `[x]` Add visual QA planning prompt.
- `[x]` Update `TESTING.md` with baseline, strong, and mature visual QA tiers.
- `[x]` Wire Frontend Design Lead and QA Engineer to visual QA evidence.
- `[x]` Add audit warning when `TESTING.md` lacks visual QA or visual-regression evidence.
- `[x]` Update research scanner seeds and heuristics for visual-regression signals.

Acceptance:

- Important frontend changes have a documented visual QA tier, and projects can move from screenshot review to Playwright, Storybook, Chromatic, Argos, Loki, or equivalent visual evidence without changing the agent operating model.

## Phase 4D: Schema-Backed Council Traceability

- `[x]` Add JSON Schema contracts for agent rosters and council-session records.
- `[x]` Add `COUNCIL.md` as the installed handoff and council-session evidence template.
- `[x]` Add Agent Handoff Tracing skill, council-session review prompt, and agent-council checklist.
- `[x]` Wire Planner, Lead Architect, and Documentation Maintainer to handoff tracing by default.
- `[x]` Copy `schemas/` into downstream `.agent-kit/` installs.
- `[x]` Add audit checks for missing schema contracts, weak handoff rules, and incomplete `COUNCIL.md` evidence.
- `[x]` Add runtime contract validation for `.agent-kit/agent-roster.json`.
- `[x]` Add optional runtime validation for `.agent-kit/council-sessions/*.json` records.
- `[x]` Add tests that prevent publishing without schema-backed council assets.

Acceptance:

- Multi-agent work is no longer only described in prose. The package installs a machine-readable roster, schema-backed session evidence format, and audit rules that validate roster shape, optional structured session records, and whether core handoff evidence can be captured.

## Phase 4E: Best-Practice Maturity Model

- `[x]` Run a focused follow-up review of production, repository-health, supply-chain, and visual-testing readiness guidance.
- `[x]` Add `QUALITY_GATES.md` as an installed downstream maturity model.
- `[x]` Define baseline, strong, and best-practice evidence levels.
- `[x]` Cover council routing, architecture, security, Supabase/RLS, frontend, accessibility, testing, release, and repo-health evidence.
- `[x]` Add audit checks for incomplete maturity-model coverage.
- `[x]` Add tests that warn when `QUALITY_GATES.md` is hollowed out.
- `[x]` Add project-evidence placeholder warnings so fresh setup is not mistaken for completed maturity evidence.
- `[x]` Add `agent-kit audit --min-readiness <level>` so downstream CI can enforce baseline or best-practice thresholds.
- `[x]` Add `schemas/audit-report.schema.json` so machine-readable audit output has a stable downstream contract.
- `[x]` Record maturity-model research summary and promoted updates.
- `[x]` Add `BEST_PRACTICE_EVIDENCE.md` mapping repeated research findings to concrete installed assets and validation gates.

Acceptance:

- The kit no longer relies on the claim that 100 repos were reviewed. Downstream projects receive an explicit evidence model for what still separates baseline setup from strong delivery and best-practice readiness, and audit warns when starter placeholders remain.

## Phase 4H: Assistant Adapter Activation

- `[x]` Review current AGENTS.md, GitHub Copilot/VS Code instructions, Cursor project rules, and Claude Code subagent surfaces.
- `[x]` Add `ASSISTANT_ADAPTERS.md` as an installed downstream activation tracker.
- `[x]` Add provider-neutral adapter templates in `assistant-adapters/`.
- `[x]` Copy assistant adapters into downstream `.agent-kit/` installs.
- `[x]` Add audit checks for missing adapter templates and weak tool-surface mapping.
- `[x]` Add public-readiness tests for adapter assets and package contents.

Acceptance:

- The kit no longer assumes that a machine-readable roster alone makes agents active. Downstream projects receive concrete adapter templates and an evidence file for verifying that their chosen AI tools load the canonical council instructions.

## Phase 4I: Upgrade Lifecycle Maturity

- `[x]` Review high-signal framework, migration, registry, and tooling upgrade patterns.
- `[x]` Add package-level `UPGRADE.md`.
- `[x]` Add installed downstream `UPGRADE.md`.
- `[x]` Add Upgrade Maintenance skill.
- `[x]` Add upgrade checklist and upgrade-review prompt.
- `[x]` Wire upgrade maintenance into the default council roster.
- `[x]` Add audit checks for diff/update flow, release notes, framework codemods, Supabase migration review, generated types, audit thresholds, and rollback evidence.
- `[x]` Add public-readiness tests for upgrade lifecycle assets.

Acceptance:

- Existing projects have a safe path to adopt future kit, framework, assistant-adapter, and Supabase changes without treating updates as blind overwrites.

## Phase 4J: Reference-Led Frontend Critique

- `[x]` Run a focused follow-up review of design-system, component-primitive, accessibility, and visual-testing repos for frontend critique gaps.
- `[x]` Add Reference-Led Design Critique skill.
- `[x]` Add design-critique gate prompt and checklist.
- `[x]` Update `DESIGN.md` with reference set, anti-references, source-safety notes, and design critique verdict fields.
- `[x]` Wire Frontend Design Lead and frontend-change workflow to reference-set evidence and design critique verdict outputs.
- `[x]` Add audit warnings for missing reference-led critique guidance.
- `[x]` Add public-readiness tests for critique assets and routing.

Acceptance:

- Frontend work cannot be called best-practice merely because it has tokens, states, and screenshots. Significant UI changes must record what references taught, what must not be copied, what anti-references were rejected, and whether the final design is distinctive enough for the product.

## Phase 4K: Frontend Product-Quality Scorecard

- `[x]` Run a focused follow-up review of design-system, service-design, accessibility, component-state, and visual-testing guidance for repeatable frontend acceptance criteria.
- `[x]` Add Frontend Product Quality Rubric skill.
- `[x]` Add frontend product-quality checklist.
- `[x]` Add frontend product-quality scorecard prompt.
- `[x]` Update `DESIGN.md` with scored product-quality dimensions and acceptance thresholds.
- `[x]` Wire Frontend Design Lead and frontend-change workflow to require the scorecard.
- `[x]` Add audit warnings for missing product-quality scorecard guidance.
- `[x]` Add public-readiness tests for product-quality rubric assets and routing.

Acceptance:

- Significant frontend work now has a repeatable acceptance score across user/task fit, content specificity, visual identity, information architecture, component states, accessibility and interaction, and source safety. Best-practice frontend claims require a strong score plus desktop/mobile and visual QA evidence.

## Phase 4L: Frontend Distinctiveness Benchmark

- `[x]` Run a focused follow-up review of design-system, service-design, content, accessibility, and visual-testing guidance for product-specific frontend acceptance evidence.
- `[x]` Add Frontend Distinctiveness Benchmark skill.
- `[x]` Add frontend-distinctiveness checklist and benchmark prompt.
- `[x]` Update `DESIGN.md` with first-screen proof, content fingerprint, reference benchmark, creative divergence, asset provenance, state proof, and visual QA proof fields.
- `[x]` Wire Frontend Design Lead and frontend-change workflow to require distinctiveness benchmark evidence.
- `[x]` Add audit warnings for missing distinctiveness benchmark guidance.
- `[x]` Add public-readiness tests for distinctiveness assets and routing.

Acceptance:

- Significant frontend work cannot pass only because it has clean components, tokens, references, screenshots, and a numeric score. It must also prove the first screen, content, references, assets, states, and visual evidence are specific to the product and not interchangeable AI-site output.

## Phase 4F: Public OSS Repository Health

- `[x]` Review public repository health practices from GitHub docs and high-signal OSS repos.
- `[x]` Add issue forms for bugs, feature requests, and research-promotion proposals.
- `[x]` Add PR template requiring council scope, verification, security, docs, and citation evidence.
- `[x]` Add label source of truth and PR labeler workflow.
- `[x]` Add CODEOWNERS for default review ownership.
- `[x]` Add Dependabot updates for npm and GitHub Actions.
- `[x]` Add CodeQL JavaScript/TypeScript scanning workflow.
- `[x]` Add `CODE_OF_CONDUCT.md`, `SUPPORT.md`, and `GOVERNANCE.md`.
- `[x]` Add `REPOSITORY_SETTINGS.md` for branch protection, release environment, private vulnerability reporting, security settings, discussions, and labels.
- `[x]` Add public-readiness tests for repository health assets.
- `[x]` Add repo-health research scanner signals and refresh category.

Acceptance:

- The repo is maintainable as public OSS, not only publishable as an npm tarball. Contributor intake, labels, branch protection guidance, release environment settings, private vulnerability reporting, review ownership, dependency automation, code scanning, support, governance, and research-promotion flow are explicit and tested.

## Phase 4G: Supply-Chain And Provenance Hardening

- `[x]` Review npm Trusted Publishing/provenance, GitHub Dependency Review, and OpenSSF Scorecard guidance.
- `[x]` Add `SUPPLY_CHAIN.md` with publish identity, release gates, provenance, automation, and maintainer rules.
- `[x]` Add Dependency Review workflow for pull requests.
- `[x]` Add OpenSSF Scorecard workflow with SARIF upload.
- `[x]` Harden existing workflows with explicit concurrency and non-persistent checkout credentials.
- `[x]` Add manual publish ref validation for release workflow dispatches.
- `[x]` Add lockfile-derived CycloneDX SBOM validation to the shared release gate.
- `[x]` Add release-workflow SBOM attestation for the exact npm tarball being published.
- `[x]` Add supply-chain research scanner score and refresh category.
- `[x]` Add public-readiness tests for supply-chain assets and release controls.

Acceptance:

- The repo can explain and verify why the npm package is trustworthy: OIDC publishing, provenance expectations, SBOM attestation, release gates, dependency review, Scorecard, code scanning, dependency update automation, and workflow controls are explicit and tested.

## Phase 5: 100 Repo Research Engine

- `[x]` Add GitHub research config.
- `[x]` Implement `agent-kit research discover`.
- `[x]` Implement `agent-kit research scan`.
- `[x]` Implement static repo scoring.
- `[x]` Generate per-repo findings.
- `[x]` Generate summary stubs.
- `[x]` Generate proposed update brief.
- `[x]` Run discovery for 100 repositories with `GITHUB_TOKEN`.
- `[x]` Review and curate the final 100-repo candidate list.
- `[x]` Run the 100-repo scan.
- `[x]` Manually review generated findings.
- `[x]` Promote repeated patterns into templates, skills, and checklists.
- `[x]` Record research-backed decisions in `DECISIONS.md` or a research summary.

Acceptance:

- v0.1 recommendations are backed by reviewed findings from 100 active open-source repositories, then promoted into installable assets, audit checks, tests, release gates, or documented decisions. Research volume alone does not count as implementation evidence.

## Phase 6: CI, Release, And Package Publishing

- `[x]` Add GitHub Actions workflow.
- `[x]` CI runs `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run smoke:install`, `npm audit --audit-level=moderate`, and `npm pack --dry-run`.
- `[x]` Add `npm run release:check` so local, CI, and release gates share one proof command.
- `[x]` Add `npm run version:check` so package metadata, lockfile metadata, changelog section, and release tag stay aligned.
- `[x]` Add `npm run examples:check` so committed installed-output examples cannot drift from the current built CLI.
- `[x]` Add public scoped package publishing config.
- `[x]` Configure public npm publishing workflow with Trusted Publishing.
- `[x]` Add release workflow and versioning policy.
- `[x]` Run release workflow dry run and confirm publish step is skipped.
- `[x]` Prepare draft GitHub Release `v0.1.0`.
- `[x]` Add reusable post-publish verification script for public `npx` doctor, clean init, and zero-failure audit.
- `[x]` Pass `npm run release:check` locally with Cursor adapter install, baseline audit gate smoke, install smoke, and npm pack dry run.
- `[x]` Add [PUBLISH.md](PUBLISH.md) release runbook for GitHub Release, workflow dispatch, and maintainer-local fallback publish.
- `[x]` Publish public v0.1 package to npm as `@appsforgood/next-supabase-kit@0.1.0`.
- `[x]` Run `npm run publish:verify` after the package is visible on npm.

Acceptance:

- Every pushed change is verified before release through the same release-readiness command maintainers can run locally.
- Package version, lockfile version, changelog section, and release tag are validated before publish.
- Packaged examples are checked against a clean install from the current built CLI before release.
- The package can be installed with `npx @appsforgood/next-supabase-kit`.

## Phase 7: Dogfood On Real Projects

- `[x]` Install into one existing Next.js/Supabase project.
- `[x]` Run `agent-kit audit`.
- `[x]` Record gaps that the audit catches.
- `[x]` Improve templates and audit rules based on real project feedback.
- `[x]` Install into a second project to confirm improvements generalize.
- `[x]` Add contribution process for downstream projects to send improvements back to the kit.
- `[x]` Re-run current built audit read-only against both older installs after schema, adapter, upgrade, maturity, visual QA, and design-critique hardening.
- `[x]` Add public-safe `DOGFOOD.md` with current adoption evidence and keep local-path dogfood notes repo-only.
- `[x]` Add deterministic older-install upgrade regression test for diff preview, conflict-safe update, and zero-failure baseline audit.

Acceptance:

- At least two real projects have installed the kit and contributed improvements back to the base. Current dogfood evidence must also show whether older installs still meet the latest baseline or need an upgrade pass.

## Phase 8: Long-Term Maturity

- `[x]` Add quarterly research refresh workflow.
- `[x]` Add changelog entries tied to research findings.
- `[x]` Add more stack profiles beyond Next.js + Supabase.
- `[x]` Add stronger automation for template diffs and local overrides.
- `[x]` Decide whether and when to open-source the repo.
- `[x]` Complete public release review: license, security, prompts, legal, and third-party citations.

Acceptance:

- The kit becomes a maintained project operating system, not a one-time prompt bundle.

## Phase 9: Guided Context And Markdown Agent Studio

- `[x]` Add `AGENT_STUDIO_PLAN.md` as the detailed implementation plan for project-context onboarding, council-session observability, human corrections, and optional local studio UI.
- `[x]` Add local-first project context contracts: `.agent-kit/project-context.json`, `.agent-kit/project-context.md`, and `schemas/project-context.schema.json`.
- `[x]` Implement guided onboarding commands: `agent-kit onboard`, `agent-kit context scan`, `agent-kit context ask`, `agent-kit context render`, and `agent-kit init --guided`.
- `[x]` Add correction contracts and commands for session, project, agent, and upstream-proposal scopes under `.agent-kit/corrections/`.
- `[x]` Add append-only council-session event logging under `.agent-kit/council-sessions/<session-id>/events.jsonl`.
- `[x]` Implement session commands: `start`, `list`, `active`, `note`, `decision`, `handoff`, `correct`, `artifact`, `verify`, `output`, `render`, and `close`.
- `[x]` Render session `index.md` and `transcript.md` from JSON/JSONL, including Mermaid handoff graphs, decisions, risks, human corrections, artifacts, verification, and next actions.
- `[x]` Update installed `AGENTS.md`, `ASSISTANT_ADAPTERS.md`, `COUNCIL.md`, `QUALITY_GATES.md`, `SKILLS.md`, and Agent Handoff Tracing skill so IDE agents read project context and corrections before meaningful work.
- `[x]` Add audit checks for missing or malformed project context, correction files, active sessions, unrendered session events, and completed sessions without required outputs or verification.
- `[x]` Add automated test coverage for schema validation, JSONL parsing, Markdown rendering, correction promotion, secret redaction, path traversal rejection, old-install update behavior, fixture projects, golden outputs, and smoke onboarding.
- `[x]` Add `npm run smoke:studio` and wire it into `npm run release:check` before any Agent Studio feature is marked complete.
- `[x]` Add optional `agent-kit studio export` static HTML view after the Markdown-first workflow is useful.
- `[x]` Add `agent-kit studio serve` — localhost live office with SSE session events, session picker, note/render POST endpoints, and interactive studio controls (Milestone 8 complete).
- `[x]` Ship optional direct orchestration as `@appsforgood/agent-kit-runtime`, reusing the roster and event contracts with LangGraph checkpoints, explicit approvals, isolated worktrees, Docker-first tools, provider/MCP adapters, bounded execution, and redacted evidence.

Acceptance:

- A new project can install the kit, answer a short guided intake, and produce useful local context without a database, hosted service, or model API key.
- A meaningful multi-agent task can be recorded as local JSON/JSONL and rendered to readable Markdown that shows agent messages, decisions, handoffs, risks, corrections, artifacts, verification, and next actions.
- Human corrections can be promoted into durable project or agent rules and loaded by future IDE-agent work.
- Audit can distinguish a generic baseline install from a context-aware install with active session evidence.
- The Markdown-first flow works without SQLite, a web server, or a separate AI orchestration runtime.
- Projects that opt into executable orchestration can validate, plan, run, pause, resume, cancel, and export a council workflow without changing the baseline IDE-driven contract.
- Every completed Phase 9 feature is covered by automated unit, regression, smoke, and security tests, and the shared release gate fails before users see broken context/session/correction behavior.

## Current Next Actions

Work Phase 10 in order. First open `[ ]` after this PR:

1. **Skip intake** — parked until external dogfood (outside this repo) names a skipped skill. Promote Excuse → Reality Reject lines. Trigger utterance fixtures wait for that list. Do not invent fixtures.
2. Wave 4 spawn-handoff is the coordination model. Planner still does not implement. Detect, planning interview, App Router contracts, `browser-qa` console/network, `ship` kill switch, and optional `web-performance` are playbooks. Do not restore session, Studio, research, or `orchestrate` as the default install.

Historical next-actions below (Trusted Publisher, orchestrate dogfood, 0.3 council) are **not** the 0.4 default queue. See Wave 5 and Phase 6 evidence if you are cutting a release.

Latest release evidence:

- Package metadata targets public npm packages `@appsforgood/next-supabase-kit` and `@appsforgood/agent-kit-runtime`.
- Release workflow uses npm Trusted Publishing/OIDC instead of a long-lived automation token.
- Public verification installs the runtime, imports its API, then installs the root kit and proves clean `doctor`, `init`, `audit`, and `orchestrate validate` behavior.
- Separate CycloneDX SBOMs and attestations bind each published tarball to its own reachable dependency graph.

Latest dogfood evidence:

- `/Volumes/Mac eSSD/qrcode`: install created five missing root docs, preserved four existing docs as conflicts, audit returned 15 pass / 7 warn / 0 fail.
- `/Volumes/Mac eSSD/AI news`: install preserved all nine existing root docs as conflicts, audit returned 10 pass / 12 warn / 0 fail.
- Content/admin real-project Agent Studio dogfood: current CLI update/onboard/session/render/static export completed, rough edge promoted into `agent-kit session output`, final audit returned 52 pass / 19 warn / 0 fail with `baseline-setup`, completed rendered session, and 14 valid events.

Latest maturity evidence:

- Quarterly research refresh workflow added at `.github/workflows/research-refresh.yml`.
- Public release review added at `PUBLIC_RELEASE_REVIEW.md`; current decision is public-ready after final npm scope and package publication.
- Stack-adaptation profiles added for Next/Firebase, Next/Postgres, and Remix/Supabase.
- Local override automation added through `.agent-kit/overrides.json`.
- Default agent council routing added through `.agent-kit/agent-roster.json`, Planner, Planning and Agent Council skill, and audit enforcement for architect-led core-change handoffs.
- Schema-backed council traceability added through `.agent-kit/schemas/`, `COUNCIL.md`, Agent Handoff Tracing skill, council-session review prompt, agent-council checklist, runtime contract validation, and audit enforcement for handoff evidence.
- Public OSS repo-health layer added through issue forms, PR template, labels, PR labeler, CODEOWNERS, Dependabot, CodeQL, repository settings, support, conduct, governance docs, public-readiness tests, and repo-health research signals.
- Supply-chain hardening added through `SUPPLY_CHAIN.md`, Dependency Review, OpenSSF Scorecard, workflow concurrency, non-persistent checkout credentials, manual publish ref validation, CycloneDX SBOM validation, SBOM attestation, supply-chain scanner scoring, and public-readiness tests.
- Release-readiness automation added through `npm run release:check`, used by CI and release workflows.
- Version discipline added through `npm run version:check`, which validates package metadata, lockfile metadata, changelog section, and release tags.
- Example consistency validation added through `npm run examples:check`, which compares committed example roster, stable manifest fields, audit output, and tree summary against a clean current-CLI install.
- Best-practice maturity model added through `QUALITY_GATES.md`, project-evidence placeholder warnings, minimum-readiness CI gates, audit-report schema contract, audit coverage, tests, and `research/summaries/maturity-model-patterns.md`.
- Upgrade lifecycle maturity added through `UPGRADE.md`, Upgrade Maintenance skill, upgrade checklist, upgrade-review prompt, audit coverage, and `research/summaries/upgrade-lifecycle-patterns.md`.
- Frontend product-quality scorecard added through rubric skill, checklist, prompt, `DESIGN.md` scorecard fields, audit coverage, roster routing, and `research/summaries/frontend-product-quality-rubric-patterns.md`.
- Agent model-routing mechanism added through `MODEL_ROUTING.md`, `.agent-kit/model-routing.json`, `schemas/model-routing.schema.json`, model-selection adapter examples, audit coverage, install/update/diff support, and public-readiness tests.
- Marketing copy maturity added through Marketing Copy Lead, `MESSAGING.md`, positioning/conversion/voice/onboarding copy skills, copy-review prompt, marketing-copy checklist, roster/model routing, and audit coverage for proof, objections, voice, and CTA evidence.
