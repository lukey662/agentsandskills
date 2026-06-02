# Developer Docs

## Architecture

The package has four main subsystems:

- CLI commands in `src/cli`
- Install and audit logic in `src/install`
- GitHub research and repo analysis in `src/research`
- Static installable assets in `templates`, `agents`, `skills`, `prompts`, `checklists`, `design-adapters`, `design-briefs`, and `profiles`

The CLI reads bundled assets from the package root so the same commands work in local development and after build.

Package-level research decisions are recorded in `DECISIONS.md`.

## Install Behavior

`agent-kit init --stack next-supabase` installs root markdown docs and copies library assets into `.agent-kit/`.

Existing files are never overwritten by default. Conflicting template updates are written to `.agent-kit/conflicts/`.

New manifests include `templateHashes` for each root markdown template. `agent-kit audit` uses these hashes to distinguish current templates, stale installed templates, and locally customized docs.

Use `agent-kit audit --json` for machine-readable output in scripts or CI.

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
- `npm audit --audit-level=moderate`
- `npm pack --dry-run`

## Delivery Tracking

Use `ROADMAP.md` as the source of truth for phased implementation status and next actions.

## Release Notes

This is a private package. Before external release, replace the private license, remove internal assumptions, and review all prompts for proprietary content.

See `PUBLIC_RELEASE_REVIEW.md` for the current public-release decision and readiness checklist.

## Private NPM Release

Publishing targets the private npm registry package `@afg/next-supabase-agent-kit`.

Prerequisites:

- The npm `@afg` scope exists and the publishing account has access.
- npm Trusted Publishing is configured for package `@afg/next-supabase-agent-kit`.
- Trusted publisher settings:
  - Provider: GitHub Actions
  - Organization or user: `lukey662`
  - Repository: `agentsandskills`
  - Workflow filename: `release.yml`
  - Environment name: `npm-publish`
  - Allowed action: `npm publish`
- Optional GitHub secret `NPM_READ_TOKEN` contains a read-only npm token for post-publish private-package install verification.
- The version in `package.json` is unique and follows semantic versioning.

Release process:

1. Update `package.json` version in a normal PR.
2. Let CI pass on `main`.
3. Run the manual `Release` workflow with `dry_run=true` to validate checks without publishing.
4. Create or update a draft GitHub Release named `vX.Y.Z`.
5. Confirm the npm Trusted Publisher settings match the release workflow exactly.
6. Publish the draft GitHub Release, or manually dispatch `Release` with `dry_run=false`.
7. The `Release` workflow runs the same quality gates as CI.
8. The workflow validates the GitHub OIDC context and publishes with `npm publish --access restricted`.

Do not use a bypass-2FA publish token for automation. If npm will not allow Trusted Publishing to be configured before the package exists, bootstrap the first version with a one-time manual OTP publish from a verified local checkout or another npm-approved package-creation path, then use Trusted Publishing for future releases.

Private install verification is separate from publish authentication. If `NPM_READ_TOKEN` is absent, the workflow publishes and skips the `npx` verification step with an explicit log message.

Verified release evidence:

- CI run `26816316447` passed on commit `586924c`.
- GitHub Release `v0.1.0` is published.
- Release run `26816448475` reached `npm publish` and failed with npm `E403` because the npm token requires 2FA bypass for CI publishing.
- The release workflow now uses Trusted Publishing instead of publish-token authentication.
