# Developer Docs

## Architecture

The package has four main subsystems:

- CLI commands in `src/cli`
- Install and audit logic in `src/install`
- GitHub research and repo analysis in `src/research`
- Static installable assets in `templates`, `agents`, `skills`, `prompts`, `checklists`, `design-adapters`, `design-briefs`, `profiles`, `rosters`, `model-routing`, and `schemas`

The CLI reads bundled assets from the package root so the same commands work in local development and after build.

Package-level research decisions are recorded in `DECISIONS.md`.

## Install Behavior

`agent-kit init --stack next-supabase` installs root markdown docs and copies library assets into `.agent-kit/`.

Existing files are never overwritten by default. Conflicting template updates are written to `.agent-kit/conflicts/`.

The installer writes `.agent-kit/agent-roster.json` from `rosters/next-supabase-default-council.json`, writes `.agent-kit/model-routing.json` from `model-routing/default-model-routing.json`, and copies JSON Schema contracts into `.agent-kit/schemas/`. Installed schemas cover the agent roster, council-session records, model routing, and audit-report output. The roster is the default council contract:

- Planner starts planning, roadmap, scope, and ambiguous requests.
- Lead Architect reviews core changes before implementation.
- Security Reviewer joins auth, data mutation, dependency, secret, external-call, and release-risk changes.
- Frontend Design Lead owns `DESIGN.md`, brand/content intake, creative-direction rationale, frontend distinctiveness benchmarking, frontend product-quality scoring, and screenshot acceptance for frontend changes.
- Frontend Design Lead owns reference-set evidence, anti-references, source-safety notes, and the design critique verdict for significant frontend changes.
- QA Engineer verifies behavior changes.
- Documentation Maintainer keeps living markdown current.

New manifests include `templateHashes` for each root markdown template. `agent-kit audit` uses these hashes to distinguish current templates, stale installed templates, and locally customized docs.

Assistant adapter templates are installed into `.agent-kit/assistant-adapters/`. `ASSISTANT_ADAPTERS.md` records which tool surfaces are active, including AGENTS.md-compatible tools, GitHub Copilot/VS Code instructions, Cursor project rules, Claude Code subagents, model-selection status, enforcement level, and evidence.

`UPGRADE.md` records the downstream upgrade flow for `agent-kit diff`, `agent-kit update`, framework codemods, Supabase migration review, release notes, audit thresholds, and rollback evidence.

Use `agent-kit audit --json` for machine-readable output in scripts or CI. The output shape is documented by `schemas/audit-report.schema.json` and installed to `.agent-kit/schemas/audit-report.schema.json`.

Audit also validates the default council roster against the runtime contract that mirrors `schemas/agent-roster.schema.json`. Missing roster files, malformed roster shape, missing default agents, missing skill routing, or a core-change workflow without Lead Architect produce audit failures. Missing schema files, incomplete `COUNCIL.md` handoff evidence, or missing model-routing evidence produce warnings so existing installs can upgrade without being blocked.

## AI Mechanisms

The package deliberately separates AI operating mechanisms:

- Instruction files steer behavior in Codex/AGENTS.md-compatible tools, Copilot, Cursor, and Claude Code.
- `.agent-kit/agent-roster.json` provides machine-readable council routing.
- `.agent-kit/skills/` keeps reusable specialist workflows out of one-off prompts.
- `MODEL_ROUTING.md` and `.agent-kit/model-routing.json` map agents to model profiles and record IDE enforcement limits.
- `ASSISTANT_ADAPTERS.md` records active IDEs, model-selection status, tool/MCP setup, and evidence.
- Optional hooks can enforce local policies, but they are not enabled by default because they execute local commands and require trust review.
- CI and release gates enforce the package contract through audit, tests, install smoke, SBOM validation, and package dry run.

If a project stores structured council sessions in `.agent-kit/council-sessions/*.json`, audit validates each record against the runtime contract that mirrors `schemas/council-session.schema.json`.

Audit validates frontend maturity beyond tokens and states. `DESIGN.md` must capture brand, content, user needs, creative direction, reference set, anti-references, distinctiveness, critique guidance, frontend distinctiveness benchmark, frontend product-quality scorecard, and design tokens. `STYLE_GUIDE.md` must require content-first creative direction before implementation. `TESTING.md` must document visual QA or visual-regression evidence for important UI changes.

Audit also validates `QUALITY_GATES.md` as the downstream maturity model. The file must define baseline, strong, and best-practice evidence across council routing, architecture, security, Supabase/RLS, frontend, accessibility, testing, release, and repo health. This keeps research-backed expectations visible after install instead of leaving best-practice judgment in chat history.

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
npm run build
```

## CI

GitHub Actions runs on pushes and pull requests to `main`.

Required gates:

- `npm install --global npm@11.6.2`
- `npm ci`
- `npm run release:check`

`npm run release:check` validates JSON assets, checks package version consistency, typechecks, runs tests, builds, checks committed example output against the current CLI, install-smokes the packed package, runs dependency audit, validates CycloneDX SBOM generation, and performs package dry run. CI and release workflows both use this command so local and remote gates stay aligned.

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

## Delivery Tracking

Use `ROADMAP.md` as the source of truth for phased implementation status and next actions.

## Release Notes

This is an MIT-licensed public package. Before each release, verify package metadata, public docs, research citation policy, dependency audit, and install-smoke evidence.

See `PUBLIC_RELEASE_REVIEW.md` for the public-release readiness checklist.

## Public NPM Release

Publishing targets the public npm registry package `@agent-skills/next-supabase-kit`.

Prerequisites:

- The npm `@agent-skills` scope exists and the publishing account has access.
- npm Trusted Publishing is configured for package `@agent-skills/next-supabase-kit`.
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
8. The workflow validates the GitHub OIDC context, packs the package into a tarball, generates a CycloneDX SBOM, attests the SBOM against the tarball, and publishes that same tarball with `npm publish <tarball> --access public`.
9. The workflow verifies public package installation with `node scripts/post-publish-verify.mjs`, which waits for `npm view`, runs public `npx doctor`, runs `init` in a clean temp project, and requires `audit --json` to report zero failures.

Do not use a bypass-2FA publish token for automation. If npm will not allow Trusted Publishing to be configured before the package exists, bootstrap the first version with a one-time manual OTP publish from a verified local checkout or another npm-approved package-creation path, then use Trusted Publishing for future releases.

Public install verification is separate from publish authentication and does not require an npm token after registry propagation. Maintainers can rerun it with:

```bash
npm run publish:verify
```

Pre-public release evidence:

- CI and release dry-run gates are configured.
- Public package metadata is configured for `@agent-skills/next-supabase-kit`.
- Public release remains blocked until the npm `@agent-skills` scope is created or claimed, Trusted Publishing is configured, and post-publish `npx` verification succeeds.
