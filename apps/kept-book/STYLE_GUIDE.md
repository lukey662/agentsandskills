# Style — Kept Book

- Server Components by default. Client only for `useFormStatus`, clipboard, and `error.tsx`.
- Mutations in Server Actions. Validate on the server. Household id from the session, never from the form.
- Routes: `/` door, `/box` index, `/recipes/new`, `/recipes/[id]`, `/book`, `/book/print`, `/book/pdf`.
- CSS variables in `globals.css`. No second palette. No Tailwind color tokens as brand (`zinc`, `blue-600`).
- File names: kebab-case. Types in `src/lib/types.ts`.
