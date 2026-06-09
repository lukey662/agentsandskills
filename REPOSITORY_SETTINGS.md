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
- Deployment branches restricted to `main` and release events.
- No npm publish token secret for the trusted-publishing flow.
- Any legacy npm token secrets deleted after Trusted Publishing is confirmed.
- Optional fallback: a maintainer npm publish token secret on the `npm-publish` environment when trusted publishing returns 404 on PUT.

The npm trusted publisher must match:

- Package: `@appsforgood/next-supabase-kit`
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

## Issues, Discussions, And Labels

Enable issues. Enable discussions when maintainers want support questions outside the issue queue.

Create labels from `.github/labels.yml`. Required label families:

- Type: `bug`, `enhancement`, `research`, `documentation`, `security`, `dependencies`
- Area: `area: cli`, `area: agents`, `area: frontend`, `area: supabase`, `area: research`, `area: release`, `area: repo-health`
- Status: `needs-triage`, `blocked`, `good first issue`, `help wanted`
- Risk: `risk: security`, `risk: breaking-change`

## Review Cadence

Review these settings before every public release and after any workflow, release, permission, package, or security-policy change.
