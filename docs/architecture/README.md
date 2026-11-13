# Architecture

Upbot separates its API from scheduled monitoring work. PostgreSQL stores websites, check history, incidents, and notification delivery state. Redis holds the schedule and jobs. A queue consumer calls a Cloudflare Worker to perform HTTP checks.

## Diagrams

| File | Purpose |
| --- | --- |
| [System overview](system-overview.png) | Main services and data paths. |
| [Overview source](system-overview.svg) | Editable source for the overview image. |
| [Scheduler and worker](low-level.png) | Earlier scheduler and queue-consumer sketch. |
| [Excalidraw board](architecture.excalidraw) | Editable board with earlier ideas and future designs. |

The diagrams predate the incident and webhook additions. Treat them as an overview, not a complete specification of the latest code.

## Check lifecycle

1. The authenticated API stores each monitor and its interval in PostgreSQL.
2. The scheduler periodically reconciles active websites with a Redis sorted set, using stable website IDs as members and a separate settings hash. Edits and deletions are reflected on the next refresh. An unchanged monitor retains its scheduled time.
3. Every five seconds the scheduler reads due IDs. For each monitor, a Redis script publishes a job and advances its next check time. Local scheduling and reconciliation passes run sequentially. The scheduler is designed to run as a single process.
4. Workers read Redis Stream jobs through a shared consumer group and claim pending jobs. Deleted websites are skipped. The checker sends an HTTP HEAD request and falls back to GET when HEAD returns 405 or 501, within one timeout. Other unsuccessful responses are DOWN.
5. Each check is saved with its observation time and a unique stream-message/region key. The worker acknowledges after persistence succeeds. Replaying a stored job does not insert the same check twice. If the database is unavailable, the job remains pending.
6. Incident state is updated with the observation in the same transaction. Two consecutive fresh failures open an incident; a later UP closes it. Old or duplicate observations do not change the current incident state. A freshness gap resets the consecutive-failure count.
7. Opening or closing an incident creates delivery records for the owner's active generic webhook channels. A worker polls pending deliveries and retries unsuccessful requests up to five times. Each event has a stable ID and `Idempotency-Key`; receivers should deduplicate because a network retry can arrive after a successful request whose response was lost.

Code: [scheduler](../../apps/pusher/index.ts), [stream client](../../packages/redis-streams/index.ts), [worker](../../apps/worker/index.ts), [incident processing](../../apps/worker/incidents.ts), [checker](../../apps/cfworkers/src/index.ts), and [database schema](../../packages/store/prisma/schema.prisma).

## Dashboard and demo

The authenticated dashboard uses ownership-checked API endpoints. It shows check history, response times, incidents, and sanitized webhook delivery status. An observation becomes stale when older than the greater of three monitor intervals and 120 seconds; the current status then becomes UNKNOWN. Uptime percentages represent the proportion of observed checks that were UP, not an elapsed-time availability guarantee.

The optional public demo uses `DEMO_USER_ID` to select a dedicated account. Its read-only API exposes only that account's monitor results and sanitized incident delivery statuses. It does not expose channel destinations or allow guest writes. See the [demo walkthrough](../../README.md#demo-walkthrough) for the local target and receiver.

## Current limits

- **Execution location:** region IDs are metadata; the existing checker does not establish execution in each requested region. Incident processing requires one configured region. Multi-region routing and quorum are not implemented.
- **Scheduler and delivery concurrency:** the scheduler is single-process. The webhook polling loop is intended for one worker for the demo; delivery receivers should still deduplicate event IDs.
- **Availability:** an outage shorter than the confirmation interval can be missed, including during database unavailability. Stale results are not evidence that a target is up or down.
- **Integrations:** generic webhook delivery is implemented. Email, SMS, Slack, Discord, and Telegram channel records can exist but do not yet send monitoring alerts. Signup OTP email is separate.
- **SSL and service guarantees:** certificate-expiry monitoring and an availability SLA are not implemented.
- **Data and deployment:** the monitoring migration is additive, but existing hosted databases must be reviewed before applying it. The landing page waitlist is a separate database.
