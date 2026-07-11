# Quality Gates

This file defines the project maturity model. Use it to decide whether a change is merely working, strong enough for normal delivery, or best-practice ready.

## Maturity Levels

`agent-kit audit --json` reports one readiness verdict:

- `needs-setup`: required install or council contract checks are failing.
- `baseline-setup`: setup is valid, but starter evidence placeholders remain.
- `needs-improvement`: no blocking failures, but warnings remain.
- `best-practice-candidate`: static audit found no failures or warnings.

Use `agent-kit audit --min-readiness <level>` in CI when the project wants a merge or release threshold. New projects usually start at `baseline-setup`; mature projects should move toward `best-practice-candidate`.

### Baseline

Baseline means the project is usable and the agent kit can audit it.

- `AGENTS.md`, `AGENT_ROSTER.md`, `ASSISTANT_ADAPTERS.md`, `COUNCIL.md`, `SPEC.md`, `DECISIONS.md`, `DOCS.md`, `DESIGN.md`, `MESSAGING.md`, `MODEL_ROUTING.md`, `STYLE_GUIDE.md`, `SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, and `UPGRADE.md` exist.
- `.agent-kit/agent-roster.json`, `.agent-kit/model-routing.json`, disabled-by-default `.agent-kit/orchestrator.json`, and `.agent-kit/schemas/` exist.
- `.agent-kit/assistant-adapters/` exists.
- Agent Studio schemas for project context, correction rules, session events, and studio sessions exist when the installed kit version includes them.
- Planner is the default planning route.
- Lead Architect reviews core changes.
- Security Reviewer reviews auth, RLS, dependency, secret, external-call, and release-risk changes.
- Marketing Copy Lead reviews public-facing or conversion-facing copy, positioning, proof, objections, voice, and CTA hierarchy.
- QA evidence is recorded before behavior changes are accepted.
- Antigravity runtime slash commands and `.agent-kit/prompts/lifecycle-command-index.md` are treated as adapter entrypoints; council docs, roster JSON, and Agent Studio session evidence remain canonical.

### Strong

Strong means the project is safe for repeated team or agent delivery.

- Council sessions record workflow, decision, risk, next handoff, required outputs, and evidence.
- `.agent-kit/project-context.json` and `.agent-kit/project-context.md` capture product intent, users, workflows, auth/data assumptions, integrations, design direction, quality target, and open questions.
- Active project and agent corrections are reviewed before implementation and are reflected in future session behavior.
- Agent Studio sessions render current `index.md` and `transcript.md` files after visible decisions, handoffs, artifacts, corrections, or verification change.
- Optional static Studio exports are regenerated from local files after session evidence changes and are checked for secret leakage.
- `ASSISTANT_ADAPTERS.md` records active AI tool surfaces, model-selection status, enforcement level, and verification evidence.
- `MODEL_ROUTING.md` records active model-selection status, dated recommendations, enforcement limits, and known IDE limitations.
- `MESSAGING.md` captures audience, pain, desired outcome, alternatives, differentiator, proof, objections, voice, conversion goal, and copy inventory.
- `SPEC.md` documents affected architecture, behavioral contracts, data model, RLS inventory, and critical workflows.
- `SECURITY.md` covers OWASP Top 10, Supabase RLS, service-role isolation, secrets, IDOR prevention, dependency risk, and external-call risk.
- `DESIGN.md` captures audience, user needs, real content, brand constraints, reference set, anti-references, creative direction, design critique verdict, distinctiveness benchmark, product-quality scorecard, design tokens, and visual QA tier.
- `STYLE_GUIDE.md` defines component patterns, states, responsive behavior, accessibility, and anti-generic AI-site rules.
- `TESTING.md` defines unit, regression, smoke, visual QA, accessibility, and release checks.
- `DEPLOYMENT.md` documents environments, migrations, env vars, observability, rollback, and post-release verification.
- `UPGRADE.md` documents diff/update flow, release notes, migration review, generated types, and rollback evidence.
- When executable orchestration is enabled, `orchestrate validate` passes and provider aliases, credentials, mutation roles, MCP, Docker, limits, and approvals have named owners.

### Best-Practice

Best-practice means evidence can survive handoff, release, and later audit.

- Every meaningful change maps affected layers: data, business logic, presentation, auth, deployment, docs, and tests.
- Multi-agent work has local Agent Studio evidence: context loaded, corrections considered, decisions and handoffs recorded, required outputs tracked, artifacts linked, verification captured, and rendered Markdown current.
- Supabase RLS policies are inventory-backed, least-privilege, and tested for cross-user or cross-tenant access.
- Production readiness covers Next.js routing/rendering, caching, error boundaries, metadata, accessibility, performance, security headers, and Core Web Vitals evidence.
- Frontend work starts from brand/content intake, reference-set review, anti-references, and creative-direction options, then proves first-screen proof, content fingerprint, asset provenance, product-quality scorecard, distinctiveness, desktop, mobile, key states, keyboard flow, and visual QA evidence.
- Public-facing and conversion-facing copy starts from discovery questions, audience, pain, outcome, differentiator, proof, objections, voice/tone, and CTA hierarchy, with unsupported claims marked as assumptions.
- Test evidence includes the smallest useful unit/regression checks plus critical-path smoke coverage.
- Release evidence includes install or production smoke, migration order, dependency audit, package or deployment verification, logs, and rollback notes.
- Repo health includes issue/PR templates, CODEOWNERS, dependency updates, CodeQL or equivalent scanning, dependency review, provenance expectations, support, conduct, and governance.
- Public or shared package releases use Trusted Publishing or equivalent identity-bound release provenance.
- Executable runs have offline plan evidence, explicit approvals, bounded provider/tool outcomes, redacted run events, isolated worktree status, scoped commit review, and a manual merge/remove decision.

## Change Acceptance Matrix

| Change Type | Required Council | Required Evidence |
| --- | --- | --- |
| Planning or roadmap | Planner, Documentation Maintainer | Updated roadmap or checklist with owner, status, and acceptance evidence |
| Core architecture | Planner, Lead Architect, QA, Docs | Affected-layer map, preserved contracts, tests, updated `SPEC.md` or `DECISIONS.md` |
| Supabase/Auth/RLS | Lead Architect, Supabase/Postgres Engineer, Security Reviewer, QA | Migration notes, RLS inventory, negative authorization test, rollback risk |
| Frontend/UI | Frontend Design Lead, QA, Docs | Brand/content intake, reference-set evidence, design critique verdict, distinctiveness benchmark, product-quality scorecard, creative direction, component states, accessibility, desktop/mobile visual QA |
| Marketing/copy | Marketing Copy Lead, Frontend Design Lead, QA, Docs | `MESSAGING.md`, audience and pain, value proposition, proof, objections, voice/tone, CTA hierarchy, risky-claim review |
| Security-sensitive | Security Reviewer, Lead Architect, QA | OWASP review, boundary validation, dependency/secret review, regression or smoke evidence |
| Release/package | Deployment/Observability Engineer, Security Reviewer, QA, Docs | Release gate output, dependency audit, install/deploy smoke, provenance or publish identity evidence |
| Executable orchestration | Planner, Lead Architect, Security Reviewer, QA, Docs, Deployment/Observability Engineer | `orchestrate validate` and plan, provider/MCP policy, approvals, run ID/events, worktree/commit, timeout/cancel behavior, manual integration decision |
| Upgrade/dependency | Planner, Lead Architect, Security Reviewer, QA, Docs, Deployment/Observability Engineer | Release notes, codemods or migration guide, `agent-kit diff`, conflict review, audit output, rollback notes |

## Evidence Rules

- A checklist item is not done until the evidence is linked or named.
- A test is not evidence unless it covers the behavior, risk, or contract being claimed.
- A screenshot is not visual QA unless it covers the important viewport, state, and content.
- A research finding is not a best practice until it is promoted into templates, skills, checklists, audit checks, tests, release gates, or documented decisions.
- A fresh install can be baseline setup while still warning on `TBD`, example rows, or starter instruction text; those placeholders must be replaced before claiming strong or best-practice maturity.
- A local customization is acceptable only when `.agent-kit/overrides.json` explains why and when it was reviewed.
- A human correction is not durable until it is stored in `.agent-kit/corrections/`, remains secret-safe, has a clear scope, and is visible to future agents through installed instructions.
- An upgrade is not complete until `UPGRADE.md` records version changes, migration impact, rollback process, and verification evidence.
- IDE delegation is not executable-runtime evidence. Require `orchestrate status`, versioned run events, checkpoint state, and worktree/commit evidence.
