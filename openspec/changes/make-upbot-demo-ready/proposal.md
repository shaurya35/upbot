# Proposal

## Why

Upbot is shared with founders, CTOs, and CEOs as evidence of engineering ability. A visitor currently encounters a landing-page waitlist or an authenticated dashboard, while the most interesting implementation—the scheduler, Redis Streams consumer, HTTP checker, and historical results—is difficult to see. The goal is a convincing, working engineering showcase that can be understood in one minute and demonstrated end to end, rather than a complete commercial monitoring service.

## What Changes

- Add a public, read-only demo dashboard and website detail view using controlled demo monitors and real persisted check history. No signup or OTP is required to inspect the demo; ordinary accounts remain authenticated.
- Add a small demo entry link from the landing page, preserving its current design, cloud waitlist, and developer count. Make demo capabilities and limitations visible without a large explanatory wall.
- Make the demonstrated monitoring flow dependable: edits and deletion reach the scheduler, failed writes are not acknowledged, retried results do not duplicate, HEAD-rejecting targets have a bounded GET fallback, and stale results are visibly unknown.
- Add basic incidents and recovery with one working generic webhook channel, retryable delivery, and a small incident/event history. Existing unsupported channel types remain explicitly unavailable for delivery.
- Supply an operator-controlled HTTP target with healthy/down/recovered states, a repeatable walkthrough, and reproducible local setup. Build history by actually running the pipeline; any optional fixture history is separately labeled and never merged into live uptime metrics.
- Replace starter tests with targeted pipeline tests and a complete healthy → down → webhook → recovered walkthrough. Bring README setup/status and visible feature labels into agreement with this demo scope.

### Scope boundary

This change does not implement 15+ geographic execution locations, certificate-expiry monitoring, SMS/Slack/Telegram/Discord-specific delivery, subscription billing, a cloud onboarding product, multi-scheduler coordination, or an SLA. It does not attempt to substantiate the marketing page's numeric reliability/response claims through engineering changes. Those statements must be removed or labeled as planned/demo content when preparing the public showcase; this proposal does not authorize changing the user's already approved layout.

## Capabilities

### New Capabilities

- `demo-access`: Public read-only inspection of controlled monitoring data, with a clear entry point, reproducible walkthrough, and truthful data provenance.
- `monitoring-lifecycle`: Reliable observable check behavior across monitor edits, deletion, HTTP compatibility, persistence failures, retries, and stale results.
- `monitoring-incidents`: Confirmed outage/recovery incidents and retryable generic webhook notifications visible in the dashboard.

### Modified Capabilities

None. This is the repository's first OpenSpec change; existing behaviors being corrected are specified under the new capability contracts above.

## Impact

- `apps/client`: Reuse dashboard/detail presentation, add a public demo shell and incident history, and distinguish unavailable channels.
- `apps/server`: Add allowlisted read-only demo endpoints and incident reads while preserving account ownership checks.
- `apps/pusher`, `apps/worker`, `packages/redis-streams`, `apps/cfworkers`: Targeted monitoring correctness and webhook integration.
- `packages/store`: Stable check identity, incident state, and notification delivery records require an additive migration.
- `apps/web`: Small demo entry and claim/status alignment only; retain waitlist records and count behavior.
- `scripts`, tests, and docs: Controlled demo target, preparation/walkthrough scripts, setup and hosting instructions. A separate deployment request and hosting credentials are needed to publish; neither is part of creating this proposal.
