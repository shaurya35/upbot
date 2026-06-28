# Upbot

> Distributed uptime monitoring. Check your sites from 15+ global regions, get alerted the moment they go down, and watch latency trends in real time.

Upbot pings your endpoints from Cloudflare's edge network across regions like Dublin, Sydney, Frankfurt, São Paulo, Dubai and more, fans the work out through a Redis Streams queue, and streams results back to a live dashboard. It's built as a Turborepo monorepo so the scheduler, queue, edge checkers, API and UI each stay independent and independently deployable.

## Why it's built this way

A single server pinging every site on a timer doesn't scale and can't tell you whether *your users* in another continent can reach you. Upbot separates **scheduling**, **queueing**, **edge execution**, and **persistence** so each part can scale on its own and a slow region never blocks the others. The full reasoning and tradeoffs live in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Architecture

```
                  ┌──────────────┐
                  │   web (UI)   │  Next.js 15 + React 19 + Recharts
                  └──────▲───────┘
                         │ REST
                  ┌──────┴───────┐
   schedules      │    server    │  Express API: auth (JWT/OTP/bcrypt),
   checks         │  /api/v1/*   │  websites, alerts, checks, profiles
      │           └──────▲───────┘
┌─────┴──────┐          │ Prisma
│   pusher   │   ┌──────┴───────┐
│ scheduler/ │   │    store     │  Prisma + PostgreSQL (schema + seed)
│ producer   │   └──────▲───────┘
└─────┬──────┘          │
      │ xAdd            │ persist results
      ▼                 │
┌──────────────┐   ┌────┴─────┐      ┌─────────────────────┐
│ Redis Streams│──▶│  worker  │─────▶│  cfworkers (edge)   │
│   (queue)    │   │ consumer │ POST │ Cloudflare Workers   │
└──────────────┘   │  group   │◀─────│ multi-region pings   │
                   └──────────┘ res  └─────────────────────┘
```

**Data flow:** `pusher` reads the websites due for a check, expands each into per-region jobs based on the user's plan (`getRegionsForPlan`), and `xAdd`s them onto a Redis Stream. `worker` consumes the stream as a **consumer group** (so multiple workers share the load and stuck messages are reclaimed via `claimPendingMessages`), batches up to 50 jobs, and dispatches them to the Cloudflare Worker. `cfworkers` runs the actual HTTP checks from each requested edge region, returns status + latency, and the worker persists results through Prisma. The `server` exposes that data over a versioned REST API, and `web` renders dashboards and charts.

## Monorepo layout

| Path | What it is |
|------|------------|
| `apps/pusher` | Scheduler/producer that selects regions per plan and enqueues checks onto Redis Streams |
| `apps/worker` | Consumer-group worker that batches jobs, calls the edge workers, and persists results |
| `apps/cfworkers` | Cloudflare Workers that perform the multi-region HTTP checks (Vitest tests) |
| `apps/server` | Express REST API: `auth`, `profile`, `website`, `alert`, `check`, `team` (v1) |
| `apps/web` | Next.js 15 dashboard (React 19, Recharts, Tailwind 4) |
| `apps/client` | Next.js 15 front-end app |
| `apps/tests` | Cross-cutting integration tests |
| `packages/redis-streams` | Redis Streams client: `xAddBulk`, `xReadGroup`, `xAckBulk`, `claimPendingMessages` |
| `packages/store` | Prisma client, schema, and seed data |
| `packages/ui` | Shared React component library |
| `packages/eslint-config`, `packages/typescript-config` | Shared tooling configs |

## Tech stack

**Languages/runtime:** TypeScript, Bun, Node >=18
**Backend:** Express, Prisma + PostgreSQL, Redis Streams, Cloudflare Workers
**Frontend:** Next.js 15, React 19, Tailwind CSS 4, Recharts
**Tooling:** Turborepo, Bun workspaces, ESLint, Prettier, Vitest

## Getting started

**Prerequisites:** [Bun](https://bun.sh) >= 1.1, PostgreSQL, Redis, and (for edge checks) a Cloudflare account + Wrangler.

```bash
# 1. Install
bun install

# 2. Configure env. Copy the example in each app that has one
cp apps/server/.env.example apps/server/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/pusher/.env.example apps/pusher/.env
cp packages/store/.env.example packages/store/.env

# 3. Set up the database
cd packages/store
bunx prisma generate
bunx prisma migrate dev      # or: psql < seed.sql

# 4. Run everything in dev
bun run dev
```

### Key environment variables

| App | Variable | Purpose |
|-----|----------|---------|
| store | `DATABASE_URL` | PostgreSQL connection string |
| worker | `WORKER_URL` | Cloudflare Worker endpoint that runs the checks |
| worker | `MAX_BATCH_SIZE` | Max jobs pulled per stream read (default `50`) |
| worker | `WEBSITE_TIMEOUT` | Per-check timeout in ms |
| server | `PORT` | API port (default `8080`) |

## Useful scripts

```bash
bun run dev          # turbo run dev (all apps)
bun run build        # turbo run build
bun run lint         # turbo run lint
bun run check-types  # turbo run check-types
bun run format       # prettier
```

## Roadmap

- [ ] Team/collaboration routes (scaffolded, currently disabled)
- [ ] Status pages and incident timelines
- [ ] Webhook / Slack / email alert channels

## License

See repository for license details.
