# Agent Kit for Next.js + Supabase

[![CI](https://github.com/lukey662/agentsandskills/actions/workflows/ci.yml/badge.svg)](https://github.com/lukey662/agentsandskills/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/%40appsforgood%2Fnext-supabase-kit)](https://www.npmjs.com/package/@appsforgood/next-supabase-kit)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/lukey662/agentsandskills/badge)](https://scorecard.dev/viewer/?uri=github.com/lukey662/agentsandskills)
[![CodeQL](https://github.com/lukey662/agentsandskills/actions/workflows/codeql.yml/badge.svg)](https://github.com/lukey662/agentsandskills/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

`@appsforgood/next-supabase-kit` installs versioned agent instructions, specialist roles, reusable skills, project documentation, security checks, UI review gates, and audit tooling into an existing repository.

It is designed for teams using AI coding tools on Next.js and Supabase projects that need the work to remain reviewable, secure, and maintainable.

## Start Here

- [Quick start](#quick-start)
- [First-run examples](#first-run-examples)
- [Audit examples](#audit-examples)
- [Common delivery workflows](#common-delivery-workflows)
- [Updating an existing install](#updating-an-existing-install)
- [Optional executable runtime](#optional-executable-runtime)
- [Installed project contract](#installed-project-contract)
- [Maintainer verification](#maintainer-verification)

## What You Get

- A machine-readable council roster with explicit ownership and handoffs.
- Instructions and adapters for Codex, Cursor, Claude Code, GitHub Copilot, and Antigravity.
- Living `SPEC.md`, `DECISIONS.md`, `DESIGN.md`, `MESSAGING.md`, `SECURITY.md`, `TESTING.md`, and deployment documentation.
- Supabase Auth, RLS, migration, service-role, and OWASP review rules.
- Frontend design gates that reject generic gradients, card soup, fake metrics, vague SaaS copy, inaccessible state styling, and other common AI-generated UI patterns.
- Local project context, durable human corrections, council-session evidence, and static or live Agent Studio views.
- A CLI that detects missing setup, stale templates, unsupported claims, weak evidence, and release-readiness gaps.
- An optional runtime for checkpointed LangGraph execution with provider adapters, MCP policy, approvals, Docker isolation, and Git worktrees.

## Choose A Mode

| Mode | Package | What runs |
| --- | --- | --- |
| Instructions and audits | `@appsforgood/next-supabase-kit` | Your coding assistant follows installed files; the CLI installs, validates, records, and audits evidence |
| Executable council | Add `@appsforgood/agent-kit-runtime` | The CLI compiles the roster into checkpointed workflows with approval gates and isolated worktrees |

The base kit does not call a model provider. Installing instructions does not prove that an executable council ran. Only `agent-kit orchestrate ...` produces runtime checkpoints and run evidence.

## Requirements

- Node.js 20 or newer.
- Git for update, session, and worktree-aware workflows.
- A Next.js + Supabase project is the primary profile, but the documentation and audit model can be adapted to adjacent stacks.
- Docker is required only for mutation commands in the optional executable runtime.

## Quick Start

### Zero-install trial

Run the current package directly in the repository you want to prepare:

```bash
npx --yes @appsforgood/next-supabase-kit@latest init --stack next-supabase --setup --open
npx --yes @appsforgood/next-supabase-kit@latest audit
npx --yes @appsforgood/next-supabase-kit@latest audit --min-readiness baseline-setup
```

The first command installs project-owned documentation and `.agent-kit/` assets, then opens the local Agent Office setup flow. Existing customized files are preserved; changed templates are written to `.agent-kit/conflicts/` for review.

### Local development dependency

Install the CLI when the project will use it repeatedly or in CI:

```bash
npm install --save-dev @appsforgood/next-supabase-kit
npx agent-kit init --stack next-supabase --setup --open
npx agent-kit audit --min-readiness baseline-setup
```

Add convenient package scripts:

```json
{
  "scripts": {
    "agent:audit": "agent-kit audit --min-readiness baseline-setup",
    "agent:setup": "agent-kit setup --open",
    "agent:studio": "agent-kit studio serve --open"
  }
}
```

Then run:

```bash
npm run agent:audit
```

## First-Run Examples

### Preview before writing

```bash
npx agent-kit init --stack next-supabase --guided --dry-run --json
```

### Install without opening a browser

```bash
npx agent-kit init --stack next-supabase --no-setup
npx agent-kit context init
npx agent-kit context ask
```

### Resume project onboarding

```bash
npx agent-kit setup --open
npx agent-kit setup --status
```

The setup server binds to `127.0.0.1:9321` by default:

- `/` or `/office`: Agent Office.
- `/wizard`: form-based fallback.

Use a different port when needed:

```bash
npx agent-kit setup --port 9400 --open
```

### Activate IDE adapters

```bash
npx agent-kit init --activate cursor
npx agent-kit init --activate codex
npx agent-kit init --activate antigravity
npx agent-kit adapter validate all
```

Activation promotes the relevant adapter files. The IDE or coding agent still decides when and how to load them; review `ASSISTANT_ADAPTERS.md` for the exact behavior of each tool.

## Audit Examples

### Human-readable readiness report

```bash
npx agent-kit audit
```

### Stable JSON output

```bash
npx agent-kit audit --json
npx agent-kit audit --schema-version 2 --format json
```

### SARIF for code-scanning systems

```bash
npx agent-kit audit --schema-version 2 --format sarif > agent-kit.sarif
```

### Fail CI below the required evidence level

```bash
npx agent-kit audit --min-readiness baseline-setup
```

Readiness levels are:

1. `needs-setup`
2. `baseline-setup`
3. `needs-improvement`
4. `best-practice-candidate`

Example GitHub Actions job:

```yaml
name: Agent Kit Audit

on:
  pull_request:
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx agent-kit audit --min-readiness baseline-setup
```

The installed template at `.github/workflows/agent-kit-audit.yml` is the maintained starting point.

## Common Delivery Workflows

### Plan and record a feature

```bash
npx agent-kit session start "Add organization invitations" --workflow core-change
npx agent-kit session decision "Keep authorization in Supabase RLS and server-side mutation boundaries."
npx agent-kit session handoff \
  --from planner \
  --to lead-architect \
  --decision "Review the invitation data and auth boundaries." \
  --risk "Invitation tokens and tenant isolation require explicit review."
npx agent-kit session artifact --file SPEC.md
npx agent-kit session verify \
  --command "npm test" \
  --result pass \
  --notes "Invitation unit and regression tests passed."
npx agent-kit session render
npx agent-kit session close --status complete
```

### Record several events at once

```json
{
  "events": [
    {
      "type": "decision",
      "agent": "lead-architect",
      "text": "Use a server action for the mutation and RLS for authorization."
    },
    {
      "type": "artifact",
      "agent": "nextjs-engineer",
      "path": "app/invitations/actions.ts"
    },
    {
      "type": "verification",
      "agent": "qa-engineer",
      "command": "npm test",
      "result": "pass",
      "notes": "Regression suite passed."
    }
  ]
}
```

```bash
npx agent-kit session checkpoint --file .agent-kit/checkpoint.json
npx agent-kit session render
```

### Review a frontend change

Use the installed command instructions as prompt prefixes in compatible coding tools, or as native commands after activating Antigravity:

```text
/frontend Build the account settings workflow.
/ui-audit Review the implementation against the product-quality gates.
/responsive-cleanup Verify 390px, tablet, and desktop layouts.
/accessibility-pass Check keyboard, focus, labels, contrast, and error recovery.
/screenshot-critique Compare desktop and mobile screenshots against DESIGN.md.
```

The UI detector checks include concrete replacements:

| Avoid | Prefer |
| --- | --- |
| Thick colored side rails and gradient borders on cards | Quiet 1px full borders, semantic icons, labels, and subtle state tint |
| Purple/blue gradient heroes and glowing blobs | Product imagery, real workflow screenshots, concrete content, or tokenized neutral surfaces |
| Decorative card grids | Tables, lists, forms, timelines, split panes, and task-specific grouping |
| Invented metrics and placeholder charts | Real data, clearly labelled samples, empty states, or connection prompts |
| "Supercharge your workflow" and similar copy | Specific actions, product nouns, constraints, and supported outcomes |
| Decorative badge or icon walls | Real integrations, security posture, support details, commands, states, and navigation |
| Frosted oversized panels | Normal surfaces, practical density, and clear section boundaries |
| Color-only status | Semantic text, icons, accessible contrast, ARIA state, and recovery actions |

Exceptions for an established brand system should be recorded in `DESIGN.md` or `.agent-kit/overrides.json`.

### Review Supabase auth or RLS work

```text
/plan Add team-scoped document sharing.
/security Review tenant isolation, IDOR risk, service-role use, and RLS coverage.
/test Add cross-tenant read/write denial tests and an authorized happy path.
```

Required evidence should include:

- Migration and rollback implications.
- RLS policies at the data boundary.
- Cross-tenant denial tests.
- Service-role isolation.
- Server-side input validation.
- Explicit failure and empty states.

### Preserve a durable correction

```bash
npx agent-kit correction add --scope project \
  "Use task-first operational layouts; do not add marketing heroes to authenticated tools."
npx agent-kit correction list
npx agent-kit correction apply <correction-id>
```

Applied project and agent corrections are loaded before meaningful work. Use `correction retire <id> --reason "..." ` when a rule no longer applies.

### Inspect sessions in Agent Studio

```bash
npx agent-kit studio export
npx agent-kit studio serve --open
```

- Static export: `.agent-kit/studio/index.html`.
- Live Studio: `http://127.0.0.1:9331` by default.
- Live sessions use local append-only events and Server-Sent Events.

## Updating An Existing Install

Preview template drift before applying an update:

```bash
npx agent-kit diff --json
npx agent-kit update --dry-run --json
npx agent-kit update
npx agent-kit audit --min-readiness baseline-setup
```

Update behavior:

- Pristine installed files are refreshed.
- Project-owned edits are preserved.
- Template changes that collide with local edits are written to `.agent-kit/conflicts/`.
- `--force` is explicit and should be used only after reviewing the diff.
- Accepted deviations belong in `.agent-kit/overrides.json`.

Example conflict review:

```bash
npx agent-kit update --dry-run
git diff -- .agent-kit/manifest.json
git status --short .agent-kit/conflicts
```

## Optional Executable Runtime

Install both packages locally. The runtime package does not provide the `agent-kit` binary by itself.

```bash
npm install --save-dev \
  @appsforgood/next-supabase-kit \
  @appsforgood/agent-kit-runtime
npx agent-kit orchestrate validate
```

Fresh installs include a disabled `.agent-kit/orchestrator.json`. Configure provider model IDs that you have verified for the current provider account. Credentials must be references, not inline secret values.

Minimal configuration example:

```json
{
  "schemaVersion": 1,
  "enabled": true,
  "defaultWorkflow": "planning",
  "defaultAlias": "balanced",
  "providers": {
    "primary": {
      "kind": "openai",
      "credentialRef": "env:OPENAI_API_KEY"
    }
  },
  "modelAliases": {
    "balanced": {
      "requiredCapabilities": ["text", "tools"],
      "maxAttempts": 1,
      "candidates": [
        {
          "provider": "primary",
          "model": "replace-with-a-verified-provider-model-id"
        }
      ]
    }
  }
}
```

Validate and inspect the plan without calling a provider:

```bash
npx agent-kit orchestrate validate
npx agent-kit orchestrate plan "Review the authorization boundary" --workflow planning
```

Start and manage a run:

```bash
npx agent-kit orchestrate run "Implement the approved authorization fix" --workflow core-change
npx agent-kit orchestrate status
npx agent-kit orchestrate approve <run-id>
npx agent-kit orchestrate resume <run-id> --decision approve
npx agent-kit orchestrate export <run-id> --output .agent-kit/runtime-export.md
```

Reject or cancel:

```bash
npx agent-kit orchestrate resume <run-id> --decision reject
npx agent-kit orchestrate cancel <run-id>
```

Probe external adapters explicitly:

```bash
npx agent-kit provider probe
npx agent-kit provider probe primary
npx agent-kit mcp probe project-tools
```

Store a keychain-backed credential through a masked prompt:

```bash
npx agent-kit credential set keychain:team-openai
npx agent-kit credential delete keychain:team-openai
```

### Runtime boundaries

- Mutations occur in an isolated Git worktree.
- Docker mutation containers use a read-only root, dropped capabilities, `no-new-privileges`, resource limits, and no network by default.
- File tools reject traversal, symlink escapes, Git internals, environment files, private keys, package-manager credentials, and runtime evidence paths.
- Network, host execution, worktree writes, and final commits require applicable approval gates.
- One approved scoped commit may be created on `agent-kit/<run-id>`.
- The runtime never merges, pushes, opens a pull request, deploys, or applies a migration automatically.

See [Runtime orchestration scope](RUNTIME_ORCHESTRATION_SCOPE.md) and the [runtime package README](packages/runtime/README.md) for provider, MCP, sandbox, checkpoint, and recovery details.

## Installed Project Contract

Important root documents:

| File | Purpose |
| --- | --- |
| `AGENTS.md` | High-level operating instructions and required handoffs |
| `AGENT_ROSTER.md` | Human-readable specialist ownership |
| `SPEC.md` | Current functional and technical contract |
| `DECISIONS.md` | Architectural decisions and consequences |
| `DESIGN.md` | Brand, content, UI rules, anti-references, and approved exceptions |
| `MESSAGING.md` | Audience, positioning, proof, objections, voice, and CTA rules |
| `QUALITY_GATES.md` | Evidence required for each readiness level |
| `SECURITY.md` | Auth, data, dependency, secret, and threat boundaries |
| `TESTING.md` | Unit, regression, smoke, visual, and release evidence |
| `DEPLOYMENT.md` | Environment, release, rollback, and observability guidance |
| `UPGRADE.md` | Template and dependency upgrade history |

Important `.agent-kit/` assets:

- `agent-roster.json`: workflow, agent, and handoff contract.
- `model-routing.json`: provider-neutral model profiles.
- `project-context.json` and `project-context.md`: current product and architecture context.
- `corrections/`: durable project and agent rules.
- `council-sessions/`: structured decisions, handoffs, outputs, and verification.
- `skills/`, `prompts/`, and `checklists/`: reusable execution and review procedures.
- `assistant-adapters/`: IDE-specific installation guidance.
- `schemas/`: validation contracts for installed evidence.

Inspect an example installation:

- [Example project README](examples/next-supabase-installed/README.md)
- [Example installed tree](examples/next-supabase-installed/tree.txt)
- [Example audit report](examples/next-supabase-installed/audit-output.json)

## Workflow Instruction Index

The kit includes 20 lifecycle and UI instruction adapters.

| Goal | Instruction |
| --- | --- |
| Capture project context | `/setup` |
| Define behavior and constraints | `/spec` |
| Plan implementation and handoffs | `/plan` |
| Record agent ownership changes | `/handoff` |
| Build or review frontend work | `/frontend` |
| Audit kit readiness | `/audit` |
| Add verification evidence | `/test` |
| Review code before merge | `/review` |
| Review auth, data, secrets, and dependencies | `/security` |
| Review public or conversion copy | `/copy` |
| Verify release and rollback evidence | `/ship` |
| Review template or dependency upgrades | `/upgrade` |
| Detect UI quality failures | `/ui-audit` |
| Improve an implemented UI | `/ui-polish` |
| Repair hierarchy and layout | `/layout-cleanup` |
| Verify responsive states | `/responsive-cleanup` |
| Verify WCAG 2.1 AA behavior | `/accessibility-pass` |
| Check product-specific visual identity | `/distinctiveness-pass` |
| Critique screenshot evidence | `/screenshot-critique` |
| Run a browser QA loop | `/browser-qa` |

These are instruction adapters, not proof of execution. Canonical steps live in `.agent-kit/prompts/lifecycle-command-index.md` and `.agent-kit/prompts/ui-command-index.md`.

## Output And Flag Notes

Use command help as the source of truth:

```bash
npx agent-kit --help
npx agent-kit audit --help
npx agent-kit session --help
npx agent-kit orchestrate --help
```

Commands that expose `--json` include `init`, `audit`, `diff`, `update`, `doctor`, adapter/package validation, most session mutations, corrections, orchestrator commands, provider/MCP probes, and Studio export.

Long-running server commands such as `setup` and `studio serve`, interactive credential entry, and maintainer research commands use their documented human output instead.

Commands that support `--dry-run` include `init`, `update`, and `add skill`. Review each command's `--help` output rather than assuming a global flag.

## Security Defaults

The installed contract requires:

- Supabase RLS at the data boundary, not only UI authorization.
- Service-role credentials in trusted server code only.
- Input validation and safe output rendering at every boundary.
- IDOR, SSRF, injection, broken-auth, upload, and misconfiguration review.
- Explicit loading, empty, error, retry, and success states.
- Cross-tenant denial tests for tenant-scoped data.
- Dependency audit and release evidence for dependency changes.
- No secrets, customer data, or private repository evidence in committed session files.

## Maintainer Verification

For development of this repository:

```bash
npm install
npm run build
npm test
npm run release:check
```

`npm run release:check` runs:

- JSON and version consistency checks.
- TypeScript, ESLint, and Prettier checks.
- Unit and regression tests with coverage gates.
- Package build and asset validation.
- IDE adapter and example-install validation.
- Install, Studio, setup, and audit-gate smoke tests.
- Dependency audit.
- CycloneDX SBOM validation.
- Root and runtime package dry runs.

The release workflow uses npm Trusted Publishing through GitHub Actions OIDC, creates package-rooted SBOM attestations, publishes the runtime before the root package when needed, verifies both packages from the public registry, and creates a GitHub release only after registry verification.

Additional evidence:

- [Best-practice evidence map](BEST_PRACTICE_EVIDENCE.md)
- [Supply-chain policy](SUPPLY_CHAIN.md)
- [Maintainer release procedure](MAINTAINER_RELEASE.md)
- [Research citation policy](RESEARCH_CITATION_POLICY.md)
- [Public support policy](SUPPORT.md)

## License

MIT.
