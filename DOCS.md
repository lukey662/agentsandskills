# Developer Docs

## Architecture

The repository has five main subsystems:

- CLI commands in `src/cli`
- Install and audit logic in `src/install`
- GitHub research and repo analysis in `src/research`
- Static installable assets in `templates`, `agents`, `skills`, `prompts`, `checklists`, `design-adapters`, `design-briefs`, `profiles`, `rosters`, `model-routing`, and `schemas`
- Runtime adapter assets in `antigravity` and portable skill wrappers in `runtime-skills`
- Optional executable orchestration in `packages/runtime`

The CLI reads bundled assets from the package root so the same commands work in local development and after build.

Package-level research decisions are recorded in `DECISIONS.md`.

## Install Behavior

`agent-kit init --stack next-supabase` installs root markdown docs, copies library assets into `.agent-kit/`, runs a lightweight project scan to create `.agent-kit/project-context.json`, installs Cursor rules, and ships `.github/workflows/agent-kit-audit.yml`.

Promote other IDE surfaces with:

```bash
agent-kit init --activate cursor    # .cursor/agents/*.md, .cursor/skills/*/SKILL.md, scoped rules
agent-kit init --activate claude    # .claude/agents/*.md + CLAUDE.md
agent-kit init --activate copilot   # .github/copilot-instructions.md
agent-kit init --activate codex     # .codex/config.toml + .codex/agents/*.toml
agent-kit init --activate antigravity # .antigravity plugin, commands, and runtime SKILL.md wrappers
agent-kit init --activate all       # all of the above (Cursor rules remain on every init)
```

## Multi-agent fidelity tiers

- **Tier A — policy-only:** plain `init` installs council docs + Cursor always-on rules. One agent role-plays the council.
- **Tier B — native specialists:** `init --activate cursor|claude|codex` generates IDE-specific council subagents/custom agents from `.agent-kit/agent-roster.json`.
- **Tier C — programmatic orchestration:** optional `@appsforgood/agent-kit-runtime` and `agent-kit orchestrate`, with SQLite checkpoints, approvals, provider/MCP adapters, isolated worktrees, and redacted evidence.

Validate activation with `agent-kit adapter validate cursor|codex|claude|all`.

Existing files are never overwritten by default. Conflicting template updates are written to `.agent-kit/conflicts/`.

The installer writes `.agent-kit/agent-roster.json`, `.agent-kit/model-routing.json`, disabled-by-default `.agent-kit/orchestrator.json`, `.agent-kit/runtime/.gitignore`, and JSON Schema contracts. Installed schemas include orchestrator config plus runtime run/event evidence. The roster is the default council contract:

- Planner starts planning, roadmap, scope, and ambiguous requests.
- Lead Architect reviews core changes before implementation.
- Security Reviewer joins auth, data mutation, dependency, secret, external-call, and release-risk changes.
- Frontend Design Lead owns `DESIGN.md`, brand/content intake, creative-direction rationale, frontend distinctiveness benchmarking, frontend product-quality scoring, and screenshot acceptance for frontend changes.
- Frontend Design Lead owns reference-set evidence, anti-references, source-safety notes, and the design critique verdict for significant frontend changes.
- Marketing Copy Lead owns `MESSAGING.md`, positioning, value proposition, public-facing copy, proof, objections, voice/tone, and CTA hierarchy for copy or conversion-facing changes.
- QA Engineer verifies behavior changes.
- Documentation Maintainer keeps living markdown current.

New manifests include `templateHashes` for each root markdown template. `agent-kit audit` uses these hashes to distinguish current templates, stale installed templates, and locally customized docs.

Assistant adapter templates are installed into `.agent-kit/assistant-adapters/`. `ASSISTANT_ADAPTERS.md` records which tool surfaces are active, including AGENTS.md-compatible tools, GitHub Copilot/VS Code instructions, Cursor project rules, Claude Code subagents, model-selection status, enforcement level, and evidence.

Antigravity activation installs `.antigravity/agent-kit/plugin.json`, `.antigravity/agent-kit/commands/*.toml`, `.antigravity/runtime-skills/*/SKILL.md`, and `.antigravity/agent-kit/README.md`. Validate it with:

```bash
agent-kit adapter validate antigravity
```

