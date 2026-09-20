# Decisions

This file records package-level architectural and research decisions for the agent kit.

## 2026-09-21 - Extract Leaderboard Structure, Reject Skill Bloat

### Context

A survey of the top 10 public skill repositories on skillleaderboard.com (Karpathy, Ponytail, UI UX Pro Max, Graphify, Caveman, Addy Osmani, Taste Skill, Understand Anything, Awesome Claude Skills, Archify) was evaluated for potential gaps in design and copywriting. Most packs either supply general developer hygiene / token compression (Karpathy, Ponytail, Caveman), graph/diagram generators (Graphify, Archify, Understand Anything), or giant theme/style catalogues (UI UX Pro Max with 84 styles; Awesome Claude Skills directories). The leaderboard contained zero dedicated copywriting skills, while Taste Skill v2 contained valuable empirical fail-closed UI/microcopy checks buried in an image-first, GSAP-heavy landing-page OS.

### Decision

- Do not install any of the top 10 repositories. Keep twelve default skills and six default agents. No 13th default skill.
- Reject style menus (UI UX Pro Max) in `frontend-design`: tokens must derive from the subject object, not style presets (glassmorphism, claymorphism, bento, brutalism). Add a one-line Design Read before deriving tokens. Flag placeholder content (Lorem Ipsum, John Doe, Acme) and avatar placeholders in the visual fail list.
- Adopt high-leverage copy and microcopy invariants into `product-copy` and `deslop`: single CTA intent per page, desktop button wrap ban (~1280), single copy register, functional form error/toast messages ("Oops!" ban), and unverified precision sweep (`99.4%`, `4.2×`) without proof or assumption mark.
- Optional `ui-polish` notes `100dvh` over `100vh` and tabular numbers for data/money.

### Consequences

The skills gain roughly 15 lines of fail-closed rules that directly prevent AI aesthetic and copy tells without increasing token bloat, creating new agents, or adding external dependencies.

## 2026-09-20 - Delete The 0.3 Source Tree And Render Each Host's Native Files

### Context

After the prune landed, the source repo still carried the whole 0.3 operating system off the CLI: `src/studio/` (29 files), `src/research/`, `src/install/{audit,audit-v2,diff,assistant-adapters-table}.ts`, `src/config/contracts.ts`, fourteen quarantined tests, four scripts, a research-refresh workflow calling removed commands, root `checklists/ prompts/ profiles/ design-briefs/ design-adapters/ rosters/ model-routing/ schemas/ antigravity/ dogfood/ docs/`, 101 generated research findings, twenty dead templates, fourteen dead adapter files, seven 0.3 root docs, a 663-line roadmap, and `packages/runtime`, the separately published LangGraph runtime that every `npm test` built first. Four runtime dependencies (`@clack/prompts`, `@octokit/rest`, `simple-git`, `zod`) were used only by those modules.

Checking each host's current documentation (September 2026) also showed the adapters were wrong, not just untidy. Claude Code refuses to launch a subagent whose `tools:` entries do not resolve to real tool names (v2.1.208+), and the kit wrote `tools: [repo, edit, terminal, browser]` into every `.claude/agents/*.md`. Cursor's subagent frontmatter is exactly `name, description, model, readonly, is_background`; the kit's `tools`/`requiredTools` keys were ignored and `readonly` (real enforcement for Planner) was unused. Codex reads skills from `.agents/skills/` and the kit wrote none for it. Copilot has native custom agents at `.github/agents/<id>.agent.md` and Antigravity has native subagents at `.agents/agents/<id>/agent.md`; the kit told both "you cannot spawn, continue in-thread." Cursor, Codex, Copilot, and Antigravity all read `.agents/skills/` (the Agent Skills open standard); the kit wrote `.cursor/skills/`, `.antigravity/runtime-skills/`, and a repo-root `skills/` folder into downstream projects.

### Decision

- Delete the 0.3 tree from source. `packages/runtime` is tagged `runtime-0.1.3` and removed with its workspace, `pre*` build hooks, tsup external, release-workflow publish path, and post-publish import check; it lives on from that tag or in its own repository. The four legacy dependencies go. `templates/next-supabase/` keeps `AGENTS.md`, `CLAUDE.md`, and the Cursor rule (moved from `assistant-adapters/`). `research/summaries/` and the shipped gap report stay as provenance. `ROADMAP.md` and `TESTING.md` are rewritten to the current queue and the current test layout. `SPEC.md` and `DOCS.md` drop their historical sections.
- One skills location: `.agents/skills/<id>/SKILL.md` on every init, plus `.claude/skills/` when Claude is activated. No more `.cursor/skills/`, `.antigravity/`, or repo-root `skills/` in installs; `--prune-legacy` removes the 0.4 copies and is guarded so it never touches `skills/` inside the kit's own source tree.
- Per-host agent frontmatter from one canonical file (`src/install/roster-adapters.ts`). Body unchanged; one `> Required tools: …` line keeps the kit's gate contract visible on hosts without a tools field. Cursor gets `readonly: true` for Planner. Claude gets real tool names (or inherits all when the agent needs browser tools), `skills:` preloading the catalog's per-agent list, and `effort: high` for planner, security, design. Copilot gets `.github/agents/<id>.agent.md`. Antigravity gets `.agents/agents/<id>/agent.md` with `subagent: true` and `skills:` paths, plus `.agents/rules/agent-kit.md`. `catalog.json` gains `agentSkills`.
- `src/install/host-frontmatter.ts` holds the documented allowlists and `validateHostAgentFile`; `adapter validate`, `doctor`, `tests/adapter-frontmatter.test.ts`, and `dogfood:check` all judge rendered files by it. `doctor` fails on a Claude file that carries the kit vocabulary.
- `AGENTS.md`, `planning`, `planner`, `CLAUDE.md`, the Copilot instructions, and the user guide say every host launches agents by id; the in-thread "now App engineer" header is a fallback for surfaces without subagents, not the Copilot and Antigravity path.

### Consequences

This repo's `npm test` no longer builds a second package first. Downstream 0.4 installs get their Claude subagents working for the first time after `update --force`, and Codex, Copilot, and Antigravity get skills and native agents they never had. Cursor may list an agent up to three times in a repo that activated Claude and Codex as well, because Cursor also reads those folders; the guide names the workaround and the roadmap tracks the check. Claude, Codex, Copilot, and Antigravity are verified against their documented schemas by tests, not by driving the hosts; live runs are the open item. Ships in 0.5.0 with the prune.

## 2026-09-20 - Retire The 0.3 Council Residue And Give Every Rule One Home

### Context

A structural review of 0.4.10 found that two generations of the kit ran at once in every install that had ever been on 0.3, including this repo. `update` never deleted, and `writeGenerated` never overwrote an existing file, so a 0.3 council `planner.md` sat at `.cursor/agents/planner.md` and shadowed the 0.4 Planner; the always-on `.cursor/rules/cursor-agent-kit.mdc` was the council version; sixteen council skills with "any user-facing screen" triggers loaded beside `frontend-design`. `AGENTS.md` and `agents/planner/agent.md` told Cursor to spawn `frontend-design-lead`, `nextjs-engineer`, `qa-engineer`: ids that `roster-adapters.ts` never renders, so downstream spawns failed and here they hit council stubs with no `browser-qa` and no `requiredTools`. `doctor` checked `requiredTools` on a file the Task mapping routed around. A design task in this repo loaded roughly 15–20k tokens of instruction before work, half of it asking for two creative directions, a reference set, a scorecard, and a benchmark.

Inside the 0.4 files themselves, each dogfood failure had added a "Reject …" line to both the skill and the agent: the slogan-hero / fake-frames / tracked-caps / swap-squint-signature quartet appeared three times in `design/agent.md` and three times in `frontend-design`; the five spawn payloads were copied into nine files. `frontend-design` (2,581 words) carried this repo's charcoal palette three times, a `kit-html` surface, and a four-recipe palette table that made every downstream app that picked "Paper + ink" converge. `deslop`, a copy skill, owned Design's visual fail list. Planner and Copy ran a "one question, restate six slots, wait for an explicit yes (not 'sounds good')" ritual; App engineer, Security, and QA had no question guidance at all. Tests asserted incidental strings (`#10100e`, "Seven Sweeps") rather than contracts.

### Decision

- Cursor Task subagent types are the agent ids. No shipped file maps to a council role name.
- `update --prune-legacy` is the first deleting path. It deletes only the allowlist in `src/install/prune-legacy.ts`, detects a council stub at a 0.4 path by content (no `tools:` frontmatter, or council doc names), prints the plan, requires `y` or `--yes`, and runs before regeneration. `doctor` fails on a shadowed default agent or a council rule / Copilot file and warns on council skills; every message names the prune. This repo ran the prune, removed tracked `runtime-skills/` (read by nothing) and the council root docs, and regenerated `.cursor/`.
- `catalog.json` gains `askPolicy` and `spawnPayloads`. `AGENTS.md` (template and this repo) renders both. Agents inline only the QA payload and reference the rest. Copilot and Antigravity generators read the catalog. One shared ask rule replaces the ritual: ask only when the answer changes what gets built, never what the repo answers, up to three bundled questions with defaults, proceed on defaults when told to go or when non-interactive, no gate on the wording of the yes. Each agent names its own decision-relevant unknowns.
- `frontend-design` (now ~1,900 words) states each detect tell once, drops the kit palette, `kit-html`, and scan provenance, replaces the recipe table with a five-line derive-the-direction method (Object, Field/ink/accent, Type, Structure, Removed) plus two examples labelled as examples, adds a type-and-rhythm block, and takes the visual fail list from `deslop`. The Design agent (~540 words) names mode and surface and points at the skill.
- `deslop` is copy-only and adds structure tells, a Reader test, and a tool-voice allowance. `product-copy` is product-neutral; kit-guide voice moves to this repo's `MESSAGING.md`. Kit tokens move to this repo's `DESIGN.md`, rewritten to the short shape the skill prescribes.
- Codex agents get per-agent reasoning effort (high for planner, security, design). Provenance lines leave the seven domain skills; they stay in this file and `research/summaries/`.
- Tests lock contracts: `rendered-drift`, `payloads`, `no-kit-content`, shadow detection and prune safety in `doctor-legacy`; `dogfood:check` guards this repo's own installed copies in `release:check`.

### Consequences

Downstream 0.3 upgraders must run the prune once to get the 0.4 Planner and rule; until then `doctor` fails and says so. The spawn payload text is byte-identical, so `USER_GUIDE.html` changed only in the skill table and the update/troubleshooting rows. Studio, audit, diff, research, and the root council folders remain in the tree as removal candidates; `DOCS.md` and `SPEC.md` mark them historical. Ship as 0.5.0.

