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

## Accessibility

- Use semantic HTML first.
- Use ARIA only when semantics are insufficient.
- Keep keyboard navigation predictable.
- Maintain visible focus states.
- Meet WCAG 2.1 AA contrast.
