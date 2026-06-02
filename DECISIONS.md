# Decisions

This file records package-level architectural and research decisions for the agent kit.

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

## 2026-06-02 - Gate Private NPM Publishing Behind Verified Release Checks

### Context

The package is intended to be consumed across multiple projects through a public scoped npm package. Publishing must not happen from normal CI pushes, and first-release validation must prove the workflow can run without long-lived package credentials.

### Decision

Use a dedicated `Release` GitHub Actions workflow. The workflow runs install, typecheck, tests, build, dependency audit, install smoke, and package dry run before publishing. `npm publish --access public` runs only for a published GitHub Release or a manual workflow dispatch with `dry_run=false`.

### Consequences

The release path is repeatable and can be dry-run safely before npm publishing is configured. Actual package publication remains blocked until npm allows the configured release workflow to publish the package.

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

Rename the npm package to `@agent-skills/next-supabase-kit`, publish with public npm access, use the MIT license, and keep public research exposure to generalized summaries, scan methodology, and promoted decisions. Keep detailed per-repo findings out of the public npm package unless separately reviewed.

### Consequences

The package is easier for external projects to adopt and can be installed publicly with `npx`. Maintainers must create or claim the `@agent-skills` npm scope, configure Trusted Publishing for the new package identity, and keep public-readiness tests passing before release.

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
