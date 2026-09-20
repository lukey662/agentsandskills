# Specification

## Package Purpose

`@appsforgood/next-supabase-kit` installs six specialist agents, twelve skills, and a user guide into a Next.js + Supabase repository, rendered natively for Cursor, Claude Code, Codex, GitHub Copilot, and Antigravity. The one rule it enforces everywhere: a user-visible change is not done until someone opened the running UI, captured desktop and mobile screenshots, and reviewed those images.

## CLI Surface

The package exposes the `agent-kit` binary (alias `agents-and-skills`) from `dist/index.js`.

- `init [--stack next-supabase] [--activate cursor|claude|codex|copilot|antigravity|all] [--force] [--dry-run] [--json]`
- `update [--force] [--dry-run] [--prune-legacy [--yes]] [--json]`
- `add skill <id>` / `add agent <id>` (optional catalog entries only; rendered to every activated host)
- `doctor [--json]`
- `guide [--json]`
- `adapter validate [cursor|claude|codex|copilot|antigravity|all] [--json]`
- `package validate [--json]` (source repository only)

### Output And Exit-Code Contract

- Commands print human-readable output by default and accept `--json` for machine-readable output. Machine consumers must pass `--json`; the human format is not a stable contract.
- Colour is ANSI semantic colour only when stdout is a TTY and `NO_COLOR` is unset; otherwise monochrome. The level word is always printed.
- Exit codes: `0` success; `1` for invalid input, a failed `doctor`, a cancelled prune, or a runtime error. Errors print one `error: <message>` line to stderr.

## Install Layout

`init` writes root docs and one skills location, then the native agent files for each activated host.

| Path | Written when | Read by |
| --- | --- | --- |
| `AGENTS.md`, `USER_GUIDE.md`, `USER_GUIDE.html` | always | every host and every human |
| `.agent-kit/manifest.json`, `.agent-kit/config.json` | always | `update`, `doctor`, `adapter validate` |
| `.cursor/rules/cursor-agent-kit.mdc` | always | Cursor (always-on rule) |
| `.agents/skills/<id>/SKILL.md` | always | Cursor, Codex, Copilot, Antigravity (Agent Skills open standard) |
| `.cursor/agents/<id>.md` | cursor | Cursor Task subagents |
| `.claude/agents/<id>.md`, `.claude/skills/<id>/SKILL.md`, `CLAUDE.md` | claude | Claude Code subagents and skills |
| `.codex/agents/<id>.toml` | codex | Codex custom agents |
| `.github/agents/<id>.agent.md`, `.github/copilot-instructions.md` | copilot | Copilot custom agents (`/agent <id>`) and repository instructions |
| `.agents/agents/<id>/agent.md`, `.agents/rules/agent-kit.md` | antigravity | Antigravity custom subagents and workspace rules |

Nothing else is written. There is no `.cursor/skills/`, no `.antigravity/`, and no repo-root `skills/` in an install; those were 0.4 locations and `update --prune-legacy` removes them.

### Per-Host Agent Frontmatter

Canonical agents in `agents/<id>/agent.md` carry `name`, `description`, `tools`, and `requiredTools` in the kit's own vocabulary (`repo`, `edit`, `terminal`, `browser`, `screenshot`, `image-review`, `test-runner`). The renderer in `src/install/roster-adapters.ts` keeps the body byte-for-byte, prefixes one line (`> Required tools: …. Do not drop them.`) when the agent has required tools, and rewrites the frontmatter to what each host documents:

- **Cursor**: `name`, `description`, `model: inherit`; `readonly: true` when the canonical `tools` list is only `repo` (Planner). Cursor has no `tools` field.
- **Claude Code**: `name`, `description`, `model: inherit`; `effort: high` for planner, security, design; `tools:` mapped to real Claude tool names (`repo → Read, Grep, Glob`; `edit → Edit, Write`; `terminal`/`test-runner → Bash`; plus `Skill`) only when the agent needs no browser tools, otherwise omitted so the agent inherits everything; `skills:` preloading the agent's catalog skills. Claude refuses to launch a subagent whose `tools` do not resolve, so the kit vocabulary never reaches a Claude file.
- **Codex**: TOML with `name`, `description`, `model_reasoning_effort` (`high` for planner, security, design), and `developer_instructions` holding the canonical markdown verbatim.
- **Copilot**: `name`, `description`. Tools omitted means all.
- **Antigravity**: `name`, `description`, `subagent: true`, `mainAgent: true`, `skills:` as `skills/<id>` paths relative to `.agents/`.

Descriptions are double-quoted YAML scalars because they contain colons. `src/install/host-frontmatter.ts` holds the allowlists (`CURSOR_AGENT_KEYS`, `CLAUDE_TOOL_NAMES`) and `validateHostAgentFile`, which `adapter validate`, `doctor`, and the tests all use.

### Update And Prune

`update` refreshes pristine managed files (`AGENTS.md`, `USER_GUIDE.*`, the Cursor rule, `CLAUDE.md`, `.agents/rules/agent-kit.md`) by hash and regenerates `.agents/skills/` and the activated hosts' agent files. Local edits win or land in `.agent-kit/conflicts/`. It never deletes unless `--prune-legacy` is passed.

