# Developer Docs

## Setup

Document local setup:

```bash
npm install
npm run dev
```

Add required environment variables in `.env.example`. Never place real secrets in docs.

## Architecture Overview

Document:

- Agent council routing in `.agent-kit/agent-roster.json`
- Assistant activation surfaces in `ASSISTANT_ADAPTERS.md`
- Model profile routing in `MODEL_ROUTING.md` and `.agent-kit/model-routing.json`
- Council-session evidence in `COUNCIL.md`
- Agent, council-session, model-routing, and audit-report schemas in `.agent-kit/schemas/`
- Quality gate maturity model in `QUALITY_GATES.md`
- Upgrade lifecycle in `UPGRADE.md`
- Design identity and content-direction contract in `DESIGN.md`
- Application routes
- Shared components
- Server-only modules
- Supabase client creation
- Auth middleware
- Migrations and seed data
- Test setup

## Key Workflows

Document primary workflows, including:

- Planning and core-change handoffs from `AGENT_ROSTER.md`
- Tool-specific assistant activation from `ASSISTANT_ADAPTERS.md`
- Model-selection setup, enforcement status, and limitations from `MODEL_ROUTING.md`
- Council-session evidence capture from `COUNCIL.md`
- Upgrade review, conflict handling, migration review, and rollback evidence from `UPGRADE.md`
- Baseline, strong, and best-practice evidence review from `QUALITY_GATES.md`
- Brand/content intake and creative-direction selection before frontend implementation
- Reference-led design critique, anti-references, source-safety notes, and distinctiveness verdict from `DESIGN.md`
- Frontend product-quality scorecard from `DESIGN.md`
- Visual QA tier and baseline approval workflow for high-risk UI changes
- Sign up, login, logout, and session refresh
- Main user workflow
- Admin workflow
- Data creation and update workflow
- Deployment workflow

## Integration Points

Document external APIs, webhooks, storage buckets, cron jobs, email providers, analytics, and monitoring.

## Troubleshooting

Record known issues, expected logs, and operational checks.
