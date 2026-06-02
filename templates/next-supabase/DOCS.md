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
- Sign up, login, logout, and session refresh
- Main user workflow
- Admin workflow
- Data creation and update workflow
- Deployment workflow

## Integration Points

Document external APIs, webhooks, storage buckets, cron jobs, email providers, analytics, and monitoring.

## Troubleshooting

Record known issues, expected logs, and operational checks.
