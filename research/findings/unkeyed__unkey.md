# Repo Finding: unkeyed/unkey

## Why It Was Selected
- Category: security-quality
- Stars: 5323
- Last pushed: 2026-06-02T09:08:47Z
- Language: TypeScript
- URL: https://github.com/unkeyed/unkey
- Score: 27/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 4,
  "frontendDesign": 4,
  "accessibility": 3,
  "testing": 3,
  "documentation": 5,
  "ciDeployment": 3,
  "agentReadiness": 4
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Frontend implementation shows reusable components, states, and design-system signals.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.github/CONTRIBUTING.md`
- `.github/workflows/pullfrog.yml`
- `.github/workflows/release.yaml`
- `AGENTS.md`
- `CLAUDE.md`
- `README.md`
- `benchmarks/README.md`
- `cmd/dev/github/README.md`
- `pkg/clickhouse/README.md`
- `pkg/db/plugins/bulk-insert/README.md`
- `pkg/zen/README.md`
- `svc/api/integration/README.md`
- `svc/api/openapi/README.md`
- `svc/heimdall/internal/network/bpf/README.md`
- `svc/kitchensink/README.md`
- `web/apps/dashboard/README.md`
- `web/apps/dashboard/app/(app)/[workspaceSlug]/settings/root-keys/components/dialog/README.md`
- `web/apps/dashboard/lib/auth/__mocks__/README.md`
- `web/apps/dashboard/package.json`
- `web/apps/design/package.json`
- `web/apps/portal/package.json`
- `web/internal/billing/package.json`
- `web/internal/clickhouse/package.json`
- `web/internal/db/package.json`
- `web/internal/encoding/package.json`
- `web/internal/encryption/package.json`
- `web/internal/error/CHANGELOG.md`
- `web/internal/error/package.json`
- `web/internal/events/package.json`
- `web/internal/hash/package.json`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
