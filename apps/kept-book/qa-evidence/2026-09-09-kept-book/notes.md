# Kept Book visual QA — 2026-09-09

Opened the running production server at http://127.0.0.1:3000. Desktop 1280×800 and mobile 390×844.

Flow: open kitchen → empty box → sample cards → one recipe → book desk → PDF download (5-page PDF).

- desktop.png / mobile.png — the box with cards (canonical)
- desktop-home.png / mobile-home.png — door
- desktop-box-empty.png — empty box
- desktop-recipe.png — Tuesday beans
- desktop-book.png / mobile-book.png — print desk

PDF saved as book.pdf from the authenticated desktop session (`%PDF-1.3`, 5 pages).

Verdict: accept. The first viewport names the kitchen job. Cards read as a recipe box, not a SaaS dashboard. Nit: on mobile the invite and “Leave kitchen” stack separately under the nav.
