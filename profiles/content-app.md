# Content App Compatibility Profile

Use for publishing systems, editorial workflows, knowledge bases, newsletters, and media apps.

## Required Emphasis

- Content lifecycle, author/editor roles, source attribution, publishing permissions, and moderation.
- RLS policies for drafts, private notes, scheduled content, and editorial-only metadata.
- Empty, unavailable-source, failed-import, scheduled, published, and archived states.
- Smoke tests for content creation, review, publish, rollback, and reader access.

## Agent Handoff

- Architect owns content model, lifecycle, and public/private boundaries.
- Supabase/Postgres engineer owns versioning, indexing, search, and RLS policies.
- Security reviewer owns stored content safety, upload handling, SSRF, and admin boundaries.
- Frontend design lead owns reading rhythm, editorial status, attribution, and mobile presentation.
