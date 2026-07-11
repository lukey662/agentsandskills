# Repository Settings

This file records the GitHub settings that must be applied outside git for the repository to operate as a public best-practice package.

## Branch Protection

Protect `main` with:

- Require a pull request before merging.
- Require at least one approval.
- Require review from CODEOWNERS for owned paths.
- Dismiss stale approvals when new commits are pushed.
- Require conversation resolution before merge.
- Require branches to be up to date before merge.
- Require linear history.
- Do not allow force pushes.
- Do not allow deletions.
- Restrict bypasses to maintainers only.

Required status checks:

- `Verify package`
- `Review dependency changes`
- `Analyze JavaScript and TypeScript`
- `Scorecard`

## Release Environment

Create environment `npm-publish` with:

- Required reviewers enabled.
- Prevent self-review enabled where available.
- Deployment branches restricted to `main`.
- No npm package-write token secrets. Automated publication must fail closed when Trusted Publishing is unavailable.
- Required reviewers should protect manual non-dry-run dispatches without preventing the normal version-PR merge path.

Under **Actions > General > Workflow permissions**, allow GitHub Actions to create pull requests. The version workflow has job-scoped `contents: write` and `pull-requests: write` permissions and uses that setting only to open or update the Changesets version PR.

Create this npm Trusted Publisher for each of these package names:

- `@appsforgood/next-supabase-kit`
- `@appsforgood/agent-kit-runtime`

Each trusted publisher must match:

- Provider: GitHub Actions
- Repository: `lukey662/agentsandskills`
- Workflow: `release.yml`
- Environment: `npm-publish`
- Allowed action: `npm publish`

## Security Settings

Enable:

- Private vulnerability reporting.
- GitHub Security Advisories.
- Dependabot alerts.
- Dependabot security updates.
- Code scanning alerts.
- Secret scanning where available.
- Push protection for detected secrets where available.

## Issues, Discussions, And Labels

Enable issues. Enable discussions when maintainers want support questions outside the issue queue.

Create labels from `.github/labels.yml`. Required label families:

- Type: `bug`, `enhancement`, `research`, `documentation`, `security`, `dependencies`
- Area: `area: cli`, `area: agents`, `area: frontend`, `area: supabase`, `area: research`, `area: release`, `area: repo-health`
- Status: `needs-triage`, `blocked`, `good first issue`, `help wanted`
- Risk: `risk: security`, `risk: breaking-change`

## GitHub Pages

Enable GitHub Pages with source "Deploy from a branch", branch `main`, folder `/docs`. The minimal docs site lives at `docs/index.md` with the `jekyll-theme-minimal` theme configured in `docs/_config.yml`. Update `docs/index.md` when the CLI surface, readiness levels, or quick-start commands change.

## Review Cadence

Review these settings before every public release and after any workflow, release, permission, package, or security-policy change.
