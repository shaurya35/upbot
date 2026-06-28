# Architecture & Design Decisions

This document explains *why* Upbot is built the way it is: the constraints, the options considered, and the tradeoffs taken. The "what" lives in the [README](./README.md).

## The core problem

Uptime monitoring has two requirements that pull in opposite directions:

1. **Geographic truth.** "Is my site up?" is meaningless without "up *from where?*". A site can be healthy in Frankfurt and unreachable from São Paulo.
2. **Scale under bursty, bounded-latency work.** Every monitored site needs checking on its own interval, every check is a slow network I/O bound on an *external* host, and one hung target must never delay thousands of healthy ones.

A naive `setInterval` loop on one server fails both: it checks from a single location, and a handful of slow targets starve the rest.

## How the pieces map to those requirements

| Concern | Component | Decision |
|---------|-----------|----------|
| Geographic truth | `cfworkers` | Run the actual HTTP checks on Cloudflare's edge, requesting specific regions per job |
| Decoupling scheduling from execution | `pusher` -> Redis Streams -> `worker` | A queue between producer and consumers |
| Sharing load + surviving crashes | Redis Streams **consumer groups** | At-least-once delivery with explicit ack + reclaim |
| Durable results & relational data | `store` (Prisma + Postgres) | Single source of truth for sites, checks, alerts, users |
| Read API | `server` | Stateless Express service, horizontally scalable |

## Key decisions and tradeoffs

### 1. Cloudflare Workers for the actual checks
**Why:** They give real multi-region execution (15+ locations) without me renting and operating a VM in every region. Checks run close to where real users are, and the edge scales the fan-out for free.
**Tradeoff:** Worker runtime constraints (CPU/time limits, no raw TCP) mean checks are HTTP-shaped, and there's a network hop from `worker` to the edge. Accepted because the alternative (a global fleet of always-on probes) is an ops burden out of scope for a solo-built project. The `cfworkers` app validates inbound payloads with runtime type guards (`isRequestData`) because edge input can't be trusted.

### 2. Redis Streams instead of a job library (BullMQ) or a broker (Kafka/RabbitMQ)
**Why Streams over BullMQ:** I needed consumer-group semantics, explicit acks, and the ability to *reclaim* messages a dead worker never finished. Streams give that natively (`XREADGROUP`, `XACK`, reclaim via `claimPendingMessages`) without a second abstraction layer.
**Why Streams over Kafka:** Kafka's partition/retention model is overkill at this scale and a heavy operational dependency. Redis is already a natural fit and one fewer system to run.
**Tradeoff:** At-least-once delivery means a check can occasionally run twice (e.g. a worker dies after the HTTP call but before `XACK`). For uptime data this is benign: a duplicate sample is harmless and far cheaper than the complexity of exactly-once. The pending-entries list + reclaim is what prevents *lost* checks when a worker crashes mid-batch.

### 3. `pusher` and `worker` are separate services
**Why:** Scheduling ("which sites are due, in which regions") and execution ("go run these checks") scale differently. Scheduling is light and centralized; execution is heavy and parallel. Splitting them lets me run many workers behind one scheduler, and a worker restart never drops the schedule.
**Tradeoff:** More moving parts to deploy. Worth it: it's the only way a slow region can't block the scheduler.

### 4. Batching (`MAX_BATCH_SIZE`, default 50)
**Why:** Pulling and dispatching checks in batches amortizes per-message overhead and lets one worker keep many in-flight HTTP requests busy. Per-call timeouts (`WEBSITE_TIMEOUT`) bound the blast radius of any single hung target.
**Tradeoff:** Larger batches raise throughput but also the cost of a worker dying mid-batch (more messages to reclaim). 50 is a starting point to tune against real load.

### 5. Plan-aware region selection (`getRegionsForPlan`)
**Why:** Region fan-out is the main cost driver. Tying the number/choice of regions to the user's plan keeps cost proportional to value and makes the product tiers meaningful.

## Failure modes considered

| Failure | Handling |
|---------|----------|
| Worker crashes mid-batch | Unacked messages stay in the stream's pending list and are reclaimed by another worker |
| Target host hangs | Per-check `timeout` (axios `validateStatus < 500`, 30s default) bounds the wait |
| Edge worker returns 5xx / no response | Worker records a structured error result rather than crashing the batch |
| Bad/forged payload at the edge | Runtime type guards reject it before any check runs |
| API abuse | `rateLimiter` middleware on the server |

## Known limitations / next steps

- **Test coverage is uneven.** `cfworkers` has Vitest tests and there's an integration `tests` app; the server controllers are the priority gap to close next.
- **Team routes** are scaffolded but disabled pending authz work.
- No distributed tracing yet; structured logs are the current observability surface.
