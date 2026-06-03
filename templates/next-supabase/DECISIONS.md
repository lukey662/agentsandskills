# Decisions

Record architectural, technical, security, release, and design-direction decisions here.

## Template

```md
## YYYY-MM-DD - Decision Title

### Context

What problem, constraint, or tradeoff forced this decision?

### Decision

What did we choose?

### Consequences

What becomes easier, harder, safer, or riskier because of this decision?

### Follow-Up

What should be revisited later?
```

## Active Decisions

Add new decisions above this line or keep newest first.

Record major frontend choices here when a creative direction, reference set, anti-reference, brand constraint, information architecture, visual QA tier, or component-system rule materially affects implementation.

## Agent Kit Model Routing

### Context

AI coding tools differ in whether repository files can enforce per-agent model selection.

### Decision

Use `MODEL_ROUTING.md` and `.agent-kit/model-routing.json` as the provider-neutral source for agent model profiles. Record IDE-specific setup and limitations in `ASSISTANT_ADAPTERS.md`.

### Consequences

Exact model names remain dated recommendations, while agents keep stable profile intent and evidence requirements.
