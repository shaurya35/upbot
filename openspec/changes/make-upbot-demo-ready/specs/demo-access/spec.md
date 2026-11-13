## Purpose

Let prospective collaborators inspect Upbot's working monitoring behavior without creating an account, while keeping demonstration data separate from private accounts.

## ADDED Requirements

### Requirement: Public demo entry
The landing page SHALL offer a demo entry that opens a populated read-only monitor list without login or email verification, while retaining the cloud signup and existing developer count.

#### Scenario: First-time visitor
- **WHEN** a visitor without a session opens the demo entry
- **THEN** they see named demo monitors with status, last-check time, and response-time information without an authentication prompt
- **AND** the landing page cloud signup and count behavior remain available

### Requirement: Demo data isolation
Unauthenticated demo access SHALL expose only explicitly published demo monitors and sanitized history, and SHALL NOT allow monitor or channel mutations or expose account details and notification credentials.

#### Scenario: Inspecting a demo monitor
- **WHEN** a visitor opens a published demo monitor
- **THEN** they can inspect check history, response-time charts, incidents, and sanitized webhook delivery status
- **AND** private account details and delivery destinations are absent

#### Scenario: Accessing another account
- **WHEN** an unauthenticated visitor requests an unpublished monitor or attempts a write
- **THEN** access is rejected without revealing private monitor data

### Requirement: Honest and understandable demo state
The demo SHALL identify live results and their execution location, distinguish optional sample history from live metrics, and make data unavailability visible instead of showing fabricated healthy results.

#### Scenario: Real history available
- **WHEN** the demo has persisted check history
- **THEN** charts and status use that history and display its last observation time
- **AND** the configured single execution location is not presented as verified multi-region coverage

#### Scenario: Data unavailable
- **WHEN** history cannot be loaded or checks become stale
- **THEN** the demo displays an explicit unavailable or stale state with a retry action
- **AND** it does not replace unavailable results with invented measurements

### Requirement: Reproducible walkthrough
The project SHALL document a repeatable local walkthrough that produces real healthy, down, and recovered check results and webhook events against an operator-controlled target without requiring visitor email delivery.

#### Scenario: Preparing a demonstration
- **WHEN** an operator follows the documented local setup and walkthrough
- **THEN** a published test monitor produces healthy results, an outage incident and webhook event, and a closed recovery incident and webhook event
- **AND** the same walkthrough can be repeated without duplicate monitors or deleting private or waitlist records
