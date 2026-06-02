# Developer Docs

## Architecture

The package has four main subsystems:

- CLI commands in `src/cli`
- Install and audit logic in `src/install`
- GitHub research and repo analysis in `src/research`
- Static installable assets in `templates`, `agents`, `skills`, `prompts`, `checklists`, `design-adapters`, `design-briefs`, `profiles`, and `rosters`

The CLI reads bundled assets from the package root so the same commands work in local development and after build.

Package-level research decisions are recorded in `DECISIONS.md`.

## Install Behavior

`agent-kit init --stack next-supabase` installs root markdown docs and copies library assets into `.agent-kit/`.

Existing files are never overwritten by default. Conflicting template updates are written to `.agent-kit/conflicts/`.

The installer writes `.agent-kit/agent-roster.json` from `rosters/next-supabase-default-council.json`. This roster is the default council contract:

- Planner starts planning, roadmap, scope, and ambiguous requests.
- Lead Architect reviews core changes before implementation.
- Security Reviewer joins auth, data mutation, dependency, secret, external-call, and release-risk changes.
- QA Engineer verifies behavior changes.
- Documentation Maintainer keeps living markdown current.

New manifests include `templateHashes` for each root markdown template. `agent-kit audit` uses these hashes to distinguish current templates, stale installed templates, and locally customized docs.

Use `agent-kit audit --json` for machine-readable output in scripts or CI.

Audit also validates the default council roster. Missing roster files, missing default agents, missing skill routing, or a core-change workflow without Lead Architect produce audit failures.

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
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run smoke:install`
- `npm audit --audit-level=moderate`
- `npm pack --dry-run`

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
- The version in `package.json` is unique and follows semantic versioning.

Release process:

1. Update `package.json` version in a normal PR.
2. Let CI pass on `main`.
3. Run the manual `Release` workflow with `dry_run=true` to validate checks without publishing.
4. Create or update a draft GitHub Release named `vX.Y.Z`.
5. Confirm the npm Trusted Publisher settings match the release workflow exactly.
6. Publish the draft GitHub Release, or manually dispatch `Release` with `dry_run=false`.
7. The `Release` workflow runs the same quality gates as CI.
8. The workflow validates the GitHub OIDC context and publishes with `npm publish --access public`.
9. The workflow verifies public package installation with `npx @agent-skills/next-supabase-kit doctor`.

Do not use a bypass-2FA publish token for automation. If npm will not allow Trusted Publishing to be configured before the package exists, bootstrap the first version with a one-time manual OTP publish from a verified local checkout or another npm-approved package-creation path, then use Trusted Publishing for future releases.

Public install verification is separate from publish authentication and does not require an npm token after registry propagation.

Pre-public release evidence:

- CI and release dry-run gates are configured.
- Public package metadata is configured for `@agent-skills/next-supabase-kit`.
- Public release remains blocked until the npm `@agent-skills` scope is created or claimed, Trusted Publishing is configured, and post-publish `npx` verification succeeds.