Native runtime commands are adapters only. They expose `/setup`, `/spec`, `/audit`, `/plan`, `/handoff`, `/frontend`, `/test`, `/review`, focused UI improvement commands, `/security`, `/copy`, `/ship`, and `/upgrade`, but the canonical behavior still lives in `AGENTS.md`, `.agent-kit/agent-roster.json`, `QUALITY_GATES.md`, `.agent-kit/skills/`, `.agent-kit/prompts/lifecycle-command-index.md`, and Agent Studio session evidence.

Focused UI improvement commands are `/ui-audit`, `/ui-polish`, `/layout-cleanup`, `/responsive-cleanup`, `/accessibility-pass`, `/distinctiveness-pass`, `/screenshot-critique`, and `/browser-qa`. Their source-of-truth workflow is `.agent-kit/prompts/ui-command-index.md`, backed by `.agent-kit/checklists/ui-detectors.md`, `.agent-kit/checklists/ui-acceptance-rubric.md`, and `.agent-kit/skills/ui-improvement-harness.md`. Delivery lifecycle commands (`/setup` through `/upgrade`) use `.agent-kit/prompts/lifecycle-command-index.md` as the workflow index. High-risk UI work must include desktop and mobile screenshots plus authenticated or permission-state evidence when the surface requires login, roles, tenant context, or permissions.

`UPGRADE.md` records the downstream upgrade flow for `agent-kit diff`, `agent-kit update`, framework codemods, Supabase migration review, release notes, audit thresholds, and rollback evidence.

Use `agent-kit audit --json` for machine-readable output in scripts or CI. The output shape is documented by `schemas/audit-report.schema.json` and installed to `.agent-kit/schemas/audit-report.schema.json`.

Use `agent-kit package validate` from the source repository before release. It checks runtime adapter assets, portable skills, docs, example snapshots, package file allowlists, and source-package audit behavior.

Audit also validates the default council roster against the runtime contract that mirrors `schemas/agent-roster.schema.json`. Missing roster files, malformed roster shape, missing default agents, missing skill routing, or a core-change workflow without Lead Architect produce audit failures. Missing schema files, incomplete `COUNCIL.md` handoff evidence, or missing model-routing evidence produce warnings so existing installs can upgrade without being blocked.

`MESSAGING.md` is installed as the persistent positioning and copy-evidence contract. It captures discovery questions, audience, pain, desired outcome, differentiator, proof, objections, voice/tone, page or flow copy inventory, and CTA hierarchy. Audit warns when this doc does not connect claims to proof, objections, and conversion evidence.

## AI Mechanisms

The package deliberately separates AI operating mechanisms:

- Instruction files steer behavior in Codex/AGENTS.md-compatible tools, Copilot, Cursor, and Claude Code.
- Runtime command files steer Antigravity-style command entrypoints without becoming canonical policy.
- `.agent-kit/agent-roster.json` provides machine-readable council routing.
- `.agent-kit/skills/` keeps reusable specialist workflows out of one-off prompts.
- `runtime-skills/*/SKILL.md` provides portable wrappers for runtimes that discover skill directories.
- `MODEL_ROUTING.md` and `.agent-kit/model-routing.json` map agents to model profiles and record IDE enforcement limits.
- `.agent-kit/project-context.json`, `.agent-kit/project-context.md`, and `.agent-kit/corrections/*.json` keep project-specific context and durable human corrections local.
- `.agent-kit/council-sessions/*/events.jsonl` plus rendered Markdown make visible agent collaboration inspectable without a database.
- `ASSISTANT_ADAPTERS.md` records active IDEs, model-selection status, tool/MCP setup, and evidence.
- Optional hooks can enforce local policies, but they are not enabled by default because they execute local commands and require trust review.
- Optional orchestration (`agent-kit orchestrate`) compiles roster workflows to bounded LangGraph nodes without replacing IDE subagents. Runtime evidence uses dedicated versioned run/event contracts.

If a project stores structured council sessions in `.agent-kit/council-sessions/*.json`, audit validates each record against the runtime contract that mirrors `schemas/council-session.schema.json`.

## Startup Wizard (Agent Office)

`agent-kit setup` serves a local-only **Agent Office** at `http://127.0.0.1:9321` (default). Routes:

| URL | View |
| --- | --- |
| `/` or `/setup` or `/office` | Pixel Agent Office (default) |
| `/wizard` | Form wizard fallback |

The office is a top-down canvas: click agents at desks to brief them, visit zone stations, or stroll to the **coffee machine** and **water cooler** in the break room. Agents move on the floor; progress is unified with onboarding state.

