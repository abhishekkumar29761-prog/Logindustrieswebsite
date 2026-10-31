# LOG Industries Store

Next.js storefront, Express API, and Supabase database/authentication foundation.

## Services

- `web/`: storefront, customer profile, and admin interface
- `api/`: REST API; validates Supabase Auth access tokens and applies customer/admin role checks
- `api/supabase/migrations/`: schema, RLS policies, order RPC, and initial LOG product catalog

## Configure Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run `api/supabase/migrations/202610030001_initial_store.sql`.
3. Copy `api/.env.example` to `api/.env` and set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Keep the service-role key private; it is server-only and must never use a `NEXT_PUBLIC_` prefix. `CORS_ORIGINS` is a comma-separated list of allowed web origins.
4. Copy `web/.env.local.example` to `web/.env.local`; keep `NEXT_PUBLIC_API_URL=http://localhost:4000` for local development.
5. Set Supabase Auth email-confirmation policy to match your customer signup requirements.
6. Create the first admin in Supabase Auth, then promote that user's profile by running this in the SQL Editor with the real auth user UUID:

```sql
update public.profiles
set role = 'admin'
where id = 'AUTH_USER_UUID';
```

New signups get the `customer` role automatically. Customer-supplied metadata cannot set an admin role.

## Run locally

```bash
cd api
cp .env.example .env
npm install
npm run dev
```

In a second terminal:

```bash
cd web
npm install
npm run dev
```

API health: `http://localhost:4000/health`

## Deploy as two Vercel projects

Create two Vercel projects from this repository: set the API project's Root Directory to `api` and the web project's Root Directory to `web`.

- API project environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `CORS_ORIGINS` (the deployed web origin, with no trailing path). Vercel supplies the runtime port.
- Web project environment variable: `NEXT_PUBLIC_API_URL` set to the deployed API project URL. This value is required at build time; there is no hardcoded localhost fallback.
- For local development, use `NEXT_PUBLIC_API_URL=http://localhost:4000` in `web/.env.local` and allow `http://localhost:3000` in the API's `CORS_ORIGINS`.

The API's `api/index.js` entry exports the Express app for Vercel. `server.js` remains the local Node server entry point.

## API summary

- Public: `GET /api/categories`, `GET /api/products`, `GET /api/products/:slug`
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- Customer (Bearer token): `GET/PATCH /api/account/profile`, `GET/POST /api/account/orders`
- Admin (Bearer token with `admin` role): `GET /api/admin/summary`, `GET/POST /api/admin/products`, `PATCH/DELETE /api/admin/products/:id`, `GET/PATCH /api/admin/orders`

Order checkout currently creates an order with `payment_status=pending`; no payment provider is configured. Shipping is zero until a shipping rule is agreed and configured. The checkout RPC re-reads product prices and stock from Supabase and ignores client-supplied prices.

## Verification

```bash
cd api && npm test
cd web && npm run build
```

Without Supabase values, `/health` works and database-backed routes intentionally return `503`; they do not return fake catalog or order data. Apply the SQL migration to a real Supabase project to enable persistence.
