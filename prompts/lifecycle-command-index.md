# Lifecycle Command Index

Use this index for delivery lifecycle slash commands. These are command-like prompts for any assistant surface and the source of truth for native Antigravity runtime commands.

For UI-only workflows, see `.agent-kit/prompts/ui-command-index.md`.

Canonical sources:

- `AGENTS.md`
- `AGENT_ROSTER.md`
- `.agent-kit/agent-roster.json`
- `MODEL_ROUTING.md`
- `.agent-kit/model-routing.json`
- `SPEC.md`
- `QUALITY_GATES.md`
- `TESTING.md`
- `SECURITY.md`
- `COUNCIL.md`
- `.agent-kit/council-sessions/`

## `/setup`

Onboard project context through Agent Office and project-context files.

Required steps:

1. Run or resume `agent-kit setup --open` when the CLI is available.
2. Load `.agent-kit/project-context.json`, `.agent-kit/project-context.md`, and active correction rules.
3. Confirm stack, auth model, deployment target, and maturity target from `QUALITY_GATES.md`.
4. Record gaps as follow-up context questions or correction rules.

Required outputs: context summary, unanswered questions, maturity target, next recommended command.

## `/spec`

Define what to build in `SPEC.md` before implementation.

Required steps:

1. Route through Planner and Documentation Maintainer.
2. Read project context, corrections, and existing `SPEC.md`.
3. Capture goal, user/workflow, acceptance criteria, preserved behavior, non-goals, and docs impact.
4. Name affected layers: data, business logic, presentation, auth, deployment, tests.
5. Record decision and handoff with `agent-kit session ...` when a session is active.

Required outputs: spec delta or draft, acceptance criteria, preserved capabilities, non-goals, verification plan, next handoff.

## `/plan`

Create an implementation-ready plan through Planner and Lead Architect routing.

Required steps:

1. Start with Planner.
2. Name the active workflow and maturity target from `QUALITY_GATES.md`.
3. Map affected layers and preserved behavior.
4. Route core changes through Lead Architect before implementation.
5. Record decision, risk, next handoff, and required outputs with `agent-kit session ...` when available.

Required outputs: goal, affected layers, preserved capabilities, implementation sequence, risks, tests, docs, handoffs, acceptance criteria.

## `/handoff`

Route work explicitly between council agents with recorded evidence.

Required steps:

1. Read `.agent-kit/agent-roster.json` and select the active workflow.
2. State decision, risk, and required next agent from the roster sequence.
3. Mark required outputs as missing, partial, complete, or not applicable.
4. Record the handoff with `agent-kit session handoff` when the CLI is available.

Required outputs: from-agent, to-agent, decision, risk, required outputs status, evidence path.

## `/frontend`

Run the frontend-change workflow with content-first design gates.

Required steps:

1. Complete brand/content intake and creative-direction rationale.
2. Load the matching design brief and `DESIGN.md` / `MESSAGING.md` when public-facing.
3. Require reference-set evidence, distinctiveness benchmark, and product-quality scorecard for significant UI work.
4. Route implementation through Next.js Engineer after design acceptance.
5. Use UI commands from `.agent-kit/prompts/ui-command-index.md` when polishing or auditing.

Required outputs: creative direction, reference evidence, scorecard, UI rationale, visual QA plan, handoffs.

## `/audit`

Run the Agent Kit maturity audit and convert findings into follow-up work.

Required steps:

1. Run `agent-kit audit --json` when the CLI is available.
2. Classify failures before warnings.
3. Map each finding to the responsible council role.
4. Record remediation tasks with `agent-kit session output` when a session is active.

Required outputs: readiness level, failures, warnings, owner/council role, remediation order, verification command.

## `/test`

Add or run tests and produce acceptance evidence.

Required steps:

1. Route through QA Engineer.
2. Read `TESTING.md` and the maturity target from `QUALITY_GATES.md`.
3. Name unit, regression, smoke, and visual QA gaps for the change scope.
4. Run project test commands and capture results.
5. Record verification with `agent-kit session verify` when a session is active.

Required outputs: test plan, commands run, pass/fail summary, coverage gaps, skipped-test rationale.

## `/review`

Run pre-merge code health review before `/ship`.

Required steps:

1. Route through QA Engineer for behavior, regression, and test evidence.
2. Include Security Reviewer when auth, RLS, data mutation, dependency, secret, or external-call boundaries changed.
3. Return findings by severity with concrete remediation.
4. Distinguish this from release GO/NO-GO, which belongs to `/ship`.

Required outputs: reviewed scope, findings by severity, required fixes, security notes when applicable, merge recommendation.

## `/security`

Run OWASP, auth, RLS, dependency, secret, and external-call review.

Required steps:

1. Route through Security Reviewer.
2. Check OWASP Top 10, IDOR, SSRF, injection, broken auth, unsafe output rendering, secret leakage, and vulnerable dependencies.
3. Verify service-role access stays server-only.
4. Record findings with severity, exploit path, affected behavior, and remediation.

Required outputs: reviewed boundaries, findings, severity, exploit path, mitigation, negative authorization tests or skipped rationale.

## `/copy`

Run marketing and conversion copy discovery and review.

Required steps:

1. Route through Marketing Copy Lead.
2. Read or update `MESSAGING.md` for audience, pain, outcome, proof, objections, voice, and CTA.
3. Reject vague SaaS copy, unsupported claims, and interchangeable headlines.
4. Hand off public-facing copy to Frontend Design Lead for layout hierarchy review.

Required outputs: discovery answers, value proposition, proof status, voice/tone, copy inventory, CTA hierarchy, design handoff notes.

## `/ship`

Make a GO/NO-GO release call from council, security, QA, docs, deployment, and rollback evidence.

Required steps:

1. Confirm implementation scope and preserved behavior.
2. Require code review, Security Reviewer signoff, QA/test evidence, accessibility evidence when UI changed, docs evidence, deployment review, and rollback plan.
3. Run the project release gate, normally `npm run release:check` for this package or the project-specific equivalent.
4. Record verification with `agent-kit session verify`.
5. Return GO only when required outputs are complete or explicitly not applicable.

Required outputs: code review, security review, QA/test review, accessibility/doc/deployment checks, rollback plan, release command, GO/NO-GO verdict.

## `/upgrade`

Upgrade Agent Kit, framework, or dependency versions safely.

Required steps:

1. Read `UPGRADE.md` before accepting versioned behavior changes.
2. Run `agent-kit diff` before accepting template changes.
3. Preserve valid local overrides in `.agent-kit/overrides.json`.
4. Record package versions, migration order, rollback notes, verification commands, owner, and date.

Required outputs: upgrade scope, diff summary, conflict risk, migration order, rollback plan, verification commands.