## 2026-09-18 - One Copy Agent, Inspired Not Copied

### Context

Default Copy was kit-guide voice plus `deslop`. Public GitHub’s strongest marketing pack ([coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)) is a 50-skill CMO OS. Importing it would add a second copy agent and break the twelve-skill catalog.

### Decision

Keep one `copy` agent. Uplift `product-copy` with Reader / Job / One action / Proof (one-question interview, same shape as Planner). `deslop` adds a short claim sweep. Structure from `product-marketing` / `copywriting` / `copy-editing` only. Do not copy their catalog, Seven Sweeps, expert-panel scores, or `.agents/product-marketing.md`. Downstream product apps use that product’s Reader and Job. Kit `USER_GUIDE` still names specialists and `init`. Leftover `runtime-skills/*-copy` stubs point at the default pair.

### Consequences

Still six agents and twelve default skills. No 13th skill. No marketing-skill zoo on `init`. USER_GUIDE.html `#start` is unchanged.

## 2026-09-18 - Wave 5 Stricter Playbooks

### Context

0.4.9 shipped spawn-handoff. Detect would not have failed the old kit-html first viewport, YAML missed audit-only asks, Planner still invented routes from an unconfirmed restatement, Actions mixed error shapes, `browser-qa` ignored a red console, and `ship` wrote only “git revert.” External dogfood stays outside this repo.

### Decision

Keep six default agents and twelve default skills. Uplift existing playbooks: `frontend-design` detect (YAML + Kind + fail-closed first-viewport tells), `planning` one-question interview, `nextjs-app-router` Action/Handler contracts plus official-docs-or-UNVERIFIED, `browser-qa` console and failed same-origin, `ship` kill switch. Add optional `web-performance` off `init`. Park skip-intake and trigger fixtures until external dogfood names a skip. Release inspect retries `npm view`; publish treats “previously staged version” as already published. Do not restore Studio, paste-relay, or a 13th default skill.

### Consequences

Ship as 0.4.10. USER_GUIDE.html first viewport is unchanged. Catalog-clean is not enough for detect. “Sounds good” is not a Planner yes.

## 2026-09-16 - Default Spawn Handoff

### Context

Wave 3 taught people to copy USER_GUIDE fences between chats. Wave 4 asked whether to keep that or chain specialists. The product choice is chaining: after `init`, you describe the change once and the session launches each specialist. Copy-paste between chats is retired. Auto-handoff is not an opt-in extra.

### Decision

Default `init` is spawn-handoff. The current chat is the conductor. It launches Planner, then the named owner, then extra reviewers, then QA, in New feature order. Canonical USER_GUIDE prompt text is the spawn payload, not a clipboard workflow. Planner still does not implement. Six specialists stay separate; one chat must not impersonate all six. QA accept stops. QA reject launches the owning specialist again. Copilot and Antigravity cannot spawn isolated agents: same sequence in one thread with an explicit “now App engineer” header. Do not restore Studio, session ledger, LangGraph, or `orchestrate` on default `init`.

### Consequences

Paste-relay is retired. USER_GUIDE start is init, then say the change. Wave 4 is closed. Wave 5 (detect uplift, dogfood) stays later. Ship as 0.4.9.

## 2026-09-14 - Kit-html Field Guide Rebuild

### Context

USER_GUIDE.html used the right charcoal tokens and the wrong layout: slogan-hero, two fake QA frames, and four ticket cards. The first viewport was a SaaS onboarding stack, not the work.

### Decision

Rebuild the whole HTML as one field guide. First viewport is init plus one Planner paste. Design setup stays under Workflows. Keep charcoal tokens, skip link, safelight `:focus-visible`, and every canonical USER_GUIDE paste. Do not invent a second brand. `frontend-design` detect uplift stays a later ticket.

### Consequences

The installed guide can be judged from the first screen. Wave 4 stays closed.

## 2026-09-14 - USER_GUIDE New Feature Sequence

### Context

New feature listed Planner → App engineer → Security → Design → QA. Copy was a separate pass. First-viewport tickets were already init, open, Planner paste, and Design setup.

### Decision

New feature is the full paste relay: Plan → implement → Security if needed → Design if UI → Copy if public words → QA. Canonical pastes stay in USER_GUIDE. The first viewport is not a fourth start ticket. Wave 4 stays closed.

### Consequences

Wave 3 ticket 10.12 is done. Current Next Actions is the Wave 4 decision. Do not start Wave 4.

## 2026-09-14 - Copilot Specialist Pastes

### Context

Copilot has no `@agent` picker. Generated `.github/copilot-instructions.md` listed agent ids and only a QA paste.

### Decision

`generateCopilotInstructions` includes one fenced USER_GUIDE paste per default agent (Planner, App engineer, Security, Design, QA, Copy). Canonical prompts stay in USER_GUIDE. Do not expand the native Antigravity command list.

### Consequences

Wave 3 ticket 10.11 is done. Next was 10.12 (USER_GUIDE New feature sequence). Do not start Wave 4.

## 2026-09-14 - Default Skill YAML Triggers

### Context

Cursor matches skills from YAML `description`. Weak “Use for…” lines lose to a generic chat. ROADMAP 10.10 asked for unique descriptions with the nouns a user would type.

### Decision

Every default skill description stays unique and includes a Use-when trigger (`RLS`, “looks generic”, “is this done”, “ship it”, “empty state”, “what should we do”). Tests lock uniqueness and those phrases. Optional skills stay out of this ticket. Do not copy third-party skill bodies.

### Consequences

Wave 3 ticket 10.10 is done. Next is 10.11 (Copilot pastes). Do not start Wave 4.

## 2026-09-14 - Specialist Handoff Pastes

### Context

Planner already printed a fenced USER_GUIDE paste. App engineer, Design, Copy, Security, and QA named the next specialist in prose (“ask QA”) without the prompt to paste.

### Decision

Each default specialist’s Handoff, after Done-when, prints the next USER_GUIDE fence. App engineer → Security (auth/data) and QA. Design → Copy (public words) and QA. Copy → Design (visual P0s) then QA. Security → QA. QA on reject prints the owner’s paste. Do not invent a second prompt set. Specialists still do not run each other.

### Consequences

Wave 3 ticket 10.9 is done. Next is 10.10 (skill YAML triggers). Do not start Wave 4.

## 2026-09-14 - Planner Paste-Ready Handoff

### Context

Planner named an owner and extra reviewers but did not print the prompt the next specialist should run. USER_GUIDE already had the canonical pastes. Native Antigravity `/plan` still pointed at council `QUALITY_GATES` and `agent-kit session`.

### Decision

Extend `planning` so Done-when includes a fenced USER_GUIDE paste for the owner and extra reviewers. Design setup, QA screenshot, and ship prompts stay copied from USER_GUIDE, not a second set. Planner still does not run the other agents. Reject finishing without a paste and “ask @qa next” with no prompt text. Generated `/plan` and native `antigravity/commands/plan.toml` use the same paste-ready Done-when. Do not expand Copilot’s per-specialist list.

### Consequences

A plan reply always contains a copy-paste block the next specialist can run. Next Wave 3 ticket is 10.9 (each agent’s Handoff names the next paste). Do not start Wave 4.

## 2026-09-13 - UI-polish Optional Playbook

### Context

Optional `ui-polish` already said “after `frontend-design`, not instead” and required desktop + mobile, but it had no Reject list or Done-when. Agents could treat polish as a second design system or skip Design `setup` when `DESIGN.md` was missing.

### Decision

Finish optional `ui-polish` to the Use / Checks / Reject / Done-when playbook bar. Run after `frontend-design`, not instead. If `DESIGN.md` is missing, Design `setup` first. Stay surgical (`inside-design-system`). Still desktop + mobile via `browser-qa`. Reject using polish as a second design system or one viewport only. Keep it off default `init`. Do not make it required on the Design agent. Do not register it on the native Antigravity plugin (existing `/ui-polish` council command is a different adapter).

### Consequences

Wave 2 is complete: `debug`, `docs`, `upgrade`, and `ui-polish` are playbooks. Next work is Wave 3 paste-ready Planner handoff. Do not start Wave 4.

## 2026-09-13 - Upgrade Optional Playbook

### Context

Optional `upgrade` was a three-line stub: run `agent-kit update` on a branch, local edits win, do not delete user files. It did not Reject `init --force` or point at `UPGRADE.md`.

### Decision

Uplift optional `upgrade` to the Use / Checks / Reject / Done-when playbook bar. Canonical command is `agent-kit update` on a branch. Version notes live in `UPGRADE.md` (link only — this PR does not rewrite version history). Reject `init --force` or re-init as the upgrade path. Never delete leftover 0.3 docs because `doctor` listed them. Keep it off default `init`. Do not register it on the native Antigravity plugin (existing `/upgrade` council adapter is out of scope).

### Consequences

Tests lock the playbook on `add skill upgrade` and prove `init` does not install it. Next Wave 2 ticket is `ui-polish`.

## 2026-09-13 - Docs Optional Playbook

### Context

Optional `docs` was an 11-line stub: update docs users need, do not restore the 17-doc OS. `add skill docs` installed a reminder. The optional Docs agent named USER_GUIDE and AGENTS.md but did not name CHANGELOG, Reject, or Done-when.

### Decision

Uplift optional `docs` (skill + agent) to the Use / Checks / Reject / Done-when playbook bar. Update only USER_GUIDE, CHANGELOG, and the living file this change actually moved. Reject restoring `QUALITY_GATES.md`, `COUNCIL.md`, session/Studio templates, or the 17-doc OS as default `init` output. Keep it off default `init`. Do not add it to Planner’s required-skill list.

### Consequences

Tests lock the playbook on `add skill docs` and prove `init` does not install it. Next Wave 2 tickets are `upgrade` and `ui-polish`.

## 2026-09-13 - Debug Optional Playbook

### Context

`debug` was a five-step stub (reproduce / localize / reduce / fix / guard). `agent-kit add skill debug` installed a reminder, not a playbook. Agents could guess from the stack trace or call a screen bug “fixed in code” with no before/after `browser-qa`.

### Decision

Uplift optional `debug` to the Use / Checks / Reject / Done-when playbook bar. Reproduce before patching. User-visible bugs require before and after `browser-qa` paths. Reject guessing from the stack trace alone. Keep it off default `init`. Do not add it to App engineer required skills or Planner’s required-skill list. `add skill` still copies only to `.cursor/skills/debug/SKILL.md`.

### Consequences

