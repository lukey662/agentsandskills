# Repository Instructions

This repository uses Agent Kit. Treat `AGENTS.md`, `AGENT_ROSTER.md`, `.agent-kit/agent-roster.json`, `MODEL_ROUTING.md`, `.agent-kit/model-routing.json`, `COUNCIL.md`, and `QUALITY_GATES.md` as the source of truth for agent routing, model profiles, quality gates, and handoff evidence.

## Workflows

- Planning, phased roadmap, or ambiguous work starts with Planner.
- Core changes require Lead Architect before implementation.
- Frontend changes require Frontend Design Lead, brand/content intake, creative-direction rationale, visual QA evidence, state coverage, accessibility checks, and desktop/mobile verification.
- Auth, RLS, data mutations, dependency changes, external calls, secrets, and release risk require Security Reviewer.
- Behavior changes require QA evidence.
- Significant changes require Documentation Maintainer updates.

## Validation

Before proposing completion, run the repo's documented checks. For projects installed from this kit, the minimum setup check is:

```sh
agent-kit audit --min-readiness baseline-setup
```

Use a stronger gate before claiming best-practice readiness:

```sh
agent-kit audit --min-readiness best-practice-candidate
```

Do not claim best-practice readiness while starter placeholders remain in `COUNCIL.md`, `SPEC.md`, `DESIGN.md`, `SECURITY.md`, `TESTING.md`, `DEPLOYMENT.md`, or `ASSISTANT_ADAPTERS.md`.

## Model Selection

Use the active Copilot model selector or organization policy with `MODEL_ROUTING.md`. Repository instructions advise model choice but should not be treated as hard enforcement where Copilot keeps model selection user-controlled.