`update --prune-legacy`:

- Deletes only paths on the allowlist in `src/install/prune-legacy.ts`: 0.3 council root docs and `.agent-kit/` library folders, council agent and skill files by id, council Antigravity commands, kit-installed files whose body is the council version, and the 0.4 skill copies (`.cursor/skills/<id>/`, `.antigravity/`, repo-root `skills/<id>/`).
- Detects a council stub at a 0.4+ agent path by content (no `description`, or council doc names such as `COUNCIL.md` and `.agent-kit/agents/` in the body), never by path alone.
- Never removes repo-root `skills/` when `cwd` is the kit's own source tree (`isKitSource`: `catalog.json`, `agents/`, and `src/catalog.ts` present).
- Prints the plan and requires an interactive `y` or `--yes`; `--dry-run` prints the plan only. Runs before regeneration so every deleted 0.5-owned path is recreated in the same call.

`doctor` fails when a default agent file on any host is a council stub, will not load under that host's frontmatter rules (for example a Claude `tools:` entry that is not a Claude tool), or has dropped the packaged required tools from its `Required tools` line. It fails when the always-on Cursor rule or `.github/copilot-instructions.md` carries council routing. It warns when council skills, 0.4 skill copies, or `.antigravity/` remain. Every message names the fix.

## Default Agents And Skills

`catalog.json` is the single machine-readable contract:

- `defaultAgents` (`planner`, `app-engineer`, `security`, `design`, `qa`, `copy`), `optionalAgents`, `defaultSkills` (twelve), `optionalSkills`.
- `agentSkills`: the skills each agent must run. Claude preloads them through `skills:`; Antigravity attaches them; the agent files name them in prose.
- `screenshotFailClosed`: the sentence `doctor` requires in `USER_GUIDE.md` and `USER_GUIDE.html`.
- `askPolicy`: ask only when the answer changes what gets built; never what the repo can answer; up to three bundled questions with a default each; proceed on defaults when told to go or when non-interactive; no gate on the wording of the yes.
- `spawnPayloads`: the eight handoff prompts (`planner`, `app-engineer`, `security`, `design`, `design-setup`, `qa`, `copy`, `ship`).

Required behavior:

- `templates/next-supabase/AGENTS.md` renders `askPolicy` under `## Ask before acting` and every payload under `## Spawn payloads`. Agents reference payloads by name and inline only the QA payload.
- Each agent has an `## Ask before acting` section with its own decision-relevant unknowns.
- The subagent id is the agent id on every host. No shipped file maps an agent to a council role name.
- `doctor` fails when Design or QA drop `browser`, `screenshot`, or `image-review`.
- Tests: `payloads` (every copy equals the catalog), `rendered-drift` (every host file equals the current render; bodies equal canonical), `adapter-frontmatter` (per-host schema), `no-kit-content` (no kit palette, HTML, or scan notes in shipped files), `doctor-legacy` (stubs fail, prune is allowlisted and guarded). `npm run dogfood:check` applies the same to this repo's own rendered layers.

## Copy Surface

One Copy agent. `product-copy` runs first; `deslop` runs last. `product-copy` reads the product's `MESSAGING.md` when it exists, names Reader / Job / One action / Proof, marks open slots `assumption`, and is product-neutral. `deslop` owns words only: word tells, structure tells, the Reader test, the claim sweep, and an allowance for imperative commands and labels in a tool context. It hands pixels to Design.

## Frontend Surface

`frontend-design` owns visual quality and the visual fail list. Modes `setup`, `build`, `review`, `detect`; surfaces `landing`, `app-chrome`, `inside-design-system`. Setup is an interview that writes a short product `DESIGN.md` and no CSS. Build derives the direction in five lines (Object, Field/ink/accent with hex, Type with a reason, Structure, Removed) before tokens. Review and detect return a P0 / P1 / P2 table with Where, Confidence, and Kind, then name swap / squint / signature. Each detect tell appears once. This repo's own tokens live in `DESIGN.md` at the repo root, not in the shipped skill.

## Release System

One public npm package, published by `.github/workflows/release.yml` through npm Trusted Publishing (GitHub Actions OIDC, environment `npm-publish`). The workflow runs `npm run release:check`, packs one tarball, generates and attests a CycloneDX SBOM, publishes with inherited token state scrubbed, verifies the published package with `scripts/post-publish-verify.mjs` (`init --activate all`, `doctor`, `adapter validate all`, `.agents/skills/browser-qa` present), then creates the `vX.Y.Z` GitHub release.

## Security Requirements

- No long-lived npm publish tokens in GitHub Actions; OIDC only. Inherited `NODE_AUTH_TOKEN` or setup-node user config must not become a publish fallback.
- `npm audit --audit-level=moderate` before publishing.
- CycloneDX SBOM from `package-lock.json`, uploaded as release evidence and attested for the published tarball.
- `update --prune-legacy` re-resolves every path inside `cwd` before deletion and removes symlinks rather than their targets.
- The kit never writes secrets, environment values, or tokens into installed files. The `ship` skill forbids secret values in a go/no-go note.
- Pinned, reviewed npm lifecycle-script approvals; optional unneeded scripts denied.
