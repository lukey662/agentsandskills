# Brand And Content Intake Prompt

Use during Design `setup`, or before designing or changing a user-facing surface.

Scan the repo first. Do not re-ask architecture you can read (`app/` vs `pages/`, Tailwind, shadcn, existing tokens).

Ask once for the smallest useful set:

1. Product name and who it is for.
2. First-screen job — what the user does on the first useful screen.
3. Three personality traits and density (quiet/dense vs marketing/bold).
4. Existing brand (logo, hex, type) vs invent from the domain.
5. Motion: none / hover only / one moment.

Then recommend, before CSS:

1. 4–6 principles (first screen = the work; one field / ink / accent / line; states before decoration; WCAG 2.1 AA; match the stack).
2. A token recipe, or a surgical pass if a design system already exists.
3. Two one-sentence directions and a pick.
4. Anti-references that apply to this product.
5. Missing inputs that still block high-quality design.

Write a short product `DESIGN.md` and append frontend rules to `STYLE_GUIDE.md`. Do not overwrite a mature style guide. Do not paste this kit’s charcoal desk onto the app. Do not write vague value propositions. Use concrete domain language from the product.
