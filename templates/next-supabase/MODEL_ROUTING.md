# Model Routing

Use this file to choose the right model profile for each agent and to record how the active AI coding tools apply those choices.

Canonical source of truth:

- `.agent-kit/model-routing.json`
- `.agent-kit/schemas/model-routing.schema.json`
- `.agent-kit/agent-roster.json`
- `ASSISTANT_ADAPTERS.md`

## Policy

- Keep role behavior in `AGENTS.md`, `AGENT_ROSTER.md`, and `.agent-kit/agent-roster.json`.
- Keep reusable skills in `SKILLS.md` and `.agent-kit/skills/`.
- Keep model choice as a dated, reviewable routing layer.
- Do not store secrets, API keys, billing notes, private model entitlement details, or workspace-only vendor terms in this file.
- If an IDE cannot enforce per-agent model choice, document the limitation honestly and use the closest manual or advisory setup.

## Agent Profiles

| Agent | Default profile | Effort | Escalate when |
| --- | --- | --- | --- |
| Planner | `balanced-reasoning` | Medium | Scope affects architecture, auth, data, release, or package behavior. |
| Lead Architect | `deep-reasoning-large-context` | High | Always for core-change council review. |
| Supabase/Postgres Engineer | `deep-reasoning-large-context` | High | Schema, RLS, migration order, rollback, or authorization impact exists. |
| Next.js Engineer | `coding-large-context` | Medium | Server/client boundary, caching, auth, or mutation behavior is uncertain. |
| Frontend Design Lead | `creative-vision-large-context` | High | Significant UI, screenshots, references, content strategy, or visual QA is involved. |
| Marketing Copy Lead | `creative-vision-large-context` | High | Positioning, value proposition, conversion copy, voice/tone, proof review, or public-facing copy handoff is involved. |
| Security Reviewer | `deep-reasoning-large-context` | High | OWASP, IDOR, SSRF, injection, broken auth, dependency, secret, or release risk exists. |
| QA Engineer | `balanced-reasoning` | Medium | Flaky tests, concurrency, auth flows, visual regression, or hard-to-reproduce bugs exist. |
| Documentation Maintainer | `fast-targeted` | Low | Docs encode architecture, migrations, security, or release decisions. |
| Deployment/Observability Engineer | `fast-targeted` | Low | Production release, rollback, env vars, logs, or incident review is involved. |

## Tool Setup

| Tool | Instruction surface | Model-selection status | Enforcement | Evidence |
| --- | --- | --- | --- | --- |
| Codex | `AGENTS.md`, `.codex/config.toml`, optional `.codex/agents/*.toml` | Unverified | Partial | Record date, owner, command/session, and active model settings. |
| Claude Code | `CLAUDE.md`, `.claude/agents/*.md` | Unverified | Partial | Record date, owner, subagent files, and model frontmatter behavior. |
| Cursor | `.cursor/rules/*.mdc` | Unverified | Advisory | Record date, owner, model picker/team setting, and loaded rule evidence. |
| GitHub Copilot | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` | Unverified | Advisory | Record date, owner, selected chat/coding-agent model, and loaded instruction evidence. |

## June 2026 Commented Recommendations

These are setup comments, not permanent guarantees. Verify against the active IDE and provider docs before enabling.

### Codex

```toml
# ~/.codex/config.toml or trusted project .codex/config.toml
# June 2026 Agent Kit suggestion:
# model = "gpt-5.5"
# model_reasoning_effort = "medium"
#
# For custom Codex agents, pin only where the role needs it:
# model = "gpt-5.5"
# model_reasoning_effort = "high"
```

### Claude Code

```md
---
name: lead-architect
description: Use for architecture, cross-layer changes, and core-change council review.
# June 2026 Agent Kit suggestion:
# model: opus
# effort: high
---
```

### Cursor

```mdc
---
description: Agent Kit model-selection reminder.
alwaysApply: true
---

<!--
June 2026 Agent Kit suggestion:
- Use the model picker or team model policy for the active task.
- Prefer a deep reasoning model for Lead Architect, Security Reviewer, and Supabase/Postgres Engineer.
- Prefer a fast/balanced coding model for Docs, Deployment, and low-risk QA passes.
- Cursor rules advise model choice; they should not be treated as hard enforcement.
-->
```

### GitHub Copilot

```md
<!--
June 2026 Agent Kit suggestion:
- Select the strongest available model for architecture, security, RLS, and release-risk review.
- Use a faster model for docs-only or low-risk mechanical changes.
- Repository instructions advise model choice; Copilot model selection remains tool/user controlled.
-->
```

## Acceptance Evidence

Before claiming strong or best-practice maturity, record:

- Active IDE/tool and version or environment.
- Model picker or config location.
- Which agent profiles are enforced, partial, advisory, or manual.
- Screenshot, command, session transcript, or PR evidence that instructions loaded.
- Date and owner of the verification.