Tests lock the playbook on `add skill debug` and prove `init` does not install it. Next Wave 2 tickets after this were `docs`, `upgrade`, and `ui-polish`. npm 0.4.7 is the changeset on this PR.

## 2026-09-13 - Ship Playbook

### Context

`ship` was a 22-line checklist: env, migrations, smoke, rollback, screenshots. It had no Reject list, no rollback template, and no fail for “LGTM, ship it” without commands or `browser-qa` paths. Antigravity `/ship` still pointed at council `QUALITY_GATES` and `agent-kit session verify`.

### Decision

Uplift `ship` to the Use / Checks / Reject / Done-when playbook bar. Go or no-go is explicit. Env names (not values), migration order, rollback, and `testing-qa` commands are required. User-visible releases without screenshot paths are a no-go. QA names the verdict; App engineer names env and app rollback; Security names secrets and RLS. Do not replace `testing-qa`, `browser-qa`, `postgres-migrations`, `supabase-auth-rls`, or `owasp-security-review`. `/ship` (roster adapter, Antigravity command, lifecycle index) uses the same Reject line.

### Consequences

`init` installs the playbook. Tests lock rollback + `browser-qa` + “LGTM, ship it.” Next playbook tickets are Wave 2 optional skills (`debug` first). npm 0.4.5 is the changeset on this PR.

## 2026-09-13 - Testing-qa Playbook

### Context

`testing-qa` named unit / regression / smoke and said it does not replace domain skills or `browser-qa`, but it had no Reject list, no required command shape, and no concrete other-user RLS example. Agents could say “tests pass” without saying what ran, or treat `toBeVisible` as visual proof.

### Decision

Uplift `testing-qa` to the Use / Checks / Reject / Done-when playbook bar. Commands actually run must be listed. Auth/RLS coverage is a negative that fails when another user or anon can read the row (`supabase-auth-rls` still owns the policy). `toBeVisible` is not `browser-qa`. Do not add Playwright as a required kit install. Planner rejects skipping this skill on auth/RLS because “we’ll add tests later.”

### Consequences

QA lists commands in the verdict. `ship` (10.3) is the next playbook. npm 0.4.4 published after #38 and #39.

## 2026-09-12 - Accessibility-wcag Playbook

### Context

`accessibility-wcag` was a 27-line checklist. Keyboard and contrast were named, but there was no Reject list, no fail-closed Done-when, and no mapping onto App Router forms or dialogs. Agents could accept a screen because the screenshot looked fine. A 2026-09-12 structure scan of WCAG 2.1 AA and public accessibility skill packs showed the same split this kit already uses for OWASP: map the standard onto *this* stack, require evidence in the running product, and do not copy third-party skill bodies or stand up a specialist swarm.

### Decision

Uplift `accessibility-wcag` to the Use / Checks / Reject / Done-when playbook bar. Conformance bar is WCAG 2.1 AA. A keyboard-only pass in the running UI is required. “Contrast looks fine in the screenshot” is a Reject. Visual proof stays in `browser-qa`. Authorization stays in `supabase-auth-rls`. Do not require axe, Pa11y, or an a11y MCP. Planner names the skill for user-facing screens; QA and Design must run it. Keep one skill.

### Consequences

`init` installs the playbook. Tests lock Reject + keyboard-in-browser. Design `review`/`build` still captures screenshots; they do not replace Tab. Next playbook tickets after 10.1 were `testing-qa` (10.2) and `ship` (10.3).

## 2026-09-12 - Frontend-design Playbook Modes

### Context

`frontend-design` already had kit vs product tokens and 2026 default-cluster rejects, but GitHub packs had pulled ahead on *how* the skill runs. A 2026-09-12 scan of Anthropic `frontend-design`, addyosmani `frontend-ui-engineering`, `educlopez/ui-craft`, `funboy322/avoid-ai-design`, `superdesigndev/superdesign-skill`, and `google-labs-code/design.md` showed shared structure: named modes (build vs review vs detect), surface depth (landing vs app chrome vs design-system surgical), `DESIGN.md` as token source of truth, code-certain vs inferred findings, and a severity table. Those packs also ship CLIs, MCP servers, and slash-command catalogs this kit already rejected.

### Decision

Uplift `frontend-design` and the Design agent to the same Use / Mode / Reject / Done-when playbook shape as the 2026-09-09 domain skills. Keep one skill. Extract structure only. Do not install Superdesign, ui-craft MCP, or a second design OS. Kit HTML keeps charcoal desk tokens. Downstream apps write 4–6 product tokens. Detect is read-only. Older `frontend-design` forks that default to mesh gradients and decorative atmosphere stay anti-references.

### Consequences

Design names `build`, `review`, or `detect` and a surface profile before CSS. `update` refreshes pristine skill and agent files. Screenshot QA stays in `browser-qa`. Visual P0 list stays in `deslop`.

## 2026-09-12 - Design Setup On New Repos

### Context

After the playbook modes landed, first-run Design still jumped to CSS or a wall of intake questions. `init` does not install `DESIGN.md` (legacy docs only). Downstream installs were missing a compact setup: what is the product, what is the architecture, and what principles should the style guide encode.

### Decision

Add a `setup` mode to `frontend-design` and the Design agent. The job is asking good questions so the agent knows what the user needs — not filling a token form. Scan the repo first. Ask: what this pass should produce; who must succeed and what they are finishing; what the first screen must let them do; what is already decided and what it must not look like. Follow up if answers are vague. Do not quiz hex, fonts, or motion first. Recommend principles from those answers, then write only the files they asked for. Do not overwrite a mature style guide. Do not paste kit charcoal tokens onto the product. Planner sends Design to `setup` when `DESIGN.md` is missing. Setup may skip screenshots when nothing can render; Design still keeps `requiredTools`.

### Consequences

First UI work in a fresh install starts with questions about need, then a collaborative style guide. `USER_GUIDE` ships a pasteable setup prompt. Antigravity `/frontend` names setup. The 17-doc council `DESIGN.md` template stays off the default `init`.

## 2026-09-12 - Post-0.4 Kit Quality Roadmap

### Context

After the 0.4 simplify and the frontend-design setup interview, the remaining gap was not more agents. Default skills were uneven (`accessibility-wcag`, `testing-qa`, `ship` still checklists at the time; optional skills were stubs). Agents named skills on paper but did not emit paste-ready handoffs. The old ROADMAP “Current Next Actions” still pointed at Trusted Publisher and orchestrate dogfood, which is not the 0.4 working queue.

### Decision

Track remaining work as Phase 10 in `ROADMAP.md`: playbook parity first, then optional skills, then paste-ready relay, then an explicit decision gate before any auto-handoff. Do not restore session/Studio/`orchestrate` as default `init`. One playbook item per PR after the in-flight Wave 0 PR. `accessibility-wcag` (10.1) landed on that PR because it was the highest-value open ticket and Wave 0 was not merged yet.

### Consequences

The next implementation ticket is Wave 2 `debug` (10.4), after `ship` (10.3) lands. Orchestration stays a Wave 4 decision.

## 2026-09-09 - Version Packages Keeps A Drafted Changelog Heading

### Context

Feature PRs sometimes write `## <next version>` into `CHANGELOG.md` while `package.json` stays on the current version, and they still add a changeset. `scripts/version-packages.mjs` treated that heading as an error, so the Version workflow on `main` failed instead of opening the Version Packages PR.

### Decision

If `CHANGELOG.md` already has the next version heading with bullets, keep that section and still bump `package.json`, the lockfile, and `PACKAGE_VERSION`. Fill an empty drafted heading from changeset summaries. Only prepend a new section when the heading is missing.

### Consequences

Agents can draft release notes in the feature PR. They must still add a changeset, or Version Packages will not run. `npm run version:check` still requires the current package version to have a changelog section.

## 2026-09-09 - Left Accent Bars Are The Same Chrome Cluster

### Context

Usage asked to reject left-edge selection rails and thick left-border status wells, and to merge that with the earlier flat AI/SaaS chrome prompt (accent-border cards, glow rails, card soup).

### Decision

One visual P0 list. `deslop`, `frontend-design`, distinctiveness anti-refs, `STYLE_GUIDE` anti-slop, and UI detectors share it. Selection is radio/check + light tint. Status wells use a flat tint fill. No `border-left` accent. The kit HTML fail-closed well follows that. Do not name downstream product apps in the kit.

### Consequences

A pick-list row or “verified” well with a blue/green/amber left stroke fails deslop. Distinctiveness fails if left-edge bars remain after product nouns are swapped.

## 2026-09-09 - Fail Closed On Usage Feedback

### Context

Using the 0.4 kit showed three holes in the advertised contract: GitHub displays `USER_GUIDE.html` as source, so people never see the layout; `adapter validate all` after `init --activate cursor` fails on missing Claude/Codex files; `doctor` accepted agents that dropped `requiredTools`, so screenshot QA could be deleted and still pass.

### Decision

`adapter validate all` follows `manifest.activated`. `doctor` compares installed `requiredTools` to the packaged agent files and fails on drops. `agent-kit guide` prints the HTML path. Catalog loads cache per package root.

### Consequences

Cursor-only installs can run `adapter validate all`. Screenshot tools are fail-closed. The HTML guide is still not hosted; open the file locally.

## 2026-09-09 - This Repository Is The Kit Only

### Context

This pack is installed into other Next.js + Supabase projects. Putting a product application in this repository would mix the npm package with an unrelated app and document that app as if it belonged to the kit.

### Decision

This repository stays the agent kit: CLI, agents, skills, and the user guide. Do not add product applications here. Do not mention them in kit README, SPEC, CI, or the published pack. Dogfood by running `init` in a separate repo.

### Consequences

Future work that needs a real Next.js app happens outside this repository.

## 2026-09-09 - Uplift Next.js And Supabase Domain Skills

### Context

`frontend-design`, `deslop`, and `browser-qa` were playbooks. `nextjs-app-router`, `supabase-auth-rls`, `postgres-migrations`, and `owasp-security-review` were still short checklists, so app-engineer work guessed App Router and RLS.

### Decision

Rewrite those four skills with Use / Do / Checks / Reject / Done-when. Scan Next.js 16 and Supabase SSR/RLS docs for **structure** only — no third-party skill bodies. Keep Supabase as this pack’s auth; reject swapping in Clerk/Auth0/NextAuth as the default. Planner names the skill the owner must run.

### Consequences

Ship as **0.4.2**. `update` refreshes pristine skills. Screenshot QA stays in `browser-qa`. No orchestrator.

## 2026-09-09 - Post-Publish Verify Matches The 0.4 CLI

### Context

