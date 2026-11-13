# Tasks

Checkboxes record completed implementation and verification. Final user direction: keep the direct `/demo` route, remove the landing demo link, and preserve original content from Upbot Components downward except approved link destinations. Preserve the current landing-page styling, signup count, and unrelated edits. Use an isolated local monitoring database for verification.

## 1. Monitoring behavior that the demo depends on

- [x] 1.1 Replace the Cloudflare Hello World tests with checker contract tests for valid checks, invalid input, authentication, non-success HTTP responses, and timeout handling; verify `bun run test --run` passes in `apps/cfworkers`.
- [x] 1.2 Add the bounded GET fallback for HEAD 405/501 and cancel response bodies; verify tests cover GET success, timeout across both requests, and ordinary HEAD success without a second request, and document the behavior.
- [x] 1.3 Reconcile scheduler additions, URL/interval edits, and deletions using stable monitor IDs; verify tests preserve unchanged due times, remove old settings, and stop deleted monitors, and update architecture scheduling notes.
- [x] 1.4 Serialize scheduler passes and make due-job publication and next-run advancement atomic within one Redis transaction; verify an injected publication failure cannot advance the schedule without a job.
- [x] 1.5 Add an additive migration for nullable unique check identity, preserve observation timestamps, and acknowledge only after successful persistence; verify failed writes remain pending and replay after commit produces no duplicate observations. Document retry semantics and skip deleted queued monitors in a regression test.
- [x] 1.6 Derive UNKNOWN/stale status using the specified freshness threshold and label historical percentages as observed-check uptime; verify API boundary-time cases and dashboard stale/no-data rendering, and document the threshold.

## 2. One complete outage and recovery flow

- [x] 2.1 Add additive incident state, incident, and notification delivery records without dropping existing data; verify migrations against an isolated populated database and document migration/rollback steps.
- [x] 2.2 Process new observations and incident transitions transactionally per monitor, rejecting ambiguous multi-region incident configuration; verify two failures open one incident, one UP closes it, gaps reset failure confirmation, and replay or older observations cannot repeat transitions.
- [x] 2.3 Queue one outage/recovery event per active owner WEBHOOK channel in the same transaction; verify owner isolation, inactive channel exclusion, and no duplicate logical event after redelivery, and document account-wide routing.
- [x] 2.4 Deliver queued JSON events with stable identity, a five-second timeout, and the specified five-attempt retry schedule; verify receiver failure/recovery and stable retry identity using a controlled local receiver, and document the receiver's deduplication responsibility.
- [x] 2.5 Add ownership-checked incident and sanitized delivery reads, incident history in the existing monitor detail view, and accurate Integrations support labels; verify private-ID rejection, duration/recovery display, delivery states, and unsupported-channel messaging.

## 3. Open-link demo and prepared evidence

- [x] 3.1 Add allowlisted demo list/detail/stats/checks/incidents GET endpoints keyed by server-only DEMO_USER_ID; verify unpublished IDs, mutations, account email, webhook destinations, and credentials are inaccessible, and document public response fields.
- [x] 3.2 Reuse monitor presentation in public `/demo` and `/demo/website/[websiteId]` views without weakening AppShell authentication; verify unauthenticated entry, live history, last-check time, incident inspection, and no account or mutation controls.
- [x] 3.3 Add loading, empty-history, stale, and API-error states with retry behavior; verify desktop/mobile layout, navigation, chart inspection, and data provenance using gstack browse.
- [x] 3.4 Add an idempotent preparation script, controlled healthy/switchable target, and local webhook receiver with operator-only controls; verify repeated preparation does not duplicate monitors or erase account/waitlist data, and document local versus remotely reachable target addresses.
- [x] 3.5 Add a compact landing demo link, architecture link, and capability-status wording within the current layout; verify destination links, preserve the developer count/cloud signup, and identify planned or unsupported features without unsupported numeric usage/SLA claims.
- [x] 3.6 Update the README's stale sample-dashboard statement and provide the exact demo setup, healthy/down/recovery walkthrough, and service start/hosting runbook; verify setup from a clean local environment and history generated through real checks rather than fabricated metrics.

## 4. End-to-end acceptance

- [x] 4.1 Run the full pipeline against the controlled target: observe healthy results, force two failures, inspect the incident and received webhook, restore health, and inspect duration/recovery delivery; verify the public demo exposes the resulting real evidence without login and record commands/results.
- [x] 4.2 Recheck authenticated create/edit/delete, private-account isolation, retry after a database failure, stale display after stopping the worker, and cloud signup/count behavior; verify targeted tests, workspace type checks, clean build, and browser checks pass without changing hosted databases.

## Workflow follow-up

- Review the proposal and select the implementation order before starting apply.
- Deployment, hosting credentials, domain choice, and production migration application are separate follow-up work.
- Archive only after the implemented scope and its validation have been reviewed; do not archive this planning-only change as delivered software.
