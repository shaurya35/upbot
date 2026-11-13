# Upbot

**Scheduled HTTP checks with Redis Streams and Cloudflare Workers.**

Upbot checks websites on a schedule and stores their status, response time, HTTP status code, and errors. The scheduler, queue consumer, HTTP checker, and API run as separate services. This keeps slow network requests out of the API and lets workers share the checking workload.

The project is a TypeScript monorepo built with Bun and Turborepo. It includes a Next.js dashboard and a separate landing page.

[Architecture](#architecture) · [Local setup](#local-setup) · [API](#api) · [Development status](#development-status)

## What is implemented

- Website management through an Express API, including check intervals and soft deletion.
- A Redis sorted set that tracks when each website is due for a check.
- Redis Streams with a shared consumer group, batch processing, and pending message recovery.
- A Cloudflare Worker that makes HTTP `HEAD` requests and returns check results.
- PostgreSQL storage for websites, regions, and check history through Prisma.
- Authentication code for email verification, password hashing, access tokens, and refresh tokens.
- Confirmed outage and recovery incidents, with generic webhook delivery and retries.
- An optional read-only demo backed by a dedicated account and real check history.

The dashboard displays monitoring data from the API. Regional execution and some integrations still need work. See [development status](#development-status) for the current limits.

## Architecture

![Upbot architecture: client, API, PostgreSQL, scheduler, Redis, worker, and HTTP checker](docs/architecture/system-overview.png)

### How a check moves through the system

1. The API stores a website and its monitoring settings in PostgreSQL.
2. The pusher reads active websites and adds them to `upbot:schedule`. Each entry is scored by its next check time.
3. Every five seconds, the pusher reads due entries, attaches the regions from `MONITOR_REGIONS`, and writes one job per website to `upbot:websites`.
4. Workers read jobs through the `monitoring` consumer group. They also claim messages that have been pending for at least 30 seconds.
5. Each worker sends jobs to the Cloudflare Worker, which checks the target URL once for each requested region entry.
6. The worker stores each observation and its incident transitions in a transaction, then acknowledges the job after persistence succeeds.

The requested region codes are part of the current job format. They do not establish that checks ran from those locations. Check persistence, retries, and the remaining limits are described in the [architecture notes](docs/architecture/README.md#current-limits).

### Scheduler and worker detail

![Original low-level diagram of scheduler initialization, Redis operations, worker batches, and database writes](docs/architecture/low-level.png)

This original sketch follows the scheduler and worker functions. The [architecture notes](docs/architecture/README.md) explain the queue contract, timing, and design choices. The [editable Excalidraw board](docs/architecture/architecture.excalidraw) also includes earlier ideas and future designs.

## Repository layout

| Path                                                                                                           | Responsibility                                                                       |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`apps/pusher`](apps/pusher)                                                                                   | Loads websites, maintains the schedule, and publishes check jobs.                    |
| [`apps/worker`](apps/worker)                                                                                   | Consumes jobs, calls the HTTP checker, and stores results.                           |
| [`apps/cfworkers`](apps/cfworkers)                                                                             | Cloudflare Worker that validates jobs and checks target URLs.                        |
| [`apps/server`](apps/server)                                                                                   | Express API for authentication, profiles, websites, and alert channel configuration. |
| [`apps/client`](apps/client)                                                                                   | Next.js dashboard, account screens, and monitoring UI.                               |
| [`apps/web`](apps/web)                                                                                         | Landing page and waitlist, with its own Prisma schema.                               |
| [`packages/redis-streams`](packages/redis-streams)                                                             | Shared stream publishing, consumption, acknowledgement, and recovery functions.      |
| [`packages/store`](packages/store)                                                                             | Monitoring database schema and shared Prisma client.                                 |
| [`docs/architecture`](docs/architecture)                                                                       | Diagrams, editable sources, and architecture notes.                                  |

## Stack

| Area                  | Tools                                        |
| --------------------- | -------------------------------------------- |
| Runtime and language  | Bun, TypeScript                              |
| API                   | Express, Zod, JWT, bcrypt, Nodemailer        |
| Scheduling and queue  | Redis sorted sets, Redis Streams             |
| HTTP checks           | Cloudflare Workers, Wrangler                 |
| Database              | PostgreSQL, Prisma                           |
| Frontend              | Next.js 15, React 19, Tailwind CSS, Recharts |
| Workspace and tooling | Turborepo, Bun workspaces, ESLint, Prettier  |

## Local setup

You need [Bun](https://bun.sh) 1.3.13+ and [Docker](https://www.docker.com/products/docker-desktop/) (for Postgres and Redis). Then, from the repository root:

```bash
bun install
bun run dev
```

`bun run dev` does everything:

1. Creates `.env` from `.env.example` on first run and generates the JWT secrets.
2. Starts Postgres and Redis with `docker compose`, unless they are already reachable at `DATABASE_URL` and `REDIS_URL`.
3. Generates the Prisma client, syncs the schema and seeds the regions.
4. Starts every service with Turborepo:

| Service                 | URL                     |
| ----------------------- | ----------------------- |
| Dashboard               | <http://localhost:3000> |
| Landing page            | <http://localhost:3001> |
| API                     | <http://localhost:8080> |
| HTTP checker (Wrangler) | <http://localhost:8787> |
| Pusher (scheduler)      | no port                 |
| Worker (queue consumer) | no port                 |

Open <http://localhost:3000>, sign up, and add a website. Without `EMAIL_USER`/`EMAIL_PASS`, the signup code is printed in the API log (`[dev] OTP for ...`) instead of emailed. New websites are picked up within `WEBSITE_REFRESH_INTERVAL` (15 seconds in development), and their first checks appear on the dashboard shortly after.

Other commands:

```bash
bun run db:setup       # Only the setup steps (env, Postgres/Redis, schema, seed)
bun run db:push        # Apply schema changes to the database
bun run services:down  # Stop the Postgres and Redis containers (data is kept in Docker volumes)
```

### Configuration

All services read the single root `.env`. See `.env.example` for every variable. The ones you are most likely to change:

| Variable                      | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`, `REDIS_URL`   | Use your own Postgres or Redis instead of the Docker containers.        |
| `MONITOR_REGIONS`             | Comma-separated region codes from `packages/store/regions.ts`.          |
| `EMAIL_USER`, `EMAIL_PASS`    | Gmail account for OTP emails. Required when `NODE_ENV=production`.      |
| `ALLOWED_ORIGINS`             | Dashboard origins allowed by the API's CORS policy.                     |
| `WEB_DATABASE_URL`            | Landing page waitlist database. Never point it at `DATABASE_URL`.       |
| `NEXT_PUBLIC_BACKEND_URL`     | API URL used by the dashboard and public demo.                           |
| `WORKER_URL`, `WORKER_SECRET` | Where the worker sends checks, and the checker's shared secret.         |

The landing page in `apps/web` uses its own database (`WEB_DATABASE_URL`, a separate `upbot_web` database locally). The public demo is available directly at the dashboard’s `/demo` route.

### Deploying the HTTP checker

```bash
bun run --cwd apps/cfworkers deploy
```

Set `WORKER_URL` to the deployed URL printed by Wrangler. A deployed checker should require a shared secret so it can't be used as an open proxy:

```bash
cd apps/cfworkers && bunx wrangler secret put CHECK_SECRET
```

Put the same value in `WORKER_SECRET` in `.env`.

## API

| Method                 | Route                     | Purpose                                            |
| ---------------------- | ------------------------- | -------------------------------------------------- |
| `GET`                  | `/health`                 | API health response.                               |
| `POST`                 | `/api/v1/auth/signup`     | Request an email verification code.                |
| `POST`                 | `/api/v1/auth/verify-otp` | Verify the code and create an account.             |
| `POST`                 | `/api/v1/auth/resend-otp` | Send a new verification code.                      |
| `POST`                 | `/api/v1/auth/signin`     | Sign in and receive an access token.               |
| `POST`                 | `/api/v1/auth/refresh`    | Refresh the access token using the refresh cookie. |
| `POST`                 | `/api/v1/auth/signout`    | Clear the refresh cookie.                          |
| `GET`, `PUT`           | `/api/v1/profile`         | Read or update the signed-in user's profile.       |
| `GET`, `POST`          | `/api/v1/website`         | List or create websites.                           |
| `GET`, `PUT`, `DELETE` | `/api/v1/website/:id`     | Read, update, or soft-delete a website.            |
| `GET`                  | `/api/v1/website/:id/stats?range=24h\|7d\|30d` | Uptime and response-time buckets for charts. |
| `GET`                  | `/api/v1/website/:id/checks?limit=50` | Most recent check results.             |
| `GET`, `POST`          | `/api/v1/alert`           | List or create alert channels.                     |
| `GET`, `PUT`, `DELETE` | `/api/v1/alert/:id`       | Read, update, or deactivate an alert channel.      |

Website, alert and profile routes require `Authorization: Bearer <access-token>`. For example:

```bash
curl -X POST http://localhost:8080/api/v1/website \
  -H 'Authorization: Bearer <access-token>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Example","url":"https://example.com"}'
```

## Development status

The repository contains the monitoring pipeline and the product UI. It still needs work before a complete hosted monitoring service:

- **Monitoring reliability:** failed writes remain pending, and stored results have retry identities. The scheduler and webhook polling are designed for a single process each.
- **Regional checks:** region metadata is configured, but execution from each requested location needs a verified routing design.
- **Product features:** incident detection and generic webhook delivery are implemented. Email, SMS, and service-specific integrations do not yet deliver monitoring alerts.
- **Tests:** checker and incident-transition tests are included; broader API and failure-recovery coverage is still needed.

See the [architecture notes](docs/architecture/README.md) for the exact limits and the next engineering steps.

## Working on the project

```bash
bun run build        # Build workspaces that define a build script
bun run lint         # Lint workspaces that define a lint script
bun run check-types  # Type-check every workspace
bun run format       # Format TypeScript, TSX, and Markdown files
```

These tasks cover the scripts defined by each workspace. They do not provide a complete backend test suite.

Keep changes focused on one service or behavior. Include the setup needed to reproduce the change and the checks you ran. If the job format, schema, or service flow changes, update the architecture notes and diagrams with it.

## Demo walkthrough

The demo is read-only and shows actual checks from a dedicated account. Public responses include monitor name, URL, interval, timestamps, status, check history, incident details, and sanitized webhook delivery status. It uses a single monitoring location. It does not expose the demo account's email, alert destinations, or mutation routes. The dashboard reports observed-check uptime; it is not an SLA.

Use an isolated local database. Start Postgres and Redis with Docker, and run the normal `bun run dev` setup once. Keep the scheduler, worker, API, checker, dashboard, and landing page running. In another terminal, from the repository root:

```bash
export DEMO_CONTROL_SECRET='choose-a-local-secret'
bun --env-file=.env scripts/demo/target.ts
```

In a second terminal:

```bash
bun --env-file=.env scripts/demo/prepare.ts
```

The preparation script prints `DEMO_USER_ID`. Add that value to the API's `.env` and restart the API. Open `http://localhost:3000/demo`. The setup script only creates or updates the dedicated demo account, monitors, and webhook; it does not erase existing history.

To demonstrate an outage and recovery, use the same secret in the target terminal:

```bash
curl -X POST http://127.0.0.1:8790/control -H "x-demo-secret: $DEMO_CONTROL_SECRET" -H 'content-type: application/json' -d '{"healthy":false}'
```

After two failed checks, inspect the incident and its webhook delivery in the demo. Restore the target with:

```bash
curl -X POST http://127.0.0.1:8790/control -H "x-demo-secret: $DEMO_CONTROL_SECRET" -H 'content-type: application/json' -d '{"healthy":true}'
```

Refresh the monitor detail after the next check. The webhook receiver uses a stable event ID; real receivers should deduplicate repeated delivery attempts. For a remotely deployed checker, `DEMO_TARGET_URL` must be reachable from that checker, and its control endpoint must remain restricted. Hosting the frontend, API, scheduler, worker, database, Redis, target, and checker is separate from this local walkthrough.

The incident and delivery tables are an additive monitoring-database change. Review and apply the migration to an isolated database first; the waitlist database is separate. Rolling back the application does not require dropping the new tables or existing data.

The checker sends HEAD requests and falls back to a bounded GET when the target returns 405 or 501. Both requests share the configured timeout.

## Tests

```bash
bun run --cwd apps/cfworkers test --run
bun run --cwd apps/worker test
bun test apps/pusher/reconciliation.test.ts apps/server/controllers/v1/websiteControllers/monitorStatus.test.ts
```

The waitlist integration test requires a disposable database created with the `apps/web/prisma/schema.prisma` schema. Set `TEST_WEB_DATABASE_URL` explicitly; it is skipped when that variable is absent:

```bash
TEST_WEB_DATABASE_URL='postgresql://user:password@localhost:5432/upbot_web_test' bun run --cwd apps/web test:integration
```
