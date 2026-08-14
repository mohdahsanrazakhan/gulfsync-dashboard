# GulfSync Dashboard

Unified e-commerce intelligence for Gulf sellers. Manage orders, inventory,
and analytics across Noon, Amazon.ae, and Shopify, with AI-powered insights.

This is a demo/portfolio project built with realistic mock data (85 products,
~4,000 orders spanning 12 months). It is architected and secured as if it were
production-ready.

<!-- ## Screenshots

[Add screenshots after running the app locally] -->

## Tech Stack

- Next.js (App Router) + TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- MongoDB + Mongoose
- NextAuth.js (Credentials provider, JWT sessions)
- OpenAI API (gpt-4o-mini will work on clients project)
- Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local instance or Atlas)
- An OpenAI API key (optional, AI features gracefully degrade without one)

### Installation

```bash
npm install
cp .env.example .env.local   # fill in the values below
npx tsx scripts/seed.ts      # seeds the database with demo data
npm run dev
```

Open https://gulfsync.mohdahsanrazakhan.com and log in with:

```
Email:    demo@gulfsync.com
Password: GulfSync@2026!
```

### Environment Variables

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `NEXTAUTH_SECRET` | Random secret used to sign JWTs (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Base URL of the app, e.g. `http://localhost:3000` |
| `OPENAI_API_KEY` | OpenAI API key, used server-side only |
| `NODE_ENV` | `development` / `production` |
| `SEED_SECRET` | Shared secret required by `POST /api/seed` (dev only) |

## Features

- Multi-channel dashboard (Noon + Amazon + Shopify) with KPI cards, revenue
  trends, channel breakdown, recent orders, top products, and a COD tracker
- Order management with advanced filters, CSV export, and a detail modal
- Inventory sync monitoring with mismatch detection and low-stock alerts
- Comprehensive analytics: revenue, payment/COD, returns, delivery, products
- AI-powered business insights (15 pre-seeded + on-demand generation)
- AI product content generator (English + Arabic, SEO-aware)
- Responsive design across desktop, tablet, and mobile

## Security

- JWT authentication via NextAuth.js (`getAuthenticatedSession()` guards every
  API route), 24h session max age, bcrypt-hashed demo password
- Rate limiting on the login endpoint (5 attempts / 15 minutes / IP)
- Input validation with Zod on every API endpoint (search, pagination, date
  ranges, ObjectIds, AI prompt input)
- Consistent `{ success, data | error, code }` API response envelope — no
  stack traces or internal errors ever reach the client
- Security headers set in `next.config.ts` (CSP, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- OpenAI calls happen server-side only, with `max_tokens` caps, input
  sanitization/length limits, and graceful fallback content if the API fails
- `POST /api/seed` only works outside production and behind an `x-seed-key`
  header matching `SEED_SECRET` — the secret is never sent to the browser
- Environment-based configuration; `.env*` is git-ignored (except
  `.env.example`)

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # login page
│   ├── (dashboard)/           # dashboard, orders, inventory, analytics,
│   │                          # ai-insights, ai-content, settings pages
│   └── api/
│       ├── auth/[...nextauth] # NextAuth route
│       ├── dashboard/stats    # KPI + summary data
│       ├── orders             # orders list + CSV export
│       ├── inventory          # inventory sync data
│       ├── analytics          # revenue/returns/delivery breakdowns
│       ├── ai/                # insights + content generation
│       └── seed                # dev-only demo data seeding
├── components/
│   ├── dashboard/  analytics/  orders/  inventory/  ai/  layout/
│   ├── shared/                 # DataTable, Pagination, EmptyState, etc.
│   ├── providers/               # session, dashboard context, locale
│   └── ui/                      # shadcn/ui primitives
├── hooks/          # useOrders, useInventory, useAnalytics, useFetch, ...
├── lib/            # auth, db, validators, rate-limiter, i18n, openai, utils
├── models/         # Mongoose schemas (User, Order, Product, Inventory, Insight)
├── seed/           # demo data generators + static seed JSON
└── types/          # shared TypeScript types
```
<!-- 
## License

MIT -->
