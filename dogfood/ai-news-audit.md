# AI News Dogfood Audit

Date: 2026-06-02
Project: `/Volumes/Mac eSSD/AI news`
Project type: Content app/admin app hybrid
Package source tested: working tree after `6d703c1`

## Install Command

```bash
node dist/index.js init --stack next-supabase
```

## Install Result

Created:

- `.agent-kit/`

Preserved existing docs and wrote template conflicts:

- `AGENTS.md -> .agent-kit/conflicts/1780393954937-AGENTS.md`
- `SKILLS.md -> .agent-kit/conflicts/1780393954938-SKILLS.md`
- `SPEC.md -> .agent-kit/conflicts/1780393954939-SPEC.md`
- `DECISIONS.md -> .agent-kit/conflicts/1780393954941-DECISIONS.md`
- `DOCS.md -> .agent-kit/conflicts/1780393954942-DOCS.md`
- `STYLE_GUIDE.md -> .agent-kit/conflicts/1780393954942-STYLE_GUIDE.md`
- `SECURITY.md -> .agent-kit/conflicts/1780393954943-SECURITY.md`
- `TESTING.md -> .agent-kit/conflicts/1780393954944-TESTING.md`
- `DEPLOYMENT.md -> .agent-kit/conflicts/1780393954944-DEPLOYMENT.md`

## Audit Command

```bash
node dist/index.js audit --json
```

## Audit Summary

- Pass: 10
- Warn: 12
- Fail: 0

## Gaps Caught

- All existing root docs are locally customized or preserved from before install and need review against `.agent-kit/conflicts/`.
- `STYLE_GUIDE.md` is missing a complete design-token inventory.
- `STYLE_GUIDE.md` is missing required component state coverage.
- `STYLE_GUIDE.md` does not explicitly prevent generic landing-page defaults.

## Kit Improvements Promoted

- Confirmed clearer preserved-doc audit wording works for projects with full existing markdown coverage.
- Confirmed compatibility profiles and design briefs install into `.agent-kit/` without overwriting root docs.

## Follow-Up For Downstream Project

- Review conflict templates and merge only reusable guidance into the existing project-specific docs.
- Use `.agent-kit/profiles/content-app.md` and `.agent-kit/profiles/admin-app.md` for future feature planning.
- Apply `.agent-kit/design-briefs/content-app.md`, `.agent-kit/design-briefs/admin-dashboard.md`, and `.agent-kit/prompts/screenshot-review.md` to public and admin UI work.

## Current Audit Refresh

Date: 2026-06-03
Package source tested: current built `dist/index.js`
Mode: read-only audit; no downstream files were modified.

Command:

```bash
node dist/index.js audit --json
```

Current summary:

- Pass: 11
- Warn: 20
- Fail: 7
- Readiness: `needs-setup`

Current gaps caught:

- Missing `.agent-kit/agent-roster.json`.
- Missing schema-backed contracts in `.agent-kit/schemas/`.
- Missing root docs added after the original dogfood pass: `AGENT_ROSTER.md`, `ASSISTANT_ADAPTERS.md`, `COUNCIL.md`, `DESIGN.md`, `QUALITY_GATES.md`, and `UPGRADE.md`.
- Missing `.agent-kit/assistant-adapters`.
- Existing docs are customized relative to both the original installed template hash and the current package templates.
- `STYLE_GUIDE.md` is missing design-token and component-state coverage.
- `DESIGN.md` is missing content-first and reference-led design critique evidence.
- `TESTING.md` does not define visual QA or visual-regression evidence.

Current kit implication:

- The current audit correctly detects that an older install is no longer baseline setup under the hardened standard.
- The next downstream dogfood pass should run `agent-kit update` on a branch, review conflicts, activate assistant adapters, and apply the reference-led design critique gate to a public or admin UI change with screenshot evidence.
