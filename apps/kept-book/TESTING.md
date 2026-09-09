# Testing — Kept Book

- `npm test` — household isolation, invite join, session HMAC, recipe validation.
- `npm run dev` then open `/`, open a kitchen, write a card, `/book/pdf`.
- UI is not done until desktop and mobile screenshots in `qa-evidence/<date>-kept-book/`.

Playwright from the kit repo (optional):

```bash
npx playwright screenshot --viewport-size=1280,800 http://127.0.0.1:3000 qa-evidence/2026-09-09-kept-book/desktop.png
```
