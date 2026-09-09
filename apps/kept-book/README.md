# Kept Book

Private household recipes. Write the cards. Print a PDF. Send that file to Gelato when you want a hardcover.

This app lives in `apps/kept-book` so we could dogfood `@appsforgood/next-supabase-kit` without a second GitHub repo (the cloud token cannot create one).

## What exists already (and why we still built this)

| Product | What it is | Why it is not this |
| --- | --- | --- |
| Mixbook | Photo-book designer with cookbook themes | Layout and print first. Not a living household recipe box. |
| ReciScan | Phone app: scan cards, print a book | Mobile capture. Not Next.js + this kit. |
| Heirloom Recipe Box | Private family cookbook, PDF, lineage | Closest cousin. iOS / subscription. Print shop PDF, not Gelato from a Next.js app. |
| Mealie / Tandoor | Self-hosted recipe managers | Meal planning and scraping. Not a book you hand to relatives. |

Kept Book is the kitchen box plus a print PDF. Gelato is the bound copy after a public URL and `GELATO_API_KEY`.

## Run it

```bash
cd apps/kept-book
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000. Open a kitchen, write a card, download the PDF.

```bash
npm test
npm run build
```

Agent pack (already installed here):

```bash
npx --yes @appsforgood/next-supabase-kit@0.4.2 doctor
```

## Data

Today the box is a JSON file (`.data/box.json` locally, `/tmp/kept-book` on Vercel). That is enough to try the kit. It is **not** a family heirloom store.

`supabase/migrations/20260909000000_households.sql` is the real tenancy contract: households, members, recipes, books, RLS, `open_household` / `join_household`. Apply that when you attach a Supabase project. Do not treat the UI as authorization.

`SESSION_SECRET` is required in production. `GELATO_API_KEY` is server-only and optional. The PDF download does not need it.

## Agent kit

This folder was initialized with the kit (`init --activate all`, `doctor` pass). QA of screens still means desktop and mobile screenshots, not a diff.
