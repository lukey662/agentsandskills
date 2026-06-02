# Stack Profile: Next.js And Firebase

Use this profile when adapting the kit to projects using Next.js with Firebase Auth, Firestore, Realtime Database, Storage, Cloud Functions, or Firebase Hosting.

## Replace Supabase-Specific Checks

- Replace Supabase RLS policy review with Firestore/Realtime Database security rules review.
- Replace service-role guidance with Firebase Admin SDK server-only guidance.
- Replace Postgres migration checks with Firebase rules, indexes, emulator fixtures, and data-shape validation.
- Keep OWASP, SSR, secrets, accessibility, testing, deployment, and living-docs requirements.

## Required Evidence

- Firebase security rules are versioned and tested.
- Client SDK usage cannot access admin-only data.
- Admin SDK credentials are server-only and never bundled.
- Emulator or integration tests cover auth, rules, and primary data writes.
- Storage rules cover uploads, reads, ownership, content type, and size.

## Agent Handoff

- Architect owns auth model, tenancy, and data boundaries.
- Firebase engineer owns rules, indexes, emulator tests, functions, and storage.
- Security reviewer owns privilege escalation, IDOR, file uploads, secrets, and dependency exposure.
- Frontend design lead owns task-first UX, states, accessibility, and screenshot review.
