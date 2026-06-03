# QRCode Dogfood Audit

Date: 2026-06-02
Project: `/Volumes/Mac eSSD/qrcode`
Project type: SaaS/tool hybrid
Package commit tested: `6d703c1`

## Install Command

```bash
node dist/index.js init --stack next-supabase
```

## Install Result

Created:

- `AGENTS.md`
- `SKILLS.md`
- `SECURITY.md`
- `TESTING.md`
- `DEPLOYMENT.md`
- `.agent-kit/`

Preserved existing docs and wrote template conflicts:

- `SPEC.md -> .agent-kit/conflicts/1780393840334-SPEC.md`
- `DECISIONS.md -> .agent-kit/conflicts/1780393840335-DECISIONS.md`
- `DOCS.md -> .agent-kit/conflicts/1780393840337-DOCS.md`
- `STYLE_GUIDE.md -> .agent-kit/conflicts/1780393840338-STYLE_GUIDE.md`

## Audit Command

```bash
node dist/index.js audit --json
```

## Audit Summary

- Pass: 15
- Warn: 7
- Fail: 0

## Gaps Caught

- Existing `SPEC.md`, `DECISIONS.md`, `DOCS.md`, and `STYLE_GUIDE.md` need review against the generated conflict templates.
- `STYLE_GUIDE.md` is missing a complete design-token inventory.
- `STYLE_GUIDE.md` does not explicitly prevent generic landing-page defaults.
- The homepage contains generic visual/copy signals such as gradient utility classes.

## Kit Improvements Promoted

- Clarified audit wording for pre-existing docs preserved during install.
- Added the downstream dogfood contribution process to `CONTRIBUTING.md`.

## Follow-Up For Downstream Project

- Review `.agent-kit/conflicts/` and merge reusable guidance into existing docs.
- Apply the tool design brief and screenshot review prompt to the homepage and generator surfaces.
- Keep any QRQR-specific copy or design rules in the downstream project unless they generalize.

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
- Existing templates are stale or locally customized relative to the current package.
- `DESIGN.md` is missing content-first and reference-led design critique evidence.
- `TESTING.md` does not define visual QA or visual-regression evidence.
- The homepage still contains generic visual/copy signals that should go through the tool design brief, screenshot review, and design critique gate.

Current kit implication:

- The current audit correctly detects that an older install is no longer baseline setup under the hardened standard.
- The next downstream dogfood pass should run `agent-kit update` on a branch, review conflicts, activate assistant adapters, and apply the reference-led design critique gate to the homepage/generator UI.
