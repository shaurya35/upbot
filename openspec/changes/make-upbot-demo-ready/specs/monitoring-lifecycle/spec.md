## Purpose

Make monitoring observations dependable enough for a repeatable engineering demonstration and ordinary local use across edits, deletion, retries, and worker interruptions.

## ADDED Requirements

### Requirement: Monitor settings take effect
Monitoring SHALL use the latest saved URL and interval after the configured refresh period plus one scheduler poll, and SHALL stop starting new checks for a deleted monitor after that bound. Results from work already in flight SHALL NOT recreate a deleted monitor.

#### Scenario: Edit an existing monitor
- **WHEN** an owner changes a monitor URL or interval
- **THEN** subsequent jobs use the new settings within the documented refresh bound
- **AND** a second schedule for the previous settings is not retained

#### Scenario: Delete a monitor
- **WHEN** an owner deletes a scheduled monitor
- **THEN** the monitor is removed from scheduling within the refresh bound
- **AND** previously queued work is skipped when the consumer observes the deletion

### Requirement: Persistence precedes acknowledgement
A check job SHALL remain recoverable when storing its results fails. Retrying a previously stored job SHALL NOT add duplicate results or repeat incident transitions, and stored observations SHALL retain their observation time rather than the retry time.

#### Scenario: Database insert fails
- **WHEN** processing obtains check results but cannot persist them
- **THEN** the job is not acknowledged as completed and can be retried

#### Scenario: Acknowledgement is interrupted
- **WHEN** a stored job is delivered again after an acknowledgement interruption
- **THEN** its existing observations are reused without duplicate check rows, incidents, or notification events
- **AND** its recorded observation time remains unchanged

### Requirement: HTTP compatibility
HTTP monitoring SHALL retry a target with GET when HEAD returns 405 or 501. Both requests together SHALL respect the configured check deadline, and the fallback SHALL NOT download an unbounded response body.

#### Scenario: HEAD unsupported
- **WHEN** HEAD returns 405 and GET returns 200 within the deadline
- **THEN** the result is UP with status code 200

#### Scenario: Deadline exhausted
- **WHEN** the target does not respond within the shared check deadline
- **THEN** the result is DOWN with a timeout reason

### Requirement: Stale observations are visible
Current status SHALL become UNKNOWN when the latest observation is older than the greater of three configured check intervals and 120 seconds. Last observation time and historical results SHALL remain visible, and missing observations SHALL NOT be represented as continuous uptime.

#### Scenario: Workers stop
- **WHEN** no new observation arrives before the freshness threshold
- **THEN** the monitor list and detail view display stale or unknown status instead of continuing to display current UP
- **AND** the UI labels historical percentages as observed-check uptime rather than guaranteed elapsed-time availability
