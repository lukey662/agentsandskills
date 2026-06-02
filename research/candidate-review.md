# Candidate Review

Generated on 2026-06-02 from `agent-kit research discover --limit 100`.

## Verdict

The candidate list is ready for the first repository scan.

## Validation Evidence

- Total candidates: 100
- Unique repositories: 100
- Active repositories: 100 pushed on or after 2024-12-01
- Minimum stars: 100
- Missing language/url metadata: 0
- Explicitly excluded repositories present: 0

## Category Coverage

- `official-nextjs`: 15
- `supabase-nextjs`: 15
- `production-saas`: 24
- `design-systems`: 17
- `security-quality`: 13
- `testing-docs-agents`: 16

## Curation Notes

- Discovery now enforces per-category query quotas so early categories cannot consume the full 100-repo budget.
- Discovery keeps curated seed repositories in `research/scan-config.json` so known high-signal projects are included when search queries underfill.
- `appwrite/appwrite` is explicitly excluded because it is an adjacent backend platform rather than a Next.js + Supabase benchmark target.
- Search results are candidates, not accepted best practices. Patterns must still be validated during scan, manual review, and summary promotion.

## Next Step

Run `agent-kit research scan`, then review generated findings before promoting any practice into templates, agents, skills, or checklists.
