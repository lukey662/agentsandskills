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

## Runtime Adapter Rule

### Context

Agent Kit may expose runtime-native command surfaces such as Antigravity plugin commands.

### Decision

Runtime command files are adapters. `AGENTS.md`, `.agent-kit/agent-roster.json`, `QUALITY_GATES.md`, canonical `.agent-kit/skills/`, and Agent Studio session records remain the source of truth.

### Consequences

Native commands improve invocation ergonomics, but project policy, security gates, handoff rules, model routing, and documentation contracts stay centralized in Agent Kit files.

## UI Improvement Harness Rule

### Context

Frontend work needs repeatable audit, polish, screenshot, responsive, accessibility, distinctiveness, and browser QA loops rather than one-off taste review.

### Decision

Use `.agent-kit/prompts/ui-command-index.md`, `.agent-kit/checklists/ui-detectors.md`, `.agent-kit/checklists/ui-acceptance-rubric.md`, and `.agent-kit/skills/ui-improvement-harness.md` as the source of truth for UI improvement commands and detector severity.

### Consequences

Meaningful UI work must classify blocker, major, and minor findings, require desktop and mobile screenshot evidence, and include authenticated or permission-state evidence for protected screens.

## Agent Kit Model Routing

### Context

AI coding tools differ in whether repository files can enforce per-agent model selection.

### Decision

Use `MODEL_ROUTING.md` and `.agent-kit/model-routing.json` as the provider-neutral source for agent model profiles. Record IDE-specific setup and limitations in `ASSISTANT_ADAPTERS.md`.

### Consequences

Exact model names remain dated recommendations, while agents keep stable profile intent and evidence requirements.
