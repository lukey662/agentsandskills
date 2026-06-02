# Repo Finding: microsoft/skills

## Why It Was Selected
- Category: testing-docs-agents
- Stars: 2439
- Last pushed: 2026-06-01T16:25:26Z
- Language: TypeScript
- URL: https://github.com/microsoft/skills
- Score: 26/45

## Score
```json
{
  "architecture": 0,
  "supabaseAuthRls": 1,
  "security": 4,
  "frontendDesign": 3,
  "accessibility": 3,
  "testing": 5,
  "documentation": 4,
  "ciDeployment": 3,
  "agentReadiness": 3
}
```

## Strong Practices
- Security posture is explicit through docs, validation, CI, or review tooling.
- Test setup includes meaningful automated and browser-level coverage.
- Documentation is strong enough for external contributors or agents to onboard.

## Weaknesses / Not Worth Copying Blindly
- Supabase RLS/Auth practices are not clearly discoverable.

## Files Worth Studying
- `.github/plugins/azure-sdk-dotnet/README.md`
- `.github/plugins/azure-sdk-java/README.md`
- `.github/plugins/azure-sdk-python/README.md`
- `.github/plugins/azure-sdk-rust/README.md`
- `.github/plugins/azure-sdk-typescript/README.md`
- `.github/plugins/azure-skills/CHANGELOG.md`
- `.github/plugins/azure-skills/README.md`
- `.github/plugins/azure-skills/skills/azure-deploy/references/recipes/README.md`
- `.github/plugins/azure-skills/skills/azure-deploy/references/recipes/azcli/README.md`
- `.github/plugins/azure-skills/skills/azure-deploy/references/recipes/azd/README.md`
- `.github/plugins/azure-skills/skills/azure-deploy/references/recipes/bicep/README.md`
- `.github/plugins/azure-skills/skills/azure-deploy/references/recipes/cicd/README.md`
- `.github/plugins/azure-skills/skills/azure-deploy/references/recipes/terraform/README.md`
- `.github/plugins/azure-skills/skills/azure-diagnostics/references/app-service/README.md`
- `.github/plugins/azure-skills/skills/azure-diagnostics/references/container-apps/README.md`
- `.github/plugins/azure-skills/skills/azure-diagnostics/references/functions/README.md`
- `.github/plugins/azure-skills/skills/azure-diagnostics/troubleshooting/messaging/README.md`
- `.github/plugins/azure-skills/skills/azure-enterprise-infra-planner/references/constraints/README.md`
- `.github/plugins/azure-skills/skills/azure-enterprise-infra-planner/references/resources/README.md`
- `.github/plugins/azure-skills/skills/azure-prepare/references/recipes/azcli/README.md`
- `.github/plugins/azure-skills/skills/azure-prepare/references/recipes/azd/README.md`
- `.github/plugins/azure-skills/skills/azure-prepare/references/recipes/bicep/README.md`
- `.github/plugins/azure-skills/skills/azure-prepare/references/recipes/terraform/README.md`
- `.github/plugins/azure-skills/skills/azure-prepare/references/services/aks/README.md`
- `.github/plugins/azure-skills/skills/azure-prepare/references/services/app-insights/README.md`
- `.github/plugins/azure-skills/skills/azure-prepare/references/services/app-service/README.md`
- `.github/plugins/azure-skills/skills/azure-prepare/references/services/app-service/templates/recipes/README.md`
- `.github/plugins/azure-skills/skills/azure-prepare/references/services/app-service/templates/recipes/auth/README.md`
- `.github/plugins/azure-skills/skills/azure-prepare/references/services/app-service/templates/recipes/cosmos/README.md`
- `.github/plugins/azure-skills/skills/azure-prepare/references/services/app-service/templates/recipes/redis/README.md`

## Patterns To Adopt
- Prefer explicit docs and checklists over tribal conventions.
- Promote authorization and validation rules into reusable review gates.
- Separate frontend design quality from generic implementation review.

## Impact On Agent Kit
- Use score deltas to decide which templates and skills need stronger language.
- Add repeated high-confidence patterns to checklists, not one-off project quirks.
