# Governance

## Maintainer Model

This project is maintained as a small public OSS package. Maintainers own release approval, public-package safety, research promotion, and final merge decisions.

## Decision Rules

Changes should improve reusable setup quality for many projects. Project-specific preferences belong downstream unless repeated evidence shows they generalize.

Promoted best practices need at least one of:

- Repeated findings from repository research.
- Dogfood evidence from downstream installs.
- Official framework or platform documentation.
- A clear security, release, or maintainability requirement.

Promotion targets should be explicit:

- Installed root template.
- Agent role.
- Skill.
- Prompt.
- Checklist.
- Schema.
- Audit rule.
- Research scanner signal.
- CI or release gate.

## Release Rules

Releases require:

- Passing CI.
- Passing install smoke.
- Passing dependency audit.
- Passing package dry run.
- Branch protection and repository settings reviewed when workflows, permissions, or release controls changed.
- Public package metadata review.
- No secrets, copied third-party source, or private downstream details.
- Trusted Publishing or another npm-approved secure publish path.

## Research Rules

Research findings are evidence, not implementation. A pattern only becomes kit behavior after it is promoted into an installed asset, CLI/audit behavior, test, release gate, or recorded decision.
