# Marketplace Compatibility Profile

Use for buyer/seller products, listings, bookings, services, and transaction workflows.

## Required Emphasis

- Role separation for buyer, seller, admin, and support staff.
- Listing ownership, transaction authorization, disputes, fraud controls, and moderation.
- RLS policies for private messages, offers, orders, payments, and seller-only data.
- Smoke tests for search, listing creation, inquiry/order flow, and role-specific access.

## Agent Handoff

- Architect owns role model and transaction lifecycle.
- Supabase/Postgres engineer owns listing, order, message, and policy design.
- Security reviewer owns IDOR, file upload, payment/webhook validation, and abuse paths.
- Frontend design lead owns comparison UX, trust signals, availability states, and mobile search.
