# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npm test           # Jest (mocks Square + Resend — safe to run without credentials)
npm run test:coverage
```

Tests live in `__tests__/`. Run a single test file: `npm test -- payment.test.ts`

## Architecture

**Next.js 16 App Router** deployed on **Netlify** via `@netlify/plugin-nextjs`. TailwindCSS 4, TypeScript 5, React 19.

### Route layout

```
app/
  page.tsx                  # Home (hero, activities)
  layout.tsx                # Root — wraps all pages with CartProvider + ThemeProvider
  admin/
    layout.tsx              # Calls requireAuth() — gates all /admin/* routes
    bookings/               # View + cancel/refund pavilion reservations
    pricing/                # Override pavilion prices via pavilion_configs table
    schedule/               # Edit operating hours
    products/               # Manage store products
  admin-login/page.tsx      # Login form — intentionally outside /admin/ layout
  playground/               # Public pavilion map + booking UI
  checkout/                 # Cart checkout (park entry tickets)
  api/
    reservation/route.ts    # POST: validate → availability check → charge Square → write DB → email
    availability/route.ts   # GET: return conflicting time slots for a pavilion+date
    payment/route.ts        # POST: charge Square for menu/ticket orders → email
    admin/bookings/         # GET list, POST manual booking, PATCH status
    admin/pavilions/        # GET + PATCH pricing/active status
    admin/login/route.ts    # Password check → set session cookie
```

### Data flow for a pavilion booking

1. `ReservationModal.tsx` renders on the public playground page — loads Square Web Payments SDK via `<Script>` CDN tag
2. On submit → `POST /api/reservation`: server re-validates date (min: May 16 2026, max: 6 months), validates time + day-of-week against `pavilion.schedule`, recomputes total server-side from `pavilion_configs` (with `dayPricing` overrides for Mon–Wed free days), checks availability, charges Square, inserts into `pavilion_bookings`, sends emails via Resend
3. **Race condition**: availability is checked server-side immediately before the Square charge to prevent double-booking
4. **If the DB write fails after a successful charge** — the API still returns success and logs the error. Manual reconciliation needed.

### Data flow for ticket/product checkout

1. Cart state lives in `CartContext` (client-only, resets on reload)
2. `checkout/page.tsx` → `POST /api/payment` → Square charge → QR code email

## Database (Supabase)

Schema at `supabase/schema.sql`. Two clients:
- `createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)` — read-only, RLS enforced (use in client components)
- `getSupabaseAdmin()` — service role, full access (use only in API routes)

Key tables:

| Table | Purpose |
|---|---|
| `pavilion_bookings` | Every reservation — `status` ∈ confirmed/cancelled/refunded, `square_payment_id` stored |
| `pavilion_configs` | Admin price/active overrides keyed by `pavilion_id` |
| `products` | Store items with `is_active` toggle |

Static pavilion definitions (names, capacities, map positions, default pricing) live in `data/pavilions.ts` — `pavilion_configs` overrides prices at runtime. Always merge both.

## Admin Auth

`lib/adminAuth.ts` — password-only, no OAuth.

- **Login**: `POST /api/admin/login` checks `ADMIN_PASSWORD` env var, sets `admin_session` HTTP-only cookie = `SHA256(password + ":" + NEXTAUTH_SECRET)`
- **Guard**: `requireAuth()` validates the cookie — called at the top of `app/admin/layout.tsx` and in every admin API GET handler
- **`/api/admin/bookings/[id]` PATCH is unauthenticated** — intended for simple status updates but should be hardened if the admin panel is ever public-facing

## Payments (Square)

Square Web Payments SDK is loaded via CDN in `ReservationModal.tsx` and `checkout/page.tsx`. Requires **HTTPS** in production — the card form will silently fail on HTTP.

- Charges: `POST https://connect.squareup.com/v2/payments` with a UUID idempotency key
- **Refunds are NOT automated** — the "Refund" button in admin only sets `status = 'refunded'` in the DB. Actual money return requires a manual refund through the Square dashboard using the stored `square_payment_id`.
- `square_catalog_object_id` fields exist in the products table for future Square Catalog API integration — not currently used.

## Email (Resend)

`lib/resend.ts` + `lib/emailTemplates.ts`. All templates are plain HTML with inline styles — no external CSS dependencies.

Two emails sent per booking: one to the customer (`RESEND_FROM_EMAIL`), one to staff (`RESEND_NOTIFY_EMAIL`). Failures are non-fatal (logged only).

## Static data

- `data/pavilions.ts` — 6 pavilions with `x`/`y` map positions (%), default pricing, schedule, features. These IDs are the source of truth — DB records reference them as foreign keys.
- `data/products.ts` — Store products. `data/events.ts` — Event listings (not yet wired to a live UI).

## Environment variables

```
# Square (all required)
NEXT_PUBLIC_SQUARE_APP_ID
NEXT_PUBLIC_SQUARE_LOCATION_ID
NEXT_PUBLIC_SQUARE_ENV          # "production" or "sandbox"
SQUARE_ACCESS_TOKEN             # Server-only, never expose to client

# Supabase (all required)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY       # Server-only

# Email (all required)
RESEND_API_KEY
RESEND_FROM_EMAIL
RESEND_NOTIFY_EMAIL

# Auth (all required)
NEXTAUTH_SECRET                 # Salt for session token — generate: openssl rand -hex 32
ADMIN_PASSWORD                  # Plain-text admin password

# Unused / future
NEXTAUTH_URL
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / ADMIN_EMAIL
```

## Deployment

Netlify via `@netlify/plugin-nextjs`. Config in `netlify.toml` at project root. The `.netlify/` directory is Netlify CLI local state — do not edit it.

Square Web Payments SDK **requires HTTPS**. If the Netlify site shows certificate errors or the payment form fails to load, check:
1. Netlify dashboard → Domain management → SSL/TLS certificate — verify it is provisioned and not expired
2. "Force HTTPS" toggle must be enabled in Netlify domain settings
3. Custom domain DNS must point to Netlify before the cert can auto-provision