Writes: `.agent-kit/project-context.json`, `project-context.md`, `agent-briefs.md`, `onboarding/state.json`, `wizard-draft.json`.

**Note:** Requires `@appsforgood/next-supabase-kit@0.1.9` or later.

## Live Studio (session mirror)

`agent-kit studio serve` starts a localhost-only **live Agent Office** (default port `9331`) that mirrors council session activity:

```bash
agent-kit studio serve --open
```

| Endpoint | Purpose |
| --- | --- |
| `GET /` | Live office canvas + transcript panel |
| `GET /api/sessions` | List sessions + active id |
| `GET /api/sessions/:id/events` | Read redacted `events.jsonl` |
| `GET /api/events/stream` | SSE stream when events append |
| `POST /api/sessions/:id/note` | Record a council note (`{ agent, text }`) into `events.jsonl` |
| `POST /api/sessions/:id/render` | Render `index.md` and `transcript.md` for the session |
| `GET /api/runtime/runs` | List checkpointed orchestrator runs |
| `GET /api/runtime/runs/:id` | Read one run and its redacted events |
| `POST /api/runtime/runs` | Start a run |
| `POST /api/runtime/runs/:id/decision` | Approve or reject the pending gate |
| `POST /api/runtime/runs/:id/cancel` | Cancel a paused or in-process local run |

The live office UI includes a **session picker** (reconnect SSE to any session), an **Add note** form, and a **Render markdown** button that call the POST endpoints above. All mutations stay localhost-only and reuse the same file contracts as the CLI.

Record work with existing CLI commands (`session start`, `session note`, `session handoff`, etc.) or batch them:

```bash
agent-kit session checkpoint --file .agent-kit/checkpoint.json
```

The live view updates when `events.jsonl` changes — no IDE chat scraping.

Static fallback: `agent-kit studio export` → `.agent-kit/studio/index.html`.

## Agent Studio

Phase 9 is tracked in `ROADMAP.md` and detailed in `AGENT_STUDIO_PLAN.md`.

The implemented Markdown-first Agent Studio workflow is local-first:

- JSON and JSONL files are the durable source of truth.
- Generated Markdown is the primary human interface.
- `agent-kit setup` serves the local Agent Office (default) and form wizard (`/wizard`) for project onboarding. Placeholders and Supabase baselines stay generic; each downstream project supplies its own product-specific values.
- `agent-kit studio export` provides a self-contained static HTML view for visual review.
- IDE/chat agents remain the default actor that reads context and records updates.
- No database, hosted service, background daemon, or model API key is required for the baseline workflow.
- Optional static or live GUI views must render from the same local files rather than becoming a separate source of truth.

Downstream files:

- `.agent-kit/project-context.json`
- `.agent-kit/project-context.md`
- `.agent-kit/agent-briefs.md`
- `.agent-kit/corrections/project-rules.json`
- `.agent-kit/corrections/agent-rules.json`
- `.agent-kit/council-sessions/<session-id>/session.json`
- `.agent-kit/council-sessions/<session-id>/events.jsonl`
- `.agent-kit/council-sessions/<session-id>/index.md`
- `.agent-kit/council-sessions/<session-id>/transcript.md`
- `.agent-kit/studio/index.html`

Core commands:

```bash
agent-kit setup
agent-kit init --guided
agent-kit onboard
agent-kit context init
agent-kit context scan
agent-kit context ask
agent-kit context render
agent-kit context validate
agent-kit context show
agent-kit session start "Build checkout flow" --workflow frontend-change
agent-kit session decision --agent planner --risk "Generic UI risk" "Use frontend-change workflow."
agent-kit session handoff --from planner --to frontend-design-lead --decision "Start design intake." --risk "Generic UI risk."
agent-kit session correct --agent frontend-design-lead --scope project "Keep UI dense and operational."
agent-kit session artifact --file DESIGN.md --note "Design direction reviewed."
agent-kit session verify --command "npm test" --result pass --notes "Tests passed."
agent-kit session output "visual QA evidence" --status not-applicable --evidence "No UI change."
agent-kit session checkpoint --file .agent-kit/checkpoint.json
agent-kit session render
agent-kit session close --status complete
agent-kit correction list
agent-kit correction add --scope project "Prefer operational density over hero-style marketing layout."
agent-kit correction apply --id project-ui-density
agent-kit correction retire project-ui-density --reason "Superseded by DESIGN.md update."
agent-kit correction propose-upstream project-ui-density
agent-kit studio export
agent-kit audit --json
```

