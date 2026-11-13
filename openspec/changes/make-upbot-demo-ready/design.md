# Design

## Context

See `proposal.md` for motivation and the three capability specs for observable requirements.

Inspection found that the dashboard already uses ownership-checked APIs for monitor CRUD, historical uptime buckets, response-time charts, and recent checks. `AppShell` and the root route require authentication, and there is no public demo route or demo target. The README's statement that the dashboard uses sample monitoring data is stale.

The scheduler only adds new monitors on refresh. Worker persistence errors are swallowed before acknowledgement. Results lack a retry identity, and source observation timestamps are discarded. The HTTP checker only uses HEAD. Latest status has no freshness check. Alert channel CRUD exists, but there are no incidents or delivery jobs; the integrations screen explicitly states delivery is unimplemented.

Evidence from the preceding audit: isolated probes reproduced failed-write acknowledgement, unchanged edited/deleted schedules, and HEAD-405 false negatives. Core/dashboard type checks passed. Both Cloudflare starter tests failed because they still expected Hello World. This is code/probe evidence, not a verified hosted deployment.

## Goals / Non-Goals

**Goals:**

- Reuse the existing services and UI, with one execution location and a single scheduler.
- Make a visitor's first minute useful: populated monitor list, meaningful detail, a real incident, and evidence of a delivered webhook.
- Keep ordinary authenticated CRUD usable and give an operator a repeatable outage/recovery demonstration.
- Separate observable live monitoring from any illustrative content.

**Non-Goals:**

- Additional queues, a new streaming UI, public arbitrary-URL checks, multi-tenant cloud onboarding, multi-region routing, autoscaling, or an availability guarantee.
- A visual redesign of the landing page or dashboard.
- Sending real email/SMS or charging for external services as part of verification.

## Decisions

### 1. Separate public read access from account authentication

Add `/demo` and `/demo/website/[websiteId]` in `apps/client`. Extract the existing monitor list and detail presentation into reusable views that accept data and read-only controls. Keep `AppShell` authentication unchanged; give demo views a small public shell instead of manufacturing a user session.

Add `/api/v1/demo/websites` and corresponding detail, stats, checks, and incident GET endpoints. A server-only `DEMO_USER_ID` selects a dedicated, explicitly provisioned account whose monitors are public. Do not accept arbitrary account IDs. Public responses contain a narrow allowlist of monitoring and sanitized incident/delivery fields. They exclude email, channel targets, secrets, and account configuration. Existing APIs continue enforcing ownership. No guest writes or shared demo passwords.

A shared demo login would be less code initially but would either expose mutation permissions or require a fragile second authorization layer. Read-only endpoints are a small, explicit boundary. Link to the demo through a compact landing-page action; retain the current waitlist and count.

### 2. Show real observations with a repeatable target

Provide an opt-in demo target with HTTP endpoints for an always-healthy monitor and an operator-switchable monitor. Target mode changes require a control secret and are not reachable through the public demo UI. A local receiver records sanitized webhook events. If the checker runs remotely, the target and receiver must have addresses reachable from it; local-only verification uses the existing local checker.

Preparation creates the dedicated demo account, two monitors, and its generic webhook channel idempotently. It does not erase data. Run the actual scheduler/checker/consumer to produce history and a controlled outage/recovery cycle before sharing. Do not seed invented production-looking uptime. Optional fixture history, if ever added, needs a separate labeled presentation and cannot enter live metrics; fixture generation is not required by this plan.

Preserve the existing chart ranges, but show how much history exists and default an empty deployment to an honest empty state. A stopped demo displays stale status, not a fabricated fallback. Demo views omit account settings and disabled edit/delete controls rather than showing dead controls.

### 3. Fix monitoring correctness without redesigning the system

Store schedule members by stable monitor ID and settings separately. Reconcile additions, updates, and removals each refresh; preserve an unchanged monitor's due time. Serialize a scheduler's reconciliation and due-publishing passes to avoid overlapping local timers. Publish due jobs and advance their due scores in one Redis transaction. Keep single-scheduler operation explicit; distributed leader election is outside scope.

Have the consumer verify that the monitor is active before starting queued work. Within one HTTP deadline, retry HEAD 405/501 with GET and cancel the fallback body after headers. Persist source observation time. Assign each result a stable unique key based on stream message ID and region ID. Existing records have a nullable key; new results must have one. Acknowledge only after the transaction storing new observations and their incident effects succeeds. Redelivery after commit reuses existing results without rerunning stored checks or applying transitions again. A failure before any result was stored may require a fresh HTTP request on retry; this does not promise capture of every transient outage during database downtime.