npm published `@appsforgood/next-supabase-kit@0.4.1`, then Release failed in `post-publish-verify.mjs`. That script still ran `doctor` on an empty temp project, then `audit` and `orchestrate validate`. Those are 0.3 commands. GitHub `v0.4.1` was skipped. `v0.4.0` is missing for the same reason.

### Decision

Verify a published kit with `init --stack next-supabase --activate all`, then `doctor` and `adapter validate all`. Do not call `audit` or `orchestrate`. Keep kit version at 0.4.1 so merge retriggers Release, skips npm publish, and creates `v0.4.1`.

### Consequences

`npm run publish:verify` matches `smoke:install` / `smoke:audit-gate`. Future publishes can mint the GitHub tag after registry verification.

## 2026-09-08 - Patch Vitest Before Publishing 0.4.1

### Context

PR #29 merged 0.4.1 onto `main`. The Release workflow then failed in `npm run release:check` on `npm audit --audit-level=moderate`: GHSA-82fw-gwwq-j7x9 / CVE-2026-84373 (`@vitest/mocker` 2.1.0–4.1.10). npm still has only 0.4.0. Jumping to vitest 5 would be a major for a publish unblock.

### Decision

Stay on kit version **0.4.1**. Upgrade `vitest` and `@vitest/coverage-v8` to **4.1.11** (patched 4.1 line). Override `vite` at **6.4.3** so npm 11 does not pull Vite 8 / Rolldown as a side effect. Do not add a changeset that would bump to 0.4.2.

### Consequences

Merging the lockfile onto `main` retriggers Release because it watches `package-lock.json`. The published tarball still omits vitest. Runtime stays 0.1.3.

## 2026-09-08 - Publish 0.4.1 After npm 0.4.0

### Context

npm already has `@appsforgood/next-supabase-kit@0.4.0` (6 Sep), which is the #25 simplify. Later merges (`deslop`, frontend-design, catalog pointer, leftover `doctor`) cannot overwrite that version. A leftover major changeset would have bumped 0.4.0 to 1.0.0.

### Decision

Ship **0.4.1**. Delete the stale `simplify-agents-skills` major changeset. Merging this version bump on `main` triggers the Release workflow.

### Consequences

`npx @appsforgood/next-supabase-kit@latest` will get the current kit after the workflow publishes. Runtime stays 0.1.3.

## 2026-09-08 - Doctor Warns On 0.3 Leftovers

### Context

0.4.0 is a breaking simplify, but `update` never deletes old council docs. A 0.3 install that ran `update` looked the same as a fresh 0.4 tree unless someone knew which files were leftovers.

### Decision

`doctor` warns (does not fail) when unique 0.3 files such as `QUALITY_GATES.md`, `COUNCIL.md`, and `.agent-kit/agent-roster.json` remain. `update --json` lists them as `leftoverDocs`. Product files like `SECURITY.md` are not treated as kit leftovers.

### Consequences

A 0.3 project can keep its old docs. `doctor` names the 0.4 layout. Fresh inits stay warning-free for this check.

## 2026-09-06 - Planner Routes, Agents See The Catalog

### Context

Planner named owners but not the `planning` skill. Specialists only listed their own skills, so they could miss `ship`, `deslop`, or another default skill the job needed.

### Decision

Planner runs `planning` and names the next specialist; it does not orchestrate or spawn the others. Every agent file (default and optional) includes the same catalog pointer: `catalog.json` and the USER_GUIDE skill table. Role skills stay first.

### Consequences

The human or IDE still `@`s the next agent. A specialist can reach for any listed skill without a hidden roster.

## 2026-09-06 - Deslop Last And Frontend Token Split

### Context

Public copy still read as generated after `product-copy`. `frontend-design` still pointed at newsprint / cream-serif defaults that Anthropic’s own 2026-06 skill now lists as generated clusters.

### Decision

Add `deslop` as a default skill. Copy’s end run is `product-copy` → screenshot → `deslop` → second `deslop` on the rewrite. Uplift `frontend-design` to a 4-token palette (field / ink / accent / line), keep kit charcoal tokens off downstream apps, and reject cream-editorial, neon-on-black decoration, SaaS card kits, and broadsheet newsprint as 2026 defaults.

### Consequences

The default pack is six agents and twelve skills. Copy cannot mark work done without `deslop`. Design restyles leftover visual P0s; Copy only lists them.

## 2026-09-06 - Agents, Skills, And Screenshot QA

### Context

The kit had become an operating system: 17 installed docs, Studio, session CLI, research, and LangGraph. Users needed agents and skills they could invoke. QA could pass on a code-only review.

A GitHub scan of top skill packs (Anthropic, addyosmani/agent-skills, wshobson/agents, agentsmd) showed native `SKILL.md` folders, small specialist rosters, and live browser verification — not council ledgers.

### Decision

Ship a default pack of six agents and twelve skills (eleven plus later `deslop`). `init` writes `AGENTS.md`, `USER_GUIDE.md`, and native IDE files. QA of user-visible work requires desktop and mobile screenshots and image review. Session, Studio, research, and orchestrate leave the default CLI.

### Consequences

Downstream installs are smaller and teachable from `USER_GUIDE.md`. Existing 17-doc trees are not deleted. Domain skills (RLS, migrations) stay even though generic skill zoos omit them.

## 2026-07-25 - Make Hosted GitHub Actions Opt-In

### Context

GitHub can reject every job before execution when an account has no usable Actions entitlement, a failed payment, or an exhausted spending limit. The package previously installed an automatically triggered hosted audit on every fresh project, while delivery guidance could treat green remote CI as a prerequisite even though no project code ran.

### Decision

Set `githubActions.mode` to `off` for fresh installs and do not create `.github/workflows/agent-kit-audit.yml` unless `agent-kit init --github-actions` is passed. The opt-in workflow is advisory: manual dispatch remains available, and automatic push/pull-request jobs require the repository variable `AGENT_KIT_ACTIONS_ENABLED=true`. Keep local tests and `agent-kit audit --min-readiness baseline-setup` fail-closed. Never silently delete an existing workflow; legacy managed workflows remain eligible for a safe update to the advisory guard.

### Consequences

Unavailable hosted billing cannot be mistaken for a product regression or block normal commit/push and phase progression by default. Projects that require hosted checks must explicitly enable Actions, confirm jobs can start, set branch protection deliberately, and accept that entitlement outages are release infrastructure blockers. npm Trusted Publishing remains a separate explicit release path that still requires GitHub Actions OIDC.

## 2026-07-04 - Complete Live Studio Milestone 8

### Context

Since 0.1.2, `agent-kit studio serve` provided a localhost live Agent Office with SSE session events and a transcript panel, but Milestone 8 in `AGENT_STUDIO_PLAN.md` also required buttons/forms that call CLI-safe operations and explicit session selection. Setup-server API routes also lacked full automated route coverage, and the office/wizard UI had no browser screenshot smoke evidence.

### Decision

Complete Milestone 8 with two CLI-safe POST endpoints on the studio server (`/api/sessions/:id/note`, `/api/sessions/:id/render`) reusing `recordSessionNote` and `renderSession` from `session.ts`, plus a session picker, note form, and render button in the live office UI. Move `readJsonBody` to `shared.ts` for reuse. Add `tests/setup-server-api.test.ts` for setup-server route coverage, `scripts/smoke-ui-screens.mjs` with Playwright (dedicated CI job, not in `release:check`), and validate invalid setup `completeSection` ids with 400 responses. Direct AI orchestration remains deferred to Milestone 9.

### Consequences

The live office is interactive but still file-contract-only — disabling `studio serve` leaves CLI session workflows intact. UI screenshots are smoke evidence only (no visual-regression baselines in this release). Setup-server coverage rises enough for release confidence without chasing browser-open or interactive CLI prompt wrappers.

## 2026-07-04 - Lifecycle README And Targeted Slash-Command Parity

### Context

The public README foregrounded `agent-kit` CLI tables but not the delivery lifecycle slash commands that Antigravity users invoke (`/plan`, `/ship`, UI harness commands, and related adapters). [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) demonstrates that a lifecycle command table, skill activation narrative, and grouped skill catalog improve discoverability without replacing the underlying council contract.

The kit already had seventeen Antigravity commands and roster-based skill routing, but no canonical lifecycle command index and no dedicated `/spec`, `/test`, or `/review` entrypoints.

### Decision

Add a **Workflow Commands** section to `README.md` and `docs/index.md` with lifecycle diagram, core and UI command tables, council summary, skills-by-phase grouping, and explicit separation from package CLI commands. Create `prompts/lifecycle-command-index.md` as the canonical delivery workflow index (parallel to `prompts/ui-command-index.md`). Add thin Antigravity adapters for `/spec`, `/test`, and `/review` that route through existing Planner, QA Engineer, and Security Reviewer skills. Extend roster workflows with `testing` and `code-review` triggers plus planning triggers for spec work.

Do not clone addyosmani's full eight-command pack, `/build auto` orchestration, or generic single-agent personas. Document those gaps as future scope in `RUNTIME_ORCHESTRATION_SCOPE.md`.

### Consequences

Users can discover lifecycle commands from the README without reading Antigravity plugin manifests. Adapter validation expects twenty native commands. Installed projects receive the lifecycle index via the bundled `prompts/` package assets. `/ship` remains the release GO/NO-GO command; `/review` covers pre-merge code health only.

## 2026-06-29 - Preserve Node 20 During Production Dependency Updates

### Context

Dependabot proposed production dependency updates that included `commander@15`, which requires Node `>=22.12.0`. The package still advertises `node >=20`, and CI intentionally verifies that contract on Node 20. The same update also moved Zod to v4, which changed validation error wording and exposed a brittle test assertion.

### Decision

Keep the public runtime contract at `node >=20`. Accept compatible production updates for `@octokit/rest` and Zod, cap Commander on the latest Node-20-compatible major, and configure Dependabot to ignore Commander versions `>=15` until the project intentionally raises its engine requirement. Correction-scope validation now uses a stable project-owned error before selecting a durable correction file path.

### Consequences

CI continues to prove the advertised Node 20 support instead of only proving a newer GitHub Actions runtime. Invalid correction scopes fail with stable package behavior rather than third-party validation text, and dependency update noise for incompatible Commander majors is deferred until a deliberate Node engine change.

## 2026-06-14 - Scrub Ambient NPM Tokens During Trusted Publish

### Context

GitHub environment variables can inject `NODE_AUTH_TOKEN` into release jobs even when the workflow does not declare an npm publish secret. npm may then fall back to token authentication and fail with permission-like registry errors instead of using the configured OIDC trusted publisher.

### Decision

Keep npm Trusted Publishing as the only automated publish path. Before `npm publish`, the Release workflow writes a minimal token-free npm config and invokes npm with `NODE_AUTH_TOKEN` removed from the publish process.