Correction scopes are limited to `session`, `project`, `agent`, and `upstream-proposal`. Invalid scopes fail before a durable correction file is selected, so bad CLI or adapter input cannot fall through to project-level rules.

Every Agent Studio milestone must include automated tests with the feature. Current coverage includes unit tests, fixture-project tests, CLI smoke tests, example snapshot checks, regression tests for install/update/diff behavior, and security tests for required-output status validation, redaction, path traversal, malformed JSON/JSONL, static export secret safety, and secret-looking values. `npm run smoke:studio` is wired into `npm run release:check` so context/session/correction/export regressions fail before user testing.

Direct AI orchestration is optional. Baseline Agent Studio still works through installed IDE agents and local file updates when the runtime package is absent or disabled.

Audit validates frontend maturity beyond tokens and states. `DESIGN.md` must capture brand, content, user needs, creative direction, reference set, anti-references, distinctiveness, critique guidance, frontend distinctiveness benchmark, frontend product-quality scorecard, and design tokens. `STYLE_GUIDE.md` must require content-first creative direction before implementation. `TESTING.md` must document visual QA or visual-regression evidence for important UI changes.

UI improvement work also requires deterministic detector evidence. Agents should use `.agent-kit/prompts/ui-command-index.md` to choose the audit, polish, layout, responsive, accessibility, distinctiveness, screenshot, or browser QA workflow; classify findings with `.agent-kit/checklists/ui-detectors.md`; and accept or reject work with `.agent-kit/checklists/ui-acceptance-rubric.md`.

Audit also validates `QUALITY_GATES.md` as the downstream maturity model. The file must define baseline, strong, and best-practice evidence across council routing, architecture, security, Supabase/RLS, messaging, frontend, accessibility, testing, release, and repo health. This keeps research-backed expectations visible after install instead of leaving best-practice judgment in chat history.

Fresh installs can pass setup checks while warning on evidence placeholders. That warning is intentional: `TBD`, `example_table`, and starter instruction text mean the package installed correctly but the downstream project has not yet supplied real product, RLS, design, security, testing, deployment, or council evidence.

Audit reports include a `readiness` object. Use `needs-setup` for blocking setup failures, `baseline-setup` for valid installs with starter evidence placeholders, `needs-improvement` for remaining non-blocking warnings, and `best-practice-candidate` only when static audit finds no failures or warnings.

Downstream projects can gate CI with `agent-kit audit --min-readiness <level>`. Recommended thresholds:

- `baseline-setup` for newly installed projects that should at least keep the kit contracts intact.
- `needs-improvement` for active projects that have replaced starter evidence placeholders but still allow some warnings.
- `best-practice-candidate` for mature projects that want static audit to be fully clean before merge or release.

Older install upgrades are covered by `tests/update.test.ts`. The fixture simulates a project installed before roster schemas, assistant adapters, `DESIGN.md`, `QUALITY_GATES.md`, and `UPGRADE.md` existed. Diff must preview missing docs, changed docs, roster status, missing library folders, and update actions before files are touched. Update must preserve customized docs, write conflicts for changed templates, install missing current baseline assets, and produce an audit report with zero failures.

Projects can document accepted local template customizations in `.agent-kit/overrides.json`:

```json
{
  "templates": {
    "AGENTS.md": {
      "reason": "Project keeps a mature custom agent roster.",
      "owner": "engineering",
      "reviewedAt": "2026-06-02"
    }
  }
}
```

## Research Behavior

`research discover` requires `GITHUB_TOKEN` and writes `research/repo-candidates.json`.

`research scan` shallow clones each candidate, runs static analysis, writes a per-repo markdown finding, and removes clones unless `--keep-clones` is used.

Research evidence is committed:

- `research/repo-candidates.json`
- `research/candidate-review.md`
- `research/findings/*.md`
- `research/summaries/*.md`
- `research/proposed-updates.md`
- `BEST_PRACTICE_EVIDENCE.md`
- `DOGFOOD.md`

The first 100-repo scan is broad and operational. Focused follow-up summaries can be added when a topic needs deeper treatment, such as `research/summaries/creative-design-patterns.md` for design identity and content-first frontend quality, `research/summaries/design-critique-patterns.md` for reference-led frontend critique, `research/summaries/frontend-distinctiveness-benchmark-patterns.md` for first-screen and content-specific frontend evidence, `research/summaries/frontend-product-quality-rubric-patterns.md` for repeatable frontend acceptance scoring, `research/summaries/dogfood-adoption-patterns.md` for current downstream adoption evidence, `research/summaries/visual-qa-patterns.md` for visual regression and component-state evidence, or `research/summaries/maturity-model-patterns.md` for production-readiness evidence gates.

