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

## Research Behavior

`research discover` requires `GITHUB_TOKEN` and writes `research/repo-candidates.json`.

`research scan` shallow clones each candidate, runs static analysis, writes a per-repo markdown finding, and removes clones unless `--keep-clones` is used.

Research evidence is committed:

- `research/repo-candidates.json`
- `research/candidate-review.md`
- `research/findings/*.md`
- `research/summaries/*.md`
- `research/proposed-updates.md`

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

## Private NPM Release

Publishing targets the private npm registry package `@afg/next-supabase-agent-kit`.

Prerequisites:

- The npm `@afg` scope exists and the publishing account has access.
- GitHub secret `NPM_TOKEN` contains a token with publish rights for the `@afg` scope.
- The version in `package.json` is unique and follows semantic versioning.

Release process:

1. Update `package.json` version in a normal PR.
2. Let CI pass on `main`.
3. Run the manual `Release` workflow with `dry_run=true` to validate checks without publishing.
4. Create a GitHub Release named `vX.Y.Z`, or manually dispatch `Release` with `dry_run=false`.
5. The `Release` workflow runs the same quality gates as CI.
6. The workflow publishes with `npm publish --access restricted`.

Verified release evidence:

- CI run `26811402766` passed on commit `87b6b5b`.
- Release dry run `26811449749` passed on commit `87b6b5b`; the publish step was skipped.