### Consequences

Publish failures now point at the real trust boundary: npm Trusted Publisher configuration, package ownership, or registry availability. The workflow does not rely on long-lived bypass-2FA publish tokens and remains compatible with GitHub OIDC provenance.

## 2026-06-14 - Runtime Commands Are Adapter Surfaces

### Context

The package had strong local-first council/session contracts, but runtime ergonomics were mostly exposed through docs and CLI commands. Antigravity-style runtimes can discover plugin manifests, native command files, and `SKILL.md` directories, so the package needed a native adapter surface without weakening the existing Agent Kit source of truth.

### Decision

- Add Antigravity as a first-class activation target with `agent-kit init --activate antigravity`.
- Ship `antigravity/plugin.json`, `antigravity/commands/*.toml`, and `runtime-skills/*/SKILL.md`.
- Add `agent-kit adapter validate antigravity` and `agent-kit package validate` so runtime adapter assets are release-gated.
- Keep `AGENTS.md`, `.agent-kit/agent-roster.json`, `QUALITY_GATES.md`, canonical `skills/*.md`, and Agent Studio session records as the source of truth.
- Treat native runtime commands as dispatch wrappers for existing workflows, required outputs, and session evidence.

### Consequences

Antigravity users get `/setup`, `/audit`, `/plan`, `/handoff`, `/frontend`, `/security`, `/copy`, `/ship`, and `/upgrade` entrypoints. The adapter is structurally validated without requiring `agy` to be installed. Future runtime adapters must follow the same rule: improve invocation ergonomics without forking role policy, security gates, model routing, or documentation contracts.

## 2026-06-30 - Add Repo-Native UI Improvement Harness

### Context

The kit had strong frontend principles, design roles, visual QA prompts, accessibility checks, and product-quality scorecards, but UI improvement still depended on agents remembering how to operationalize those assets. Public tools such as Impeccable demonstrate the value of command-style UI workflows, live browser iteration, and deterministic detector rules, but this package needs a repo-native layer that does not copy another project's prompts or implementation.

### Decision

Add `ui-improvement-harness` as a canonical skill with a command index, deterministic UI detector checklist, acceptance rubric, runtime skill wrapper, and focused Antigravity commands for UI audit, UI polish, layout cleanup, responsive cleanup, accessibility pass, distinctiveness pass, screenshot critique, and browser QA. Treat Impeccable as Apache-2.0 capability inspiration only; do not copy source text, detector code, prompts, or proprietary wording.

### Consequences

Future frontend work can run repeatable audit/polish/browser loops with blocker, major, and minor findings. High-risk UI work now requires desktop and mobile screenshot evidence plus authenticated or permission-state evidence when the screen is protected. Adapter validation and package validation must keep the new command and runtime skill surface shippable.

## 2026-06-14 - Package Source Audits Validate Shipped Assets

### Context

`agent-kit audit` must remain strict for installed downstream projects, but the package repository is not itself an initialized downstream project. A clean GitHub checkout does not include generated root docs such as `AGENTS.md`, `COUNCIL.md`, `QUALITY_GATES.md`, or `.agent-kit/manifest.json`, so treating the package root as an installed project creates false CI failures.

### Decision

When the audit detects the Agent Kit source repository without an installed manifest, it validates committed source assets instead: `templates/next-supabase/*`, `rosters/`, `schemas/`, `assistant-adapters/`, `model-routing/`, package scripts, and source secret scanning. Installed projects still fail when required root docs or install contracts are absent.

OpenSSF Scorecard keeps workflow-level permissions read-only and grants `security-events: write` plus `id-token: write` only at the Scorecard job. GitHub Dependency Review remains enabled as a pull-request gate, with repository vulnerability alerts/dependency graph enabled in GitHub settings.

### Consequences

CI now matches the package's ownership boundary: source checkouts prove shipped templates and package assets, while downstream installs prove installed files. The release gate no longer depends on untracked local generated docs. Scorecard publishing satisfies OSSF workflow restrictions without broad global write scopes, and Dependency Review can run once GitHub dependency graph support is enabled for the repository.

## 2026-06-10 - IDE Parity, Honest Audit, And Session Batch API

### Context

The kit promised multi-IDE agent council support but only Cursor rules were promoted on init. Audit checked markdown keywords without parsing Supabase migrations. Council session logging required many CLI calls per workflow.

### Decision

- Add `agent-kit init --activate <cursor|claude|codex|copilot|all>` to promote adapter templates to real IDE paths and generate Claude subagents from the roster.
- Always run the lightweight project context scan on plain `init`.
- Ship `.github/workflows/agent-kit-audit.yml` on init as the first consumer enforcement loop.
- Split audit findings into `docs-hygiene` and `project-reality` areas.
- Add `agent-kit session checkpoint --file` for batch council evidence.
- Reject npm publish-token fallback in the Release workflow; Trusted Publishing or an explicit maintainer-local OTP publish are the only package write paths.

### Consequences

- Claude Code friction drops from manual subagent creation to one command.
- Fresh installs always have `.agent-kit/project-context.json` for agents to read.
- Publish still requires npm org trusted publishing configuration, or a deliberate maintainer-local OTP bootstrap outside automated release.

## 2026-06-08 - Live Local Studio Serve (Milestone 8 Partial)

### Context

The Markdown-first session protocol (`events.jsonl`) was proven in CLI and static export, but users wanted to **see agent conversations on the office floor** while work happens.

### Decision

Add `agent-kit studio serve` — a localhost-only server (`127.0.0.1`) that reuses the Agent Office canvas in `studio` mode, reads the same session files, and pushes updates via SSE when `events.jsonl` changes. No new state shape; no IDE chat scraping.

### Consequences

Live visibility is opt-in and local. Direct AI orchestration (Milestone 9) remains deferred. Studio and setup servers share office assets but different routes and boot mode.

## 2026-06-08 - Agent Office As Default Setup Presentation

### Context

The setup wizard captured project context through a stepped form. Users expected a visual, browser-based experience that introduces the council agents by name and makes setup feel like briefing a team — not filling a generic SaaS form.

### Decision

Add a pixel-art top-down **Agent Office** as the default view for `agent-kit setup` (`GET /`). Keep the existing form wizard at `/wizard` as an accessibility and power-user fallback. Reuse the same local APIs (`/api/state`, `/api/draft`, `/api/context`, checklist endpoints) and file outputs — the office is presentation only, not a new source of truth. Bind the server to localhost only; ship office CSS/JS under `dist/studio/office/assets/`.

### Consequences

Setup is more discoverable and aligned with the agent-roster mental model. Canvas rendering uses procedural pixel tiles and role-based agent sprites in v1 (no hosted assets). Users who prefer forms or screen readers can use `/wizard` and the station list sidebar. Future live studio GUI work should still render from the same JSON/JSONL contracts.

## 2026-06-08 - Progressive Local Startup Wizard

### Context

Fresh installs had valid kit assets but empty project context. Terminal-only onboarding (`context ask`) was easy to miss and hard to resume.

### Decision

Add a local-only setup wizard (`agent-kit setup`) with progressive depth (Quick, Standard, Complete), resume state in `.agent-kit/onboarding/state.json`, and post-install prompts via `agent-kit init --setup`. Do not add npm `postinstall` hooks; consumers run the kit through `npx` and `init`.

### Consequences

Downstream projects get a guided, generic UX with project-specific answers stored locally. The kit ships wizard CSS/JS assets under `dist/studio/wizard/assets/`. Optional Standard/Complete steps remain non-blocking for Quick completion.

## 2026-06-02 - Track Research Evidence In Git

### Context

The kit is intended to become a reusable internal standard, not a one-time prompt bundle. Research findings and summaries must be available to future contributors who need to understand why templates and checklists changed.

### Decision

Track `research/repo-candidates.json`, `research/findings/*.md`, `research/summaries/*.md`, and `research/proposed-updates.md` in git. Continue ignoring `research/workdir/` because it contains temporary shallow clones.

### Consequences

Future changes can cite evidence from committed research artifacts. The repository becomes larger, but the added size is acceptable for a 100-repo benchmark.

## 2026-06-02 - Combine Search Discovery With Curated Seeds

### Context

GitHub search alone underfilled security and testing categories and missed several high-signal production, security, and design-system repositories.

### Decision

Use category-balanced GitHub search plus explicit `seedRepos` in `research/scan-config.json`. Keep `excludeRepos` for obvious false positives.

### Consequences

The benchmark remains repeatable while allowing deliberate curation. Curated seeds must be reviewed periodically so the list does not become stale.

## 2026-06-02 - Promote Explicit Inventories Into Templates

### Context

The 100-repo scan found repeated gaps around Supabase/Auth/RLS discoverability, agent handoffs, accessibility signals, and security expectations.

### Decision

Update downstream templates to require explicit inventories for RLS policies, security controls, component states, accessibility checks, tests, and deployment gates.

### Consequences

Installed projects get more operationally useful docs. The templates are slightly more demanding, but the added structure reduces ambiguity for humans and agents.

## 2026-06-02 - Gate Public NPM Publishing Behind Verified Release Checks

### Context

The package is intended to be consumed across multiple projects through a public scoped npm package. Publishing must not happen from normal CI pushes, and first-release validation must prove the workflow can run without long-lived package credentials.

### Decision

Use a dedicated `Release` GitHub Actions workflow. The workflow runs install, typecheck, tests, build, dependency audit, install smoke, and package dry run before publishing. `npm publish --access public` runs only for a published GitHub Release or a manual workflow dispatch with `dry_run=false`.

### Consequences

The release path is repeatable and can be dry-run safely before npm publishing is configured. Actual package publication remains blocked until npm allows the configured release workflow to publish the package.

## 2026-06-03 - Use One Shared Release Readiness Command

### Context

The repo now has local checks, CI checks, release workflow checks, public-readiness tests, install smoke, JSON contracts, and package dry-run requirements. Duplicating those gates across workflow files makes it easier for CI and release behavior to drift.

### Decision

Add `npm run release:check` as the canonical proof command. The command validates key JSON assets, runs typecheck, tests, build, install smoke, dependency audit, and package dry run. CI and release workflows call the same command before publish-sensitive steps.

### Consequences

Maintainers can reproduce the release gate locally before pushing, and workflow changes have a smaller surface area. Any future required publish gate should be added to `scripts/release-check.mjs` first, then covered by public-readiness tests.

## 2026-06-02 - Use NPM Trusted Publishing For CI Releases

### Context

The first npm release attempt reached `npm publish` but failed because token-based CI publishing requires two-factor handling. npm warns that bypass-2FA tokens carry security risk for automation.

