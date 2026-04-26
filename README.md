# PoolSignal

A **Solana SOL/USDC pool scanner** built with Next.js 15.

PoolSignal aggregates SOL/USDC liquidity pools across **Raydium**, **Orca**,
**Jupiter**, **Birdeye** and **DexScreener**, scores them with a single
**Opportunity Score**, and surfaces watchlists, alerts and a per-pool
analytics view with charts and an AI-style insight panel.

> This MVP is **scanner & analytics only** — there is no auto-trading.

---

## Stack

- [Next.js 15](https://nextjs.org/) (App Router, server actions, route handlers)
- TypeScript
- Tailwind CSS v4 + shadcn/ui-style component primitives (dark theme)
- Prisma ORM + PostgreSQL
- Recharts for liquidity / volume time-series charts
- Lucide React icons, `class-variance-authority`, `tailwind-merge`, `zod`

---

## Features

1. **Dashboard** of SOL/USDC pools across all DEXes with sortable columns:
   DEX, pool address, TVL, 24h volume, APR, price, spread, slippage estimate
   for a 1k swap, risk score and the composite Opportunity Score.
2. **Pool detail page** with:
   - 48h liquidity (TVL) and volume area charts (Recharts)
   - Recent swaps table
   - Opportunity-score breakdown
   - **AI insight panel** (heuristic v1 — easily swappable for an LLM)
3. **Watchlist** (client-side via `localStorage`, plus a Prisma-backed
   `/api/watchlist` route ready for a real auth user).
4. **Alerts** for liquidity changes (±10%), 2× volume spikes and
   sub-5 bps spread opportunities. Default rules in `src/lib/alerts.ts`.
5. **Service layer** for Raydium, Orca, Jupiter, Birdeye and DexScreener
   with consistent normalization.
6. **Mock data fallback** — every service falls back to deterministic mock
   data when the upstream API is unreachable or an API key is missing,
   and `POOLSIGNAL_MOCK=1` forces full mock mode.
7. **Prisma models**: `User`, `Dex`, `Pool`, `PoolSnapshot`, `Alert`,
   `Watchlist`, `AiInsight`.
8. **Opportunity Score** that blends liquidity, volume, APR, spread,
   slippage and risk into a single 0–100 number (see `src/lib/scoring.ts`).
9. Clean SaaS-style UI with a dark theme.

---

## Project layout

```
prisma/
  schema.prisma       # Models: User, Dex, Pool, PoolSnapshot, Alert, Watchlist, AiInsight
  seed.ts             # Seed demo user, DEXes, pools, snapshots, watchlist, alerts
src/
  app/
    page.tsx          # Dashboard
    pools/[id]/       # Pool detail page (charts, swaps, AI insight)
    watchlist/        # Watchlist page (localStorage)
    alerts/           # Alerts page (live preview)
    api/
      pools/          # GET all pools / GET one pool
      watchlist/      # GET / POST / DELETE Prisma-backed watchlist
      alerts/         # GET triggered + POST persisted alerts
      insights/[id]/  # GET AI insight for a pool
  lib/
    services/         # raydium / orca / jupiter / birdeye / dexscreener + index aggregator
    mock-data.ts      # Deterministic SOL/USDC mock pools, history, swaps
    scoring.ts        # Opportunity Score
    ai-insight.ts     # Heuristic AI-style insight generator
    alerts.ts         # Alert rule evaluator
    types.ts          # Shared types (NormalizedPool, …)
    db.ts             # Prisma client singleton
    utils.ts          # cn(), formatters, risk classifier
  components/
    ui/               # button, card, badge, table, input, separator
    dashboard/        # stat-cards, pool-table
    pool/             # history-chart, recent-swaps, ai-insight-panel
    layout/           # site-header
    watchlist-button.tsx
```

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

| Variable           | Required | Purpose                                                           |
| ------------------ | -------- | ----------------------------------------------------------------- |
| `DATABASE_URL`     | yes      | Postgres connection string used by Prisma.                        |
| `POOLSIGNAL_MOCK`  | no       | Set to `"1"` to skip all live calls and use mock data only.       |
| `BIRDEYE_API_KEY`  | no       | If unset, the Birdeye service falls back to mock data.            |

Raydium, Orca, Jupiter and DexScreener do not require API keys.

### 3. Provision the database

The simplest local setup uses Docker:

```bash
docker run --name poolsignal-pg \
  -e POSTGRES_USER=poolsignal -e POSTGRES_PASSWORD=poolsignal \
  -e POSTGRES_DB=poolsignal -p 5432:5432 -d postgres:16
```

Then push the Prisma schema and seed it:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

> If you don't have Postgres available, you can still run the app —
> the dashboard, pool detail, watchlist and alerts pages all work
> against the in-memory mock dataset. Only the Prisma-backed API
> routes (`POST /api/watchlist`, `POST /api/alerts`) need a database.

### 4. Run the dev server

```bash
npm run dev
```

Visit <http://localhost:3000>.

### 5. Build for production

```bash
npm run build
npm start
```

---

## Scripts

| Script            | Purpose                                       |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start Next.js in development mode             |
| `npm run build`   | Production build (runs `prisma generate` too) |
| `npm start`       | Start the production server                   |
| `npm run lint`    | Run ESLint                                    |
| `npm run db:seed` | Seed the database with demo data              |

---

## Opportunity Score

`computeOpportunity()` in `src/lib/scoring.ts` returns a 0–100 score and
the per-factor breakdown rendered on the pool detail page:

- **Liquidity (25%)** — log-scaled TVL, capped around $500M.
- **Volume (20%)** — log-scaled 24h volume, capped around $250M.
- **APR (20%)** — linear, 50% APR == 100.
- **Spread (10%)** — inverse, ≥50 bps == 0.
- **Slippage on 1k (10%)** — inverse, ≥100 bps == 0.
- **Risk (15%)** — inverse of the source risk score.

Tweak the weights or the saturation curves to fit your strategy.

---

## Extending the app

- Wire **real auth** (NextAuth, Clerk, etc.) and pass the user id to
  `/api/watchlist` and `/api/alerts` to persist per-user data.
- Replace the heuristic in `src/lib/ai-insight.ts` with a call to your
  preferred LLM provider — keep the same return shape and the UI keeps
  working.
- Add a **cron job** that calls `fetchAllPools()` every minute, writes
  a `PoolSnapshot` row per pool, and evaluates `evaluateAlerts()` against
  the previous snapshot to fire real alerts.
- Add more DEXes by dropping a new file in `src/lib/services/` and
  registering it in `src/lib/services/index.ts`.

---

## License

MIT
