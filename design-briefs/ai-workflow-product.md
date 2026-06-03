# AI Workflow Product Design Brief

Use when designing AI assistants, automation tools, generation workflows, review queues, prompt tools, eval dashboards, agent consoles, or human-in-the-loop products.

## First Screen

Show the real work loop: input, context, model/agent state, output, review, approval, correction, or history. Do not hide the product behind a generic "AI-powered" hero.

## Required Inputs

- User role: operator, reviewer, creator, analyst, developer, admin, or end customer.
- AI workflow: input sources, context, tools, model calls, outputs, approvals, retries, and audit trail.
- Trust needs: citations, uncertainty, permissions, rate limits, cost, privacy, and rollback.
- Human control points: edit, approve, reject, compare, regenerate, escalate, or export.

## Avoid

- Chat box as the only interface when the workflow needs structure.
- Fake model confidence or fake analytics.
- Magical language that hides limitations, costs, or review responsibility.
- Outputs without provenance, status, or recovery path.

## Required States

Queued, streaming, partial output, failed tool call, hallucination report, needs review, approved, rejected, regenerated, rate limited, permission denied, audit trail, mobile review.