### Decision

Use npm Trusted Publishing through GitHub Actions OIDC for package writes. The `Release` workflow grants `id-token: write`, runs from the `npm-publish` environment, publishes without `NODE_AUTH_TOKEN`, and verifies public install with `npx`.

### Consequences

The release process no longer depends on a long-lived npm publish token. The npm package owner must configure a trusted publisher for `lukey662/agentsandskills`, workflow `release.yml`, environment `npm-publish`, and allowed action `npm publish`. If npm requires the package to exist before trusted publishing can be configured, the first package creation still needs a one-time manual publish with OTP or another npm-approved bootstrap path.

## 2026-06-02 - Make Agent Council Routing Auditable

### Context

The kit already installed human-readable `AGENTS.md` and `SKILLS.md`, but that did not guarantee Planner, Lead Architect, Security Reviewer, QA, and documentation handoffs would be used by default.

### Decision

Ship a structured default council roster at `.agent-kit/agent-roster.json`, backed by `rosters/next-supabase-default-council.json`. Add Planner as a first-class agent, add the Planning and Agent Council skill, and make `agent-kit audit` fail when the roster, required agents, required skill routing, or architect-led core-change workflow is missing.

### Consequences

Installed projects now have a machine-readable agent-to-skill and workflow contract. Agents can read the roster to choose the default workflow, and audits can detect drift when a project removes the planner, skips architect review for core changes, or loses required skill routing.

## 2026-06-02 - Prepare A Neutral Public OSS Package

### Context

The kit is useful beyond one organization and should be publishable as a best-practice open-source package. Private package naming, restrictive license text, and detailed per-repo research findings are not appropriate defaults for public distribution.

### Decision

Rename the npm package to `@appsforgood/next-supabase-kit`, publish with public npm access, use the MIT license, and keep public research exposure to generalized summaries, scan methodology, and promoted decisions. Keep detailed per-repo findings out of the public npm package unless separately reviewed.

### Consequences

The package is easier for external projects to adopt and can be installed publicly with `npx`. Maintainers must publish under the `@appsforgood` npm org, configure Trusted Publishing for `@appsforgood/next-supabase-kit`, and keep public-readiness tests passing before release.

## 2026-06-02 - Use Template Hashes For Install Drift Detection

### Context

Downstream projects can customize installed markdown files. A simple file-diff check cannot distinguish intentional customization from a project still matching an older bundled template.

### Decision

Record `templateHashes` for every root markdown template in `.agent-kit/manifest.json` during install and update. Audit compares the installed hash, current bundled template hash, and local file hash.

### Consequences

Audits can now report current templates, stale installed templates, older manifests without hashes, and locally customized docs. Existing installs remain compatible, but they should run `agent-kit update` to add hash metadata.

## 2026-06-02 - Ship Project Profiles And Design Briefs As Installable Assets

### Context

The kit should prevent generic AI-generated UI and help agents adapt to different Next.js/Supabase product types without requiring bespoke prompting on every project.

### Decision

Add installable `profiles` for SaaS, marketplace, admin app, and content app projects. Add installable `design-briefs` for SaaS, admin dashboards, marketplaces, content apps, and tools, plus a screenshot-review prompt.

### Consequences

Downstream projects get reusable product-type guidance in `.agent-kit/`. Audit and templates now expect design tokens, component states, and anti-generic landing-page rules to be documented.

## 2026-06-02 - Gate Public Release On Package Verification

### Context

The kit now contains prompts, research summaries, installable assets, and downstream dogfood notes. Public release requires verified package metadata, public install evidence, security guidance, and citation policy.

### Decision

Proceed with public package setup after CI, release dry run, install smoke, and public-readiness tests pass. Keep detailed per-repo findings out of the public npm package unless separately reviewed.

### Consequences

The public package can ship once npm scope setup and post-publish `npx` verification succeed. Public release remains gated by evidence rather than by repository intent alone.

## 2026-06-03 - Make Creative Direction A First-Class Frontend Gate

### Context

The 100-repo scan promoted useful frontend practices around design tokens, component states, accessibility, screenshot review, and anti-generic UI checks. That was not enough to guarantee distinctive product-specific design because the scoring did not strongly require audience, content inventory, brand constraints, or multiple creative directions before implementation.

### Decision

Add `DESIGN.md` as an installed root document and treat it as the persistent design identity and content-direction contract. Add the Content-First Design skill, brand/content intake prompt, creative-direction matrix prompt, brand/content checklist, expanded vertical design briefs, and audit checks for `DESIGN.md` and frontend workflow outputs.

### Consequences

Frontend work now has a stronger acceptance bar: content and brand inputs must exist before styling, the Frontend Design Lead must own creative direction, and audits can warn when projects have only generic style-guide rules. Existing installed projects should run `agent-kit update` and review the new `DESIGN.md` template.

## 2026-06-03 - Require Visual QA Evidence For High-Risk UI Changes

### Context

Screenshots and design review catch many frontend issues, but they are weak if they are one-off, happy-path, or disconnected from CI/review evidence. Mature design-system repos use Storybook stories, visual testing, browser screenshots, and baseline approval to keep UI states stable over time.

### Decision

Add the Visual Regression QA skill, visual-regression checklist, and visual QA planning prompt. Update downstream `TESTING.md` with baseline, strong, and mature visual QA tiers. Add `visual-regression-qa` to the default council routing and make audit warn when `TESTING.md` does not document visual QA or visual-regression evidence.

### Consequences

Projects can still start with manual desktop/mobile screenshot review, but high-risk UI changes now have a path toward Playwright screenshots, Storybook state stories, Chromatic, Argos, Loki, or equivalent visual evidence. Baseline updates must be reviewed intentionally instead of accepted as incidental test churn.

## 2026-06-03 - Make Council Evidence Schema-Backed

### Context

The 100-repo research pass identified useful patterns, but research volume does not prove the kit will behave well in downstream projects. The previous agent council contract was partly machine-readable, but council sessions and handoff evidence could still disappear into chat history.

### Decision

Ship JSON Schema contracts for the default roster and council-session records, install `COUNCIL.md` as the human-readable evidence log, add the Agent Handoff Tracing skill, and audit for schema presence, runtime roster shape, optional structured council-session records, complete handoff rules, and council-session evidence language.

### Consequences

Planner, Lead Architect, and Documentation Maintainer now have explicit handoff tracing responsibilities. Downstream installs receive a durable format for decision, risk, next-handoff, required-output, and verification evidence. Invalid roster shapes and malformed structured session records now fail audit. Existing projects should run `agent-kit update` to receive `COUNCIL.md` and `.agent-kit/schemas/`.

## 2026-06-03 - Add An Evidence-Based Maturity Model

### Context

The 100-repo scan was useful research, but it did not by itself prove that the kit had a best-practice setup. Follow-up review showed that mature projects make readiness visible through evidence across architecture, security, data access, frontend quality, accessibility, testing, release, repository health, and supply chain.

### Decision

Install `QUALITY_GATES.md` as a root downstream template. Define baseline, strong, and best-practice maturity levels, and add audit coverage so a project warns when the maturity model is missing core evidence areas.

### Consequences

Downstream projects have a concrete checklist for what is still missing after initial setup. Research volume no longer counts as completion unless the repeated practice is promoted into templates, skills, checklists, audit checks, tests, release gates, or documented decisions. Existing projects should run `agent-kit update` and review `QUALITY_GATES.md` alongside their local delivery process.

## 2026-06-03 - Treat Repo Health As Release Readiness

### Context

A package can pass build and install checks while still being weak as a public open-source repository. Mature public repos make contributor intake, review ownership, dependency updates, code scanning, support expectations, conduct, and governance discoverable.

### Decision

Add issue forms, PR template, CODEOWNERS, Dependabot, CodeQL, `CODE_OF_CONDUCT.md`, `SUPPORT.md`, and `GOVERNANCE.md`. Add public-readiness tests for these files and add repo-health scoring to the research scanner.

### Consequences

The repo is easier to maintain after publication and contributors have clearer paths for bug reports, reusable feature requests, and research-promotion proposals. Public release readiness now covers repository operations, not only npm packaging.

## 2026-06-03 - Treat Supply-Chain Provenance As Package Trust

### Context

Public npm packages need more than CI and a release workflow. Consumers need evidence that releases come from the expected repository and workflow, dependency changes are reviewed, repository security posture is monitored, and workflow edits are treated as release-risk changes.

### Decision

Document supply-chain controls in `SUPPLY_CHAIN.md`, keep npm Trusted Publishing/OIDC as the publish path, rely on npm's automatic provenance generation for trusted public publishes, add Dependency Review and OpenSSF Scorecard workflows, harden workflow checkout and concurrency behavior, and validate manual publish dispatches run from `main`.

### Consequences

The release path has clearer trust boundaries and public-readiness tests now verify supply-chain assets. Workflow changes require security review because they can affect package provenance and publish integrity.

## 2026-06-03 - Attest A Package SBOM Before Publish

### Context

The release workflow already used Trusted Publishing, dependency audit, Dependency Review, CodeQL, OpenSSF Scorecard, and post-publish `npx` verification. That proved origin and installability, but it did not produce a durable software bill of materials for the exact package artifact. A direct `npm sbom` check also exposed optional-platform dependency edge cases in the current npm dependency graph, so the release gate needed deterministic behavior rather than an opaque package-manager failure.

### Decision

Add `scripts/sbom-check.mjs` to generate and validate a CycloneDX SBOM from `package-lock.json`. Add `npm run sbom:check` to the shared release-readiness gate. Update the release workflow to pack the npm tarball, generate `release-artifacts/sbom.cdx.json`, upload tarball/SBOM/pack metadata as release evidence, attest the SBOM for the exact tarball with GitHub artifact attestations, and publish that same tarball to npm.

### Consequences

Package consumers and maintainers get a release artifact trail that covers provenance and dependency inventory. The SBOM generator fails unresolved required dependency links but permits missing optional-platform links when npm records optional package edges that are not present for the current target. Workflow edits now carry even more release risk because they affect both package provenance and SBOM attestation.

## 2026-06-03 - Treat Packaged Examples As Golden Evidence

### Context

The package includes a compact installed-output example with a roster, manifest, tree summary, and audit output. Those files help users understand what a clean install produces, but they can drift as templates, roster routing, audit messages, and manifest hashes change. JSON parsing and audit-contract tests prove shape, not truth.

### Decision

Add `scripts/example-check.mjs` and `npm run examples:check`. The check builds a clean temp install with the current `dist/index.js`, runs `agent-kit audit --json`, and compares the committed example roster, stable manifest fields, audit output, and tree summary against generated output. Add the check to `npm run release:check` and public-readiness tests.

