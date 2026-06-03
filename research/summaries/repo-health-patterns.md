# Repo Health Patterns

Generated from a focused public OSS repository-health pass.

## Focused Sources Reviewed

- GitHub issue and pull request template documentation: issue forms belong in `.github/ISSUE_TEMPLATE`, and PR templates can live in `.github/pull_request_template.md`.
- GitHub CODEOWNERS documentation: `.github/CODEOWNERS` is the first location GitHub checks and supports automatic owner review requests.
- GitHub Dependabot documentation: `.github/dependabot.yml` configures npm and GitHub Actions update PRs.
- GitHub CodeQL documentation: JavaScript and TypeScript projects can run CodeQL through GitHub Actions.
- GitHub branch protection and environment documentation: required status checks, required reviews, environment reviewers, and deployment branch restrictions are repository settings that must be reviewed outside git.
- GitHub private vulnerability reporting documentation: public repositories can expose private vulnerability reporting through Security Advisories.
- High-signal OSS repos commonly expose structured contribution, security, release, and review workflows rather than relying on maintainer memory.

## Repeated Patterns To Adopt

- Use issue forms to collect enough evidence for maintainers to reproduce bugs and evaluate reusable feature proposals.
- Use a PR template that ties changes to scope, tests, docs, security, and release impact.
- Use CODEOWNERS for review ownership of source, templates, schemas, and workflows.
- Use Dependabot for npm and GitHub Actions updates.
- Use CodeQL or equivalent code scanning for JavaScript/TypeScript repositories.
- Publish support, conduct, and governance docs so contributor expectations are explicit.
- Keep required labels and PR labeler rules in the repo.
- Document branch protection, environment protection, security advisory, private vulnerability reporting, and label setup because those settings are not fully represented by package files.

## Promoted Updates

- Added `.github/ISSUE_TEMPLATE/config.yml`.
- Added bug, feature-request, and research-promotion issue forms.
- Added `.github/pull_request_template.md`.
- Added `.github/CODEOWNERS`.
- Added `.github/dependabot.yml`.
- Added `.github/labels.yml`.
- Added `.github/labeler.yml` and PR labeler workflow.
- Added `.github/workflows/codeql.yml`.
- Added `CODE_OF_CONDUCT.md`, `SUPPORT.md`, and `GOVERNANCE.md`.
- Added `REPOSITORY_SETTINGS.md`.
- Added repo-health public-readiness tests.
- Added repo-health scoring and discovery signals to the research scanner.

Research and repo examples are used only for generalized practices. Do not copy third-party source or project-specific policy wording.
