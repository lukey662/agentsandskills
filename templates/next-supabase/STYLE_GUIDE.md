# Style Guide

## Code Style

- Prefer explicit names over clever abbreviations.
- Keep server-only logic in server-only modules.
- Keep UI components focused on rendering and interaction.
- Validate inputs at boundaries before calling business logic.
- Return clear errors; do not silently swallow failures.

## Next.js Patterns

- Use Server Components by default.
- Use Client Components only for browser state, events, effects, or client-only libraries.
- Keep Route Handlers and Server Actions thin.
- Keep user-specific data out of shared caches.

## Supabase Patterns

- Use SSR-safe Supabase clients.
- Enforce ownership and tenancy through RLS.
- Keep service-role access isolated to trusted server code.
- Document every policy assumption.

## Frontend Design Rules

Use `DESIGN.md` before visual implementation. Frontend work should be content-first: audience, user needs, real content, brand constraints, and creative direction must be understood before styling starts.

Do not default to generic AI-site visual patterns:

- No generic purple-blue gradient hero as the default solution.
- No fake metrics or placeholder dashboard cards.
- No vague SaaS copy.
- No oversized rounded card grids unless the domain calls for them.
- No landing page when the user asked for a working app or tool.

Prefer:

- Task-first screens.
- Domain-specific navigation and information hierarchy.
- Real workflow states.
- Reusable design tokens.
- Accessible forms and controls.
- Clear density rules for admin, SaaS, and operational tools.
- Mobile-first responsive layouts.
- Creative direction that is visibly tied to product content and user need.

### Anti-Slop UI Rules

Do not use generic AI-slop treatments as a substitute for product design. If a mature brand system intentionally uses one of these patterns, record the exception and rationale in `DESIGN.md` or `.agent-kit/overrides.json`.

- No accent-border cards. Replace thick, high-contrast, one-sided colored borders, glow rails, neon strokes, and gradient borders on cards, callouts, alerts, panels, or status messages with restrained 1px full-border surfaces, subtle background tint when needed, clear labels, icons, and semantic state text.
- No gradient-as-design. Replace generic purple-blue gradient heroes, gradient text, and gradient blobs with product-specific imagery, workflow screenshots, object-focused media, real content, or a quiet tokenized background.
- No card soup. Replace large grids of decorative cards with task-first layouts: tables, lists, timelines, forms, split panes, dashboards with real hierarchy, or workflow-specific grouped sections.
- No fake dashboard proof. Replace invented metrics, placeholder charts, and claims like "98% faster" with real product data, honest sample labels, empty states, or "connect data to view this" states.
- No vague SaaS sayings. Replace phrases like "supercharge your workflow", "unlock insights", "seamless collaboration", or "AI-powered productivity" with concrete user actions, product nouns, constraints, and outcomes the product actually supports.
- No badge or confetti credibility. Replace decorative badges, pills, stars, awards, or "trusted by" placeholders with real proof, integration names, security posture, support details, or omit the section.
- No oversized rounded glass panels. Replace translucent blur cards, frosted panels, and soft-glow shells with normal surfaces, clear section boundaries, practical density, and brand-appropriate depth.
- No ornamental icon walls. Replace generic floating icons with functional icons attached to commands, states, navigation, feature rows, or concrete workflow steps.
- No layout filler sections. Replace generic "features", "benefits", or "how it works" sections when the user asked for an app or tool with the actual usable workflow as the first screen.
- No inaccessible decorative state styling. Replace color-only alerts, low-contrast tints, and vague status panels with semantic text, icons, ARIA-compatible state, WCAG AA contrast, and recovery actions.

Use `.agent-kit/prompts/brand-content-intake.md` and `.agent-kit/prompts/creative-direction-matrix.md` when inputs are under-specified. Use `.agent-kit/design-briefs/*` before designing SaaS, admin dashboard, marketplace, content app, tool, ecommerce, portfolio/venue, education, community/social, or AI workflow surfaces. Use `.agent-kit/prompts/screenshot-review.md` after implementation to review desktop and mobile screenshots. Use `.agent-kit/prompts/visual-qa-plan.md` when a change needs repeatable visual regression or component-state evidence.

Use `.agent-kit/prompts/design-critique-gate.md` before accepting significant frontend work. `DESIGN.md` should name a reference set, anti-references, source-safety notes, and a distinctiveness verdict so a design cannot pass only because it has tokens, states, and screenshots.

Use `.agent-kit/prompts/frontend-distinctiveness-benchmark.md` before accepting significant frontend work. `DESIGN.md` should prove first-screen specificity, content fingerprint, reference benchmark, asset provenance, state proof, and visual QA proof so a design cannot pass while remaining interchangeable with another product in the same category.

Use `.agent-kit/prompts/frontend-product-quality-scorecard.md` before accepting significant frontend work. `DESIGN.md` should score user/task fit, content specificity, visual identity, information architecture, component states, accessibility and interaction, and source safety. Reject work with critical zeroes or a total score below `10/14`; reserve best-practice claims for `12/14` or higher with desktop/mobile, authenticated screen evidence when applicable, UI detector findings, and visual QA evidence.

Use `.agent-kit/prompts/ui-command-index.md`, `.agent-kit/checklists/ui-detectors.md`, and `.agent-kit/checklists/ui-acceptance-rubric.md` for UI audit, polish, layout cleanup, responsive cleanup, accessibility pass, distinctiveness pass, screenshot critique, and browser QA loops.

## Messaging And Copy Rules

Use `MESSAGING.md` before writing public-facing or conversion-facing copy. Copy should identify the audience, pain, desired outcome, differentiator, proof, objections, voice, and CTA hierarchy before it is accepted.

Prefer:

- Specific product nouns, workflows, constraints, and customer language.
- Claims tied to proof or marked as assumptions.
- One primary CTA with clear secondary actions.
- Useful next steps for onboarding, empty, error, permission, upgrade, and pricing copy.

Reject unsupported superlatives, invented proof, dark patterns, forced urgency, vague AI claims, and risky pricing, privacy, security, compliance, performance, medical, financial, or legal wording.

## Design Token Inventory

Define design tokens instead of ad hoc styling.

| Token Area | Required Decisions |
| --- | --- |
| Color | Semantic colors, contrast, status colors |
| Typography | Font family, scale, weights, line height |
| Spacing | Base unit, dense/admin spacing, section spacing |
| Radius | Component radius defaults and exceptions |
| Motion | Duration, easing, reduced-motion behavior |
| Shadow/Depth | When elevation is allowed |

## Component States

Every interactive component should consider:

- Default
- Hover
- Focus
- Disabled
- Loading
- Empty
- Error
- Success
- Mobile

For reusable components, capture these states as Storybook stories, Playwright screenshot cases, or documented screenshot evidence when the component is visually significant.

## Accessibility

- Use semantic HTML first.
- Use ARIA only when semantics are insufficient.
- Keep keyboard navigation predictable.
- Maintain visible focus states.
- Meet WCAG 2.1 AA contrast.