### Consequences

Packaged examples are now executable release evidence, not hand-maintained illustrative snippets. Contributors who change templates, roster behavior, or audit output must refresh the example files or the shared release gate fails.

## 2026-06-03 - Validate Version Metadata Before Release

### Context

The package already had release workflow checks, changelog entries, a versioning policy in docs, and a draft release. Public npm releases still need an executable guard that catches mismatches between `package.json`, `package-lock.json`, `CHANGELOG.md`, and GitHub release tags before a package is published.

### Decision

Add `scripts/version-check.mjs` and `npm run version:check`. The check validates SemVer shape, package-lock root version alignment, a non-empty changelog section for the package version, and `v<version>` tag matching when the workflow runs from a tag. Add the check to `npm run release:check` and public-readiness tests.

### Consequences

Version and changelog discipline are now enforced locally, in CI, and during release workflows. Maintainers must update package metadata, lockfile metadata, changelog notes, and release tags together.

## 2026-06-03 - Treat Upgrades As A First-Class Lifecycle

### Context

The kit is meant to be reused like an installable package. Initial install and audit are not enough if existing projects cannot safely adopt future template, roster, schema, assistant-adapter, Next.js, or Supabase changes.

### Decision

Add root and downstream `UPGRADE.md` docs, an Upgrade Maintenance skill, upgrade checklist, upgrade-review prompt, and audit checks for diff/update flow, release notes, framework codemods, Supabase migration review, generated types, readiness audit, and rollback evidence.

### Consequences

Downstream projects get an explicit path for reviewing package updates without overwriting local decisions. Upgrade work now routes through planning, architecture, security, QA, docs, and deployment evidence. A project can pass baseline setup after install, but best-practice readiness requires replacing upgrade placeholders with real version, migration, rollback, and verification evidence.

## 2026-06-03 - Add Reference-Led Frontend Critique

### Context

The kit already required content-first design, creative-direction options, design tokens, component states, screenshot review, and visual QA. That reduced generic AI-site output, but a UI could still look derivative or bland if agents treated references as optional inspiration or skipped a written distinctiveness verdict.

### Decision

Add the Reference-Led Design Critique skill, design-critique gate prompt, and design-critique checklist. Update `DESIGN.md` to require a reference set, anti-references, source-safety notes, and a distinctiveness verdict. Wire the Frontend Design Lead and frontend-change workflow to require reference-set evidence and a design critique verdict. Add audit warnings and public-readiness tests so the critique gate remains part of the default setup.

### Consequences

Frontend work must now explain what it learned from references without copying them, what visual tropes it rejected, and why the result belongs to the product. This makes the kit stricter for UI work, but it creates a clearer path away from generic AI-generated pages and toward project-specific design quality.

## 2026-06-03 - Add A Frontend Product-Quality Scorecard

### Context

The kit already required content-first design, reference-led critique, visual QA, design tokens, and component states. That was much stronger than the initial frontend setup, but it still left acceptance too dependent on reviewer taste. A polished UI could satisfy the checklist while still being weak on real user task, content specificity, information architecture, accessibility, or source-safe reference use.

### Decision

Add the Frontend Product Quality Rubric skill, product-quality checklist, and scorecard prompt. Update `DESIGN.md` with a scored acceptance table for user/task fit, content specificity, visual identity, information architecture, component states, accessibility and interaction, and source safety. Wire the Frontend Design Lead and frontend-change workflow to require the scorecard. Add audit warnings and public-readiness tests so the scorecard remains part of the default install.

### Consequences

Frontend acceptance is now more repeatable. Significant UI work can be rejected for named scorecard failures rather than vague taste concerns, and best-practice frontend claims require a stronger score plus desktop/mobile and visual QA evidence. This adds one more evidence artifact for frontend work, but it directly addresses the risk that broad repo research produced guidance without a measurable acceptance threshold.

## 2026-06-03 - Publish Sanitized Dogfood Evidence

### Context

The package already had earlier dogfood notes from two downstream projects, but later hardening made those results stale. Current read-only audits now show both older installs fail the latest setup standard because they predate schema-backed council routing, assistant adapters, maturity gates, upgrade docs, visual QA, and reference-led design critique.

### Decision

Add `DOGFOOD.md` as a public-safe package asset that summarizes project archetypes, current audit counts, readiness levels, and generalized gaps. Keep detailed local-path dogfood notes in `dogfood/` and out of the public npm package. Add public-readiness tests that require dogfood evidence and prevent local paths from leaking into packaged docs.

### Consequences

Consumers can see adoption evidence without receiving private local project details. Stale downstream installs are treated as useful upgrade evidence rather than hidden failures. Public release still requires npm publication and post-publish `npx` verification before the package can claim full public adoption readiness.

## 2026-06-03 - Prove Older Install Upgrades With A Fixture

### Context

Read-only dogfood audits showed that two projects installed before later hardening now fail current setup checks. The docs already told users to run `agent-kit update`, but the package needed a deterministic regression test proving that update can safely move an older install toward the current baseline without overwriting project-owned docs.

### Decision

Add an older-install fixture test. The fixture creates a project with customized root docs and an older manifest that lacks current roster, schema, assistant-adapter, maturity, upgrade, and design-critique assets. The diff path must preview missing docs, changed docs, roster status, missing library folders, and update actions. Running the update path must preserve customized docs, write conflicts for changed templates, install missing baseline docs and `.agent-kit/` assets, refresh manifest metadata, and audit with zero failures.

### Consequences

The package now has executable proof for the upgrade path that real dogfood projects need next. This does not replace branch-based updates in the real projects, but it reduces the risk that current package upgrades break older installs.

## 2026-06-03 - Script Post-Publish Verification

### Context

The release workflow verified the published package with a small inline `npx doctor` command. That proved the binary was reachable, but it did not prove a public install could initialize a clean downstream project and produce a zero-failure audit.

### Decision

Add `scripts/post-publish-verify.mjs` and `npm run publish:verify`. The script waits for `npm view`, runs public `npx doctor`, initializes a clean temp project with the published package, and requires `audit --json` to return zero failures. The release workflow uses this script after publishing.

### Consequences

Post-publish verification is now repeatable locally and in GitHub Actions. Public release remains externally blocked until the npm scope/package exists and the script can run against the registry version.

## 2026-06-03 - Add A Frontend Distinctiveness Benchmark

### Context

The 100-repo scan and follow-up frontend reviews had already promoted content-first design, reference-led critique, visual QA, and a product-quality scorecard. That still left a practical quality gap: a UI could pass many evidence checks while remaining interchangeable with another AI-generated product in the same category.

### Decision

Add the Frontend Distinctiveness Benchmark skill, checklist, and prompt. Update `DESIGN.md` to require first-screen proof, content fingerprint, reference benchmark, creative divergence, asset provenance, state proof, and visual QA proof. Wire the Frontend Design Lead and frontend-change workflow to require distinctiveness benchmark evidence, and add audit/public-readiness tests so the benchmark cannot be dropped silently.

### Consequences

Significant frontend work now has to prove product specificity in addition to polish, accessibility, references, screenshots, and scorecard totals. This makes frontend acceptance more demanding, but it directly addresses the risk that broad research became a checklist without enough force against generic AI-site output.

## 2026-06-03 - Add Agent Model Routing As An AI Mechanism

### Context

The package already installed agent rosters, skills, schemas, assistant adapters, and audit checks. It still lacked a durable way to help users choose models per agent across Codex, Claude Code, Cursor, and GitHub Copilot without pretending every IDE can enforce those choices from repository files.

### Decision

Add `MODEL_ROUTING.md`, `.agent-kit/model-routing.json`, `schemas/model-routing.schema.json`, runtime validation, audit warnings, and model-selection adapter examples. Keep the machine-readable routing provider-neutral and place dated June 2026 model-name comments in adapter setup files.

### Consequences

Downstream projects can now document model selection as a first-class mechanism alongside instructions, roster, skills, tools, hooks, audit, and CI gates. Audit warns when model routing is missing or unverified, but does not fail solely because an IDE only supports advisory model selection.

## 2026-06-07 - Add Marketing Copy As A Default Council Boundary

### Context

The kit already made frontend design stricter through content-first design, reference-led critique, distinctiveness benchmarking, visual QA, and product-quality scoring. Public-facing projects still had a gap: agents could produce generic or unsupported marketing copy while satisfying visual and technical gates.

### Decision

Add Marketing Copy Lead as a default council agent. Install `MESSAGING.md` as the positioning, value proposition, proof, objection, voice, and CTA contract. Add copywriting skills, a marketing-copy checklist, a copy-review prompt, roster routing, model routing, and audit checks for copy workflow coverage and messaging evidence.

### Consequences

Public-facing and conversion-facing copy now has an auditable owner and evidence path before implementation. The package becomes stricter for landing pages, onboarding, empty states, pricing, and CTA work, but it reduces the risk of vague SaaS language, invented proof, unsupported AI claims, dark patterns, or risky compliance and performance claims.

## 2026-06-07 - Make Agent Studio Local And Markdown-First

### Context

The kit installs a strong council roster, skills, assistant adapters, model routing, and council-session evidence templates. The remaining adoption risk is that agents can still be counterproductive when they lack project-specific context or when their collaboration disappears into transient chat windows. Users need to see what agents decided, how they handed work off, and how human corrections change future behavior.

A hosted dashboard, database, or direct AI orchestration layer would add operational and security complexity before the file protocol is proven. It would also make the package harder to adopt in existing projects.

### Decision

Add Phase 9 for a local-first Agent Studio workflow. The first implementation will use `.agent-kit/project-context.json`, `.agent-kit/corrections/*.json`, append-only `.agent-kit/council-sessions/*/events.jsonl`, and generated Markdown session views. IDE agents remain the default actor: they read context and corrections, then record decisions, handoffs, artifacts, verification, and user corrections through CLI helpers or structured file writes.

Do not require SQLite, a hosted service, a background daemon, or model API credentials for the baseline workflow. Direct AI orchestration and live GUI/canvas views are deferred until the JSON/JSONL and Markdown contracts are useful by themselves.

Make automated testing part of the Phase 9 definition of done. The release gate must run the Agent Studio smoke path so guided onboarding, context generation, correction persistence, session logging, Markdown rendering, static export, redaction, and audit behavior are checked before users test changes manually.

### Consequences

Installed projects get faster context capture, inspectable agent collaboration, durable human corrections, and a static local Studio view without adopting another software stack. The package must keep schemas, CLI commands, renderers, adapter instructions, audit checks, and tests aligned so context/session/export files stay valid and secret-safe. The design is less flashy than a full live GUI at first, but it keeps the source of truth reviewable in Git and lets future live studio views render over the same local files.

