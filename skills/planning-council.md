# Planning And Agent Council

## Use When

Use for planning requests, roadmap work, ambiguous feature requests, core architecture changes, auth/data changes, release changes, and any task that needs multiple agent roles.

## Required Checks

- Classify the request as planning, core-change, frontend-change, security-review, release, docs, or research.
- Read `.agent-kit/agent-roster.json` and use it as the workflow source of truth when present.
- Use `QUALITY_GATES.md` to name whether the target is baseline, strong, or best-practice.
- Start planning with the Planner agent.
- Route core changes through Lead Architect before implementation.
- Include Security Reviewer for auth, data mutation, external-call, dependency, secret, or deployment-risk changes.
- Include QA Engineer before completion when behavior changes.
- Include Documentation Maintainer when living docs need updates.
- Record meaningful council sessions in `COUNCIL.md` or a structured record matching `.agent-kit/schemas/council-session.schema.json`.

## Output

Name the active workflow, maturity target, council members, handoff order, affected layers, preserved capabilities, required outputs, decision/risk/next-handoff evidence, verification commands, and unresolved risks.