Compute display freshness from the monitor interval, using the larger of three intervals and 120 seconds. Keep history accessible and call percentages observed-check uptime. This does not upgrade sample-based percentages into elapsed-time availability or an SLA.

### 4. Persist a minimal incident state and notification outbox

For the demonstrated single-location flow, process observations per monitor in timestamp order. Track the latest processed observation and consecutive fresh failures; reset the failure sequence after a freshness gap. Two consecutive fresh failures open one incident at the first failure time; one subsequent UP closes it. Old or duplicate observations cannot change state. Real multi-region quorum behavior is deliberately not designed here; incident delivery must reject multi-region configuration with a clear configuration message until its policy is specified.

Use an additive monitoring-database migration for a nullable unique observation key, monitor incident state, incidents, and webhook deliveries. Serialize state changes for a monitor within the persistence transaction. Incident events and delivery records commit with their observations, so a later crash cannot leave a recorded transition without a queued notification. Use a unique incident/event/channel identity to avoid duplicate logical deliveries.

Initially all active generic webhook channels belonging to the monitor owner receive its events. Existing per-monitor channel-selection relations are not wired by the API; implementing configurable routing is outside scope. Label this account-wide behavior in Integrations.

Reuse the worker process for a small independent outbox polling loop. A bounded HTTP attempt does not block check persistence or require a new service. Send JSON with a stable event ID and `Idempotency-Key`; accept 2xx, retry failures up to five total attempts with delays of 5, 15, 60, and 300 seconds. Use a five-second request timeout. A receiver might process a request before its response is lost, so receivers must deduplicate event IDs; do not claim exactly-once network delivery. Pending/sent/failed status and attempt count appear in the detail view without revealing webhook URLs.

Keep unsupported channel records intact, but mark their delivery unavailable. Use a local receiver for verification; this change does not build or claim provider-specific Slack, Discord, Telegram, SMS, or email delivery.

### 5. Put the engineering evidence on the path visitors take

Keep the existing dashboard look. Add incident start/end/duration/reason and a compact delivery-status row. Make loading, no history, stale results, API errors, and retry actions deliberate on desktop and mobile. Add a short architecture link explaining the check flow using the existing diagrams. Update stale README statements and clearly separate implemented, demonstrated, and planned capabilities.

A public demo should not retain unlabeled claims of verified global coverage, SSL expiry checks, 99.9% SLA, 50K usage, or 2.3-second alerts. Adjust only those feature/status labels and numbers within the current visual structure; retain the existing developer signup count. No license is detected in the checkout; choosing and adding one is a separate owner decision, not an implicit change in this plan.

## Risks / Trade-offs

- **Live demo can stop updating** → Show freshness and data errors, retain real history, and provide a pre-share walkthrough and restart instructions. A service manager and deployment health check are hosting concerns, not a monitoring-platform buildout.
- **Two confirmed failures take time** → At a 30-second interval, detection usually needs roughly 30–60 seconds after failure plus execution/scheduling delay. Demonstrate that honestly; no instant-alert claim.
- **Private data leaks through reused API models** → Use explicit public response schemas and tests against private IDs and channel credentials.
- **Migration affects existing history** → Add nullable identities for old checks; do not remove history, accounts, channel records, or waitlist data.
- **Single location and scheduler** → Clearly document the boundary. Do not describe region labels as measured geographic coverage.
- **Shared demo target state** → Operator-only controls; public visitors can inspect but cannot disrupt one another's demo.

## Migration Plan

1. Implement and test against an isolated local monitoring database, with additive migrations reviewed before any hosted application. Leave the landing/waitlist database untouched.
2. Provision the dedicated demo account and controlled target/receiver. Run the actual pipeline until history and a completed outage/recovery incident are visible.
3. Configure `DEMO_USER_ID`, checker credentials, origins, public API URL, and target/receiver addresses. Add a runbook for long-running API/scheduler/consumer, frontend start commands, and the existing Cloudflare checker deployment. Hosting choice does not change the demo contract.
4. Validate the public demo and private-account isolation locally. Publishing remains a separately requested action; no hosting account or production database is modified by this planning change.
5. Roll back public access by unsetting `DEMO_USER_ID` and removing the landing demo link. Roll back application changes without dropping additive history tables or columns until preservation has been checked.

## Open Questions

- Which hosting account/domain will serve the eventual preview? This only affects deployment credentials and runbook values; local implementation and acceptance do not depend on it.
- Which license does the owner want? This is outside this implementation scope and should be resolved before claiming licensed open source distribution.
