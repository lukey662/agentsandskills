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

The package is intended to be consumed across multiple projects through a private scoped npm package. Publishing must not happen from normal CI pushes, and first-release validation must prove the workflow can run without requiring package credentials.

### Decision

Use a dedicated `Release` GitHub Actions workflow. The workflow runs install, typecheck, tests, build, dependency audit, and package dry run before publishing. `npm publish --access restricted` runs only for a published GitHub Release or a manual workflow dispatch with `dry_run=false`.

### Consequences

The release path is repeatable and can be dry-run safely before `NPM_TOKEN` is configured. Actual package publication remains blocked until the GitHub secret contains an npm token with publish rights for the `@afg` scope.

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
