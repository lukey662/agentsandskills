# Brand And Content Intake Prompt

Use during Design `setup`, or before designing or changing a user-facing surface.

Scan the repo first. Do not re-ask architecture you can read (`app/` vs `pages/`, Tailwind, shadcn, existing tokens).

Setup is an interview. Ask what they need, in their language, then follow up if the answer is vague.

1. What are we setting up, and what do you need from this pass — principles, a style guide, a first-screen direction, or all of it?
2. Who has to succeed, and what are they trying to finish?
3. On the first useful screen, what must they be able to do?
4. What is already decided (brand, components, constraints), and what must it not look like?
5. When this works, what is in front of them? When it fails, what did we get wrong?

Do not quiz them on hex, fonts, or motion until the need is clear. Do not open with a 20-question intake.

Then recommend from the answers, before CSS:

1. The need you heard, in one sentence.
2. 4–6 principles that serve that need.
3. A visual direction only if they asked for one (token recipe, or surgical if a system already exists).
4. Anti-references in their words.
5. What you will write vs what can wait.

Write only the files this pass called for (usually a short product `DESIGN.md` and frontend `STYLE_GUIDE.md` rules). Do not overwrite a mature style guide. Do not paste this kit’s charcoal desk onto the app. Do not write vague value propositions. Use concrete domain language from the product.