## 2026-06-07 - Track Required Outputs As Session Events

### Context

Agent Studio sessions already stored required outputs in `session.json`, and audits failed completed sessions when outputs were still missing or partial. Dogfood showed a practical rough edge: users and IDE agents had no CLI command to mark a required output complete or not applicable, so a session could not be closed cleanly without manual JSON edits.

### Decision

Add `agent-kit session output <name...> --status <missing|partial|complete|not-applicable> --evidence <evidence>`. The command updates the matching required output in `session.json` and appends a `required_output_updated` row to `events.jsonl`. The CLI validates status before writing, and the session-event schema requires both `outputName` and `outputStatus` for the new event type.

### Consequences

Required-output status is now visible in rendered Markdown, the static Studio export, and audit evidence. Completed-session checks remain strict without forcing direct JSON edits. Future live UI work can build controls on top of the same command and event shape instead of inventing a separate state store.

## 2026-06-07 - Pin OpenSSF Scorecard And Gate It To Public Repos

### Context

The pushed `OpenSSF Scorecard` workflow failed before running because GitHub could not resolve `ossf/scorecard-action@v2`. After pinning the action, the private repository still failed with `Resource not accessible by integration` while Scorecard tried to inspect commits through GitHub GraphQL. This is a supply-chain workflow, so unresolved actions or private-repo permission failures block release confidence even when package code and CI pass.

### Decision

Pin the workflow to the current published upstream release tag `ossf/scorecard-action@v2.4.3`, and run the Scorecard job only when `github.repository_visibility == 'public'`.

### Consequences

The Scorecard workflow can resolve deterministically on GitHub-hosted runners and will stop failing private-repo pushes for a public-readiness check that cannot publish useful public results yet. When the repo is made public, Scorecard runs automatically again. Future Scorecard upgrades should be explicit workflow changes with normal release-gate review.

## 2026-06-07 - Gate CodeQL Until Code Scanning Is Available

### Context

The pushed `CodeQL` workflow reached analysis but failed because code scanning is not enabled for the private repository. The action reported `Resource not accessible by integration` against the workflow-run API and noted that code scanning must be enabled in repository settings.

### Decision

Run the CodeQL job only when `github.repository_visibility == 'public'`. Keep package security coverage active through `npm run release:check`, dependency audit, SBOM validation, local tests, and the release workflow while the repo remains private.

### Consequences

Private-repo pushes no longer fail on a GitHub code-scanning feature that is unavailable in the current repository settings. CodeQL starts running automatically once the repo is made public. If private GitHub Advanced Security/code scanning is enabled before publication, this gate can be revisited deliberately.

## 2026-06-07 - Install Assistant Adapter Rules During Init

### Context

Assistant adapter templates existed under `.agent-kit/assistant-adapters/`, but downstream projects still had to manually copy IDE rule files into `.cursor/rules/`. That left assistant activation as a common setup gap in dogfood audits and delayed provable adapter evidence.

### Decision

Copy the canonical assistant adapter files during `agent-kit init`:

- `.cursor/rules/cursor-agent-kit.mdc`
- `.cursor/rules/cursor-model-selection.mdc`

Use the same conflict-safe write behavior as root docs. Document activation and verification steps in `ASSISTANT_ADAPTERS.md`. Enforce install and baseline readiness through `smoke:install`, `smoke:audit-gate`, CI, and update regression tests.

### Consequences

Fresh installs now have an explicit IDE adapter activation surface without forking council instructions. Customized projects may receive adapter updates through `.agent-kit/conflicts/` during `agent-kit update`. Audit and release gates now require baseline readiness, not just zero failures.

## 2026-06-07 - Scope Optional Runtime Orchestration Separately

### Context

The readiness review confirmed the kit is strong as an IDE-driven multi-agent harness but does not yet provide autonomous runtime orchestration. Milestone 9 was deferred, but teams need a concrete scope before implementation starts.

### Decision

Add [RUNTIME_ORCHESTRATION_SCOPE.md](RUNTIME_ORCHESTRATION_SCOPE.md) as the source of truth for Milestone 9. Keep baseline behavior unchanged: IDE agents, local JSON/JSONL/Markdown evidence, and CLI audit gates remain the default path. Any future orchestrator must reuse existing session schemas and stay opt-in.

### Consequences

The project can discuss runtime execution without confusing it with current v0.1 deliverables. Implementation can start from schema and validate-only commands before any provider adapter ships.

## 2026-07-02 - Dogfood The Kit Into Its Own Repository Root

### Context

The always-apply Cursor rules told agents to treat root `AGENTS.md`, `.agent-kit/*`, `COUNCIL.md`, and related files as the source of truth, but those files only existed under `templates/next-supabase/`. The rules were broken on the kit's own repo.

### Decision

Run `agent-kit init` on the repo itself. Keep the resulting root docs and `.agent-kit/` evidence files in git, but gitignore the `.agent-kit/` copies of library folders (agents, skills, prompts, and so on) that duplicate the top-level source directories, matching the committed-example pattern. Fill project context, council session, adapter verification, and overrides with real repo evidence, and hold the repo to `audit --min-readiness best-practice-candidate`.

### Consequences

The Cursor rules now reference files that exist. The repo permanently exercises its own install, update, audit, and studio paths, and the root install doubles as a living best-practice example. Template updates will surface here first as conflicts to review.

## 2026-07-02 - Hash-Aware Update Semantics

### Context

`agent-kit update` previously re-ran `initProject`, which could not distinguish pristine installed docs from user-customized ones, so every template change produced conflict noise even for unmodified files.

### Decision

Add `updateProject` (`src/install/update.ts`): compare each doc's local hash against the manifest's installed template hash and the current bundled template hash. Pristine docs auto-refresh, unmodified templates keep local edits silently, and only genuine divergence writes a conflict. Add `--dry-run` and per-file action reporting (`created`, `updated`, `unchanged`, `kept-local`, `conflict`, `overwritten`), and record `updatedAt` in the manifest.

### Consequences

Upgrades stop generating false conflicts, downstream review focuses on real divergence, and the update contract is documented in `SPEC.md` with unit and CLI-contract tests.

## 2026-07-02 - Engineering Hygiene Baseline: Lint, Format, Coverage, CI Matrix, Changesets

### Context

`npm run lint` was aliased to `tsc --noEmit`, CI ran only ubuntu/Node 20 while the CLI is developed on Windows, coverage was unmeasured, and versioning was manual.

### Decision

Adopt ESLint (flat config, typescript-eslint recommended-type-checked) plus Prettier and `.editorconfig`, wired into `release:check`. Gate vitest coverage at 70/70/70/65 via `vitest.config.ts`. Expand CI to a {ubuntu, windows, macos} x {20, 22, 24} matrix, covering the release workflow's Node 24. Adopt changesets for versioning and changelog automation with a `version.yml` workflow; publishing stays in the hardened Trusted Publishing release workflow. Delete `.npmignore` in favor of the `files` allow-list (verified byte-identical pack output).

### Consequences

Type-aware linting immediately caught a real bug (`resolveNpxCommand` used without import in `post-publish-verify.mjs`). Cross-platform path behavior is now regression-tested on every push. Release versioning is PR-driven instead of hand-edited.

## 2026-07-02 - Human-First CLI Output With A Stable JSON Contract

### Context

Every command printed raw `JSON.stringify` output, which reads as unfinished tooling and buries the audit's readiness verdict; only `audit` had `--json`.

### Decision

Default all commands to concise human-readable output (semantic ANSI color only on a TTY without `NO_COLOR`), add `--json` to every command as the stable machine contract, add `--dry-run` to `init` and `add skill` (in addition to `update`), make `init --guided` interactive via `@clack/prompts` on a TTY with a non-interactive fallback, and route all errors through a single `error: <message>` boundary with exit code 1. Documented in `SPEC.md` as the output and exit-code contract.

### Consequences

Machine consumers must pass `--json` (smoke scripts and tests were updated accordingly); human output is explicitly not a stable contract. The CLI gains two small runtime dependencies (`picocolors`, `@clack/prompts`).
## 2026-07-11 - Publish And Verify npm Before Creating GitHub Releases

### Context

The `v0.1.9` GitHub release was published before npm completed, and the workflow injected `secrets.NPM_TOKEN` despite the documented OIDC-only policy. npm then requested OTP authentication, leaving a public GitHub release with no matching registry version. The Changesets workflow also lacked the repository-level permission needed to create its version PR.

### Decision

Use npm Trusted Publishing as the only automated package-write path. A merged Changesets version PR triggers release inspection; an unpublished package is packed, attested, published, and verified from the public registry before the workflow creates its tag and GitHub release. Pin every third-party workflow action to an immutable commit SHA. Keep the published `v0.1.9` tag immutable and describe it as superseded rather than moving it to a different commit.

### Consequences

Missing OIDC configuration now fails closed. Retrying after npm succeeds but GitHub release creation fails is safe because release and registry state are inspected independently. Repository administrators must allow GitHub Actions to create pull requests for the scoped Changesets workflow.

## 2026-07-11 - Ship Optional LangGraph Orchestration As A Separate Package

### Context

The roster, IDE adapters, and Agent Studio evidence could describe a council but could not execute or resume one. Adding provider behavior to the baseline package would force credentials, native SQLite, and orchestration dependencies onto projects that only need instruction adapters.

### Decision

Ship `@appsforgood/agent-kit-runtime` as an optional workspace and public package. Compile validated roster sequences to explicit bounded LangGraph nodes, checkpoint in SQLite, route providers through deterministic capability-gated aliases, support allowlisted MCP, and pause at risk-tiered approval gates. Keep mutations in isolated Git worktrees with Docker as the default command boundary. Permit Cursor and stdio MCP host processes only after config opt-in and host approval. Persist redacted versioned evidence. Allow one approved scoped commit, but never merge, push, open a pull request, deploy, or apply migrations.

The root CLI and localhost Studio dynamically import the runtime. Disabled or absent runtime state must not break baseline install, audit, sessions, or adapters. Publish and verify runtime before the root package in the OIDC release job, with separate tarballs and SBOM attestations.

### Consequences

Projects gain inspectable, resumable execution without changing the canonical roster. Baseline installs remain lightweight. Runtime users accept a reviewed native SQLite addon, Docker or explicit host-execution policy, provider/MCP configuration, and operator approval workflow. IDE delegation alone is no longer valid runtime evidence. The earlier “Scope Optional Runtime Orchestration Separately” decision is superseded by this implemented contract.