`BEST_PRACTICE_EVIDENCE.md` maps the strongest repeated findings to the installed assets and validation paths that make them enforceable.

The `Research Refresh` workflow runs quarterly and can be manually dispatched. It writes refreshed research artifacts as a workflow artifact for review before anything is committed.

## Stack Expansion

The package remains optimized for `next-supabase`, but `profiles/stack-next-firebase.md`, `profiles/stack-next-postgres.md`, and `profiles/stack-remix-supabase.md` document how to adapt the same operating model to adjacent stacks.

## Local Development

```bash
npm install
npm run dev -- doctor
npm test
npm run lint
npm run format
npm run build
```

### Maintainer dogfood

BaseRepo is the Agent Kit **source repository**, not a downstream install. Maintainers still dogfood the same CLI consumers use, but the overlay stays **local and gitignored** so kit source (`templates/`, `assistant-adapters/`, tracked docs like `DOCS.md` and `SPEC.md`) remains the commit surface.

Policy:

- Run `npm run dogfood:init` to execute `agent-kit init --stack next-supabase --activate cursor --activate codex` against the repo root.
- Generated `.codex/`, council docs from init (`AGENTS.md`, `COUNCIL.md`, etc.), and npm pack tarballs at repo root are listed in `.gitignore`.
- `.cursor/rules/` is tracked; other `.cursor/` content remains local.
- Validate locally with `node dist/index.js adapter validate cursor|codex` after activation.
- Record release evidence with [MAINTAINER_RELEASE.md](MAINTAINER_RELEASE.md) and loop patterns in [LOOP_CODING.md](LOOP_CODING.md).

This repository also commits a **living dogfood example** at the repo root (`.agent-kit/` evidence files, filled root docs, council sessions) so Cursor rules and audit gates can be exercised in CI.

### Agentic levels in Agent Office

`agent-kit setup` computes an **Agentic Engineering Level** (L3–L6 from signals; L7–L8 shown as deferred). The setup office and wizard display **current → target** level, an iceberg strip, and climb checklist steps derived from audit, adapter validation, and project context completeness.

- Scoring: [`src/studio/agentic-level.ts`](src/studio/agentic-level.ts)
- Report schema: [`schemas/agentic-level.schema.json`](schemas/agentic-level.schema.json)
- Research summary: [`research/summaries/agentic-engineering-maturity-levels.md`](research/summaries/agentic-engineering-maturity-levels.md)

Refresh after local audit or activation: `POST /api/agentic-level/refresh` while the setup server is running, or re-open `agent-kit setup`.

### Code quality tooling

- ESLint flat config (`eslint.config.js`, typescript-eslint recommended-type-checked) via `npm run lint` / `npm run lint:fix`.
- Prettier (`.prettierrc.json`, markdown and template assets excluded via `.prettierignore`) via `npm run format` / `npm run format:check`.
- Vitest coverage gate (`vitest.config.ts`, v8 provider, thresholds 70/70/70/65) via `npm run test:coverage`.
- Versioning uses changesets: run `npx changeset` with each user-visible change; the `Version` workflow opens a "Version Packages" PR. See `.changeset/README.md`.

## CI

GitHub Actions runs on pushes and pull requests to `main` across a matrix of {ubuntu, windows, macos} x Node {20, 22, 24}.

Required gates per matrix cell:

- `npm install --global npm@11.6.2`
- `npm ci`
- `npm run release:check` (includes lint, format, coverage, `npm run adapter:validate`, and `npm run smoke:setup`)
- `npm run smoke:audit-gate`
- `npm run smoke:ui-screens` (Playwright office/wizard screenshots; CI Ubuntu job only)

`npm run release:check` validates JSON assets, checks package version consistency, typechecks, lints, checks formatting, runs tests with the coverage gate, builds, checks committed example output against the current CLI, install-smokes the packed package, runs the Agent Studio smoke, runs dependency audit, validates CycloneDX SBOM generation, and performs package dry run. CI and release workflows both use this command so local and remote gates stay aligned.

Normal CI runs on Node 20 to prove the package's published `node >=20` engine contract. Production dependency updates must keep that contract unless a decision explicitly raises the engine requirement and updates release docs.

