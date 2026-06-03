# Proposed Agent Kit Updates

Generated after the 100-repo scan on 2026-06-02.

## Repeated Evidence

- 88 of 100 findings had weak or non-discoverable Supabase/Auth/RLS signals.
- 66 of 100 findings had immature agent handoff or AI-workflow signals.
- 57 of 100 findings had weak accessibility signals.
- 54 of 100 findings had implicit or incomplete security expectations.
- Stronger repos consistently exposed docs, CI, validation, component systems, test setup, or explicit review workflows.

## Updates Promoted In This Iteration

- Added package-level `DECISIONS.md`.
- Added RLS policy inventory expectations to `templates/next-supabase/SPEC.md` and `SECURITY.md`.
- Added security control inventory expectations to `templates/next-supabase/SECURITY.md`.
- Added design token and component-state inventory expectations to `STYLE_GUIDE.md` and `SPEC.md`.
- Added CI gate expectations to `TESTING.md`.
- Strengthened frontend-design, Supabase/RLS, accessibility, and testing skills/checklists.
- Added machine-readable agent council routing with Planner-first planning and architect-led core-change handoffs.
- Added public-readiness expectations around MIT licensing, neutral package identity, citation policy, and install smoke.
- Added a focused creative-design follow-up pass after recognizing that the original frontend score over-weighted tokens, components, and states.
- Added `DESIGN.md`, content-first design skill, brand/content intake, creative-direction matrix, brand/content checklist, expanded design briefs, and audit coverage for frontend creative-direction evidence.
- Added a visual QA follow-up pass for Storybook, Playwright screenshots, Chromatic, Argos, Loki, visual baselines, and component-state evidence.
- Added Visual Regression QA skill, visual-regression checklist, visual QA plan prompt, `TESTING.md` visual QA tiers, roster routing, audit coverage, and research scanner signals.
- Added a schema-backed council traceability pass after recognizing that the 100-repo research volume was not enough unless practices became enforceable contracts.
- Added `schemas/agent-roster.schema.json`, `schemas/council-session.schema.json`, `COUNCIL.md`, Agent Handoff Tracing skill, agent-council checklist, council-session review prompt, roster routing, audit coverage, and public-readiness tests.
- Added a repo-health follow-up pass for issue templates, PR templates, CODEOWNERS, Dependabot, CodeQL, support, conduct, governance, and public-maintainer workflows.
- Added repo-health files, public-readiness tests, scanner scoring, and a refresh category so public OSS maintainability is treated as release readiness.
- Added a repository-settings follow-up for branch protection, protected publish environment, private vulnerability reporting, required labels, discussions, and security settings that live outside git.
- Added `REPOSITORY_SETTINGS.md`, `.github/labels.yml`, `.github/labeler.yml`, PR labeler workflow, public-readiness tests, and scanner signals.
- Added shared release-readiness command so CI, release, and local checks use the same gate.
- Added a supply-chain follow-up pass for npm Trusted Publishing/provenance, Dependency Review, OpenSSF Scorecard, workflow hardening, and release controls.
- Added `SUPPLY_CHAIN.md`, Dependency Review workflow, Scorecard workflow, workflow concurrency/non-persistent checkout controls, manual publish ref validation, supply-chain scanner scoring, and public-readiness tests.
- Added lockfile-derived CycloneDX SBOM validation and release-workflow SBOM attestation for the exact npm tarball being published.
- Added a maturity-model follow-up pass after recognizing that a broad 100-repo scan still needs a project-level definition of baseline, strong, and best-practice evidence.
- Added `QUALITY_GATES.md`, installed it by default, added audit coverage for multi-area maturity expectations, and added tests that catch hollowed-out quality-gate docs.
- Added project-evidence placeholder audit warnings so a fresh install does not get mistaken for completed best-practice evidence.
- Added machine-readable audit readiness verdicts so downstream projects can distinguish setup failures, baseline setup, remaining warnings, and best-practice candidates.
- Added `agent-kit audit --min-readiness <level>` so projects can enforce baseline or best-practice readiness in CI without parsing JSON themselves.
- Added `schemas/audit-report.schema.json` and runtime contract tests so audit consumers can validate machine-readable output.
- Added an assistant-adapter activation pass after recognizing that a roster is not enough unless downstream tools load or reference it.
- Added `ASSISTANT_ADAPTERS.md`, `assistant-adapters/*`, install support, audit checks, and public-readiness tests for AGENTS.md-compatible tools, GitHub Copilot/VS Code instructions, Cursor rules, and Claude Code subagents.
- Added an upgrade-lifecycle pass after recognizing that reusable kits need safe adoption paths for future template, assistant-adapter, framework, and Supabase changes.
- Added `UPGRADE.md`, `templates/next-supabase/UPGRADE.md`, Upgrade Maintenance skill, upgrade checklist, upgrade-review prompt, roster routing, audit checks, and public-readiness tests.
- Added a reference-led design critique pass after recognizing that frontend work could still pass with generic visual quality if it had tokens, states, and screenshots but no reference-set evidence or distinctiveness verdict.
- Added Reference-Led Design Critique skill, design-critique prompt, design-critique checklist, `DESIGN.md` reference/anti-reference fields, roster routing, audit coverage, and public-readiness tests.
- Added a frontend product-quality rubric pass after recognizing that qualitative critique still needed a repeatable score threshold.
- Added Frontend Product Quality Rubric skill, product-quality checklist, scorecard prompt, `DESIGN.md` scorecard fields, roster routing, audit coverage, and public-readiness tests.
- Added a frontend distinctiveness benchmark pass after recognizing that even a scored UI can still feel interchangeable without first-screen proof, content fingerprint, safe reference learning, asset provenance, state proof, and visual QA proof.
- Added Frontend Distinctiveness Benchmark skill, checklist, benchmark prompt, `DESIGN.md` evidence fields, roster routing, audit coverage, and public-readiness tests.

## Future Updates To Consider

- Re-run dogfood installs after the public package is published.
- Add more stack-specific rosters for non-Supabase stacks.
- Add richer audit severity scoring once more downstream evidence exists.
- Dogfood the visual QA tier guidance on a real frontend project and convert repeated findings into concrete starter examples.
- Dogfood the reference-led design critique gate on a real frontend project and convert repeated weaknesses into stricter examples or audit signals.
- Dogfood the frontend product-quality scorecard on a real frontend project and tune score thresholds from actual review evidence.
- Dogfood the frontend distinctiveness benchmark on a real frontend project and convert repeated weaknesses into stricter examples or audit signals.
- Dogfood assistant adapters in real Codex, Copilot, Cursor, and Claude Code projects and convert repeated activation failures into stricter checks.
- Dogfood the upgrade lifecycle on a real existing install and convert repeated conflict or rollback gaps into stricter checks.
- Add optional CI validation for structured council-session JSON records once downstream projects start storing machine-readable traces.
- Add optional scorecard-style repository health checks once the public repo has enough external contribution activity to tune the signal.
- Add branch/environment protection documentation after the GitHub repository settings are confirmed.
- Compare actual GitHub repository settings against `REPOSITORY_SETTINGS.md` after maintainer credentials are available.

Do not copy source code from scanned repositories. Adopt only generalized practices with clear rationale.
