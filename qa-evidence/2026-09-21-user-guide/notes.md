route: http://127.0.0.1:8780/USER_GUIDE.html
auth: none (static guide)
viewports: desktop 1280×800, mobile 390×844

what the screenshots show:
- Desktop: deep slate operations board (#0b0f19) with elevated surface cards (#161f32), sticky 2-column sidebar navigation, specialist roster card, and vibrant semantic role badges (Planner violet, App engineer blue, Security amber, Design rose, QA emerald, Copy sky). First viewport displays the title, human lead narrative, fail-closed golden banner, and Start panel with init command.
- New Feature Stepper: 6 visual step cards with step number badges, role pills, PM explanation of each specialist's role, and syntax-styled prompt wells with copy buttons.
- Mobile (390px): responsive stacked cards with horizontal touch-scroll navigation and end-fade gradient mask. All text wraps cleanly with zero horizontal document overflow.
- Interactive: copy buttons provide tactile instant "Copied" feedback in emerald green. Focus ring is 3px solid #f59e0b with clear visibility.

console: none
same-origin: none

keyboard: tab-order pass; focus-visible pass; trap none
contrast: measured (all text >= 7.5:1; badges and UI borders >= 3:1)
clipping: document scrollWidth equals viewport at both sizes.

commands:
- npx vitest run tests/public-readiness.test.ts tests/qa-screenshot.test.ts tests/payloads.test.ts tests/deslop.test.ts tests/domain-skills.test.ts  # all passed
- PLAYWRIGHT_BROWSERS_PATH=/Users/lukeyates/Library/Caches/ms-playwright npm run smoke:ui-screens  # passed
- npm run release:check  # passed (all 104 tests, coverage, pack 111 files)

verdict: accept