## Repository Health

Public OSS maintainability is tracked alongside package quality:

- `.github/ISSUE_TEMPLATE/*` captures bug reports, feature requests, and research-promotion proposals.
- `.github/pull_request_template.md` requires council scope, verification, security, docs, and citation evidence.
- `.github/labels.yml` defines the required issue and pull request labels.
- `.github/labeler.yml` and `.github/workflows/pr-labeler.yml` label pull requests by affected area and risk.
- `.github/CODEOWNERS` identifies default review ownership.
- `.github/dependabot.yml` keeps npm and GitHub Actions dependencies visible.
- `.github/workflows/codeql.yml` runs JavaScript/TypeScript CodeQL analysis.
- `.github/workflows/dependency-review.yml` blocks pull requests that introduce moderate or worse known vulnerable dependencies.
- `.github/workflows/scorecard.yml` publishes OpenSSF Scorecard evidence.
- `CODE_OF_CONDUCT.md`, `SUPPORT.md`, and `GOVERNANCE.md` define conduct, support, promotion, and release rules.
- `REPOSITORY_SETTINGS.md` documents required branch protection, `npm-publish` environment, private vulnerability reporting, security settings, discussions, and labels.
- `SUPPLY_CHAIN.md` documents Trusted Publishing, provenance, release gates, and maintainer rules.

These files are covered by public-readiness tests.

Dependency Review requires GitHub dependency graph support for the repository. If the workflow reports that dependency review is not supported, enable vulnerability alerts/dependency graph in repository security settings before weakening the gate. OpenSSF Scorecard keeps write permissions scoped to the Scorecard job because the action rejects globally writable workflow permissions when publishing results.

## Delivery Tracking

Use `ROADMAP.md` as the source of truth for phased implementation status and next actions.

## Release Notes

This is an MIT-licensed public package. Before each release, verify package metadata, public docs, research citation policy, dependency audit, and install-smoke evidence.

See `PUBLIC_RELEASE_REVIEW.md` for the public-release readiness checklist.

## Public NPM Release

Publishing targets the public npm registry package `@appsforgood/next-supabase-kit`.

Prerequisites:

- The npm `@appsforgood` org exists and the publishing account has access to `@appsforgood/next-supabase-kit`.
- npm Trusted Publishing is configured for package `@appsforgood/next-supabase-kit`.
- Trusted publisher settings:
  - Provider: GitHub Actions
  - Organization or user: `lukey662`
  - Repository: `agentsandskills`
  - Workflow filename: `release.yml`
  - Environment name: `npm-publish`
  - Allowed action: `npm publish`
- The version in `package.json` is unique, follows semantic versioning, matches `package-lock.json`, has a `CHANGELOG.md` section, and the release tag is `vX.Y.Z`.

Release process:

1. Update `package.json` and `package-lock.json` version in a normal PR.
2. Let CI pass on `main`.
3. Run the manual `Release` workflow with `dry_run=true` to validate checks without publishing.
4. Create or update a draft GitHub Release named `vX.Y.Z` where `X.Y.Z` matches `package.json`.
5. Confirm the npm Trusted Publisher settings match the release workflow exactly.
6. Publish the draft GitHub Release, or manually dispatch `Release` with `dry_run=false`.
7. The `Release` workflow runs the same quality gates as CI.
8. The workflow validates the GitHub OIDC context, packs the package into a tarball, generates a CycloneDX SBOM, attests the SBOM against the tarball, scrubs inherited npm token state, and publishes that same tarball with a token-free npm config through `npm publish <tarball> --access public`.
9. The workflow verifies public package installation with `node scripts/post-publish-verify.mjs`, which waits for `npm view`, runs public `npx doctor`, runs `init` in a clean temp project, and requires `audit --json` to report zero failures.

Do not use a bypass-2FA publish token for automation. If npm will not allow Trusted Publishing to be configured before the package exists, bootstrap the first version with a one-time manual OTP publish from a verified local checkout or another npm-approved package-creation path, then use Trusted Publishing for future releases.

Public install verification is separate from publish authentication and does not require an npm token after registry propagation. Maintainers can rerun it with:

```bash
npm run publish:verify
```

Public release evidence:

- CI and release dry-run gates are configured.
- Public package metadata is configured for `@appsforgood/next-supabase-kit`.
- The package is published to public npm; post-publish `npx` verification (doctor, clean init, baseline audit) last passed 2026-07-02 against the live registry.
