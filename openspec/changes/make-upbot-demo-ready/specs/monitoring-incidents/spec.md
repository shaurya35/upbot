## Purpose

Demonstrate actionable uptime monitoring by turning confirmed failures into visible incidents and delivering generic webhook events for outages and recovery.

## ADDED Requirements

### Requirement: Confirmed outage and recovery
Two consecutive fresh DOWN observations for a monitor SHALL open one incident, dated from the first failure. The next fresh UP observation SHALL close that incident and record recovery time and duration. Missing, stale, or out-of-order observations SHALL NOT create false transitions.

#### Scenario: Confirmed outage
- **WHEN** a healthy monitor records two consecutive DOWN observations
- **THEN** one open incident is recorded with the first failure time and reason
- **AND** later DOWN observations extend that incident without opening another

#### Scenario: Transient failure
- **WHEN** one DOWN observation is followed by UP
- **THEN** no outage incident or outage notification is created

#### Scenario: Recovery
- **WHEN** an open incident receives a later fresh UP observation
- **THEN** that incident closes with recovery time and duration and produces one recovery event

#### Scenario: Old observation arrives late
- **WHEN** a retried observation predates the latest processed monitor observation or is already stale
- **THEN** it remains available in history but does not alter current incident state

### Requirement: Generic webhook delivery
An outage or recovery transition SHALL create a durable notification event for each active generic webhook channel belonging to that monitor's owner. Delivery SHALL use a stable event identity and include event type, monitor identity, observation time, and incident identity.

#### Scenario: Owner has a webhook
- **WHEN** an incident opens or recovers for a monitor whose owner has an active webhook channel
- **THEN** a corresponding event is delivered to that destination with an idempotency identifier
- **AND** other owners' channels receive nothing

### Requirement: Bounded delivery retries
Failed webhook attempts SHALL retry independently of new monitoring observations, preserve event identity, time out, and reach a visible failed state after five attempts. A successful delivery SHALL stop automatic retries.

#### Scenario: Receiver unavailable
- **WHEN** a webhook receiver times out or returns an unsuccessful status
- **THEN** the event remains scheduled for a later attempt until the attempt limit is reached
- **AND** the delivery status and attempt count are inspectable without disclosing the destination

#### Scenario: Receiver recovers
- **WHEN** a later attempt receives a successful status
- **THEN** delivery becomes sent and no more attempts are scheduled

### Requirement: Incident history and supported channel status
The monitor detail view SHALL show open and recovered incidents with start time, recovery time, duration, and reason. Integrations SHALL distinguish working generic webhook delivery from channel types not implemented in this change.

#### Scenario: Inspecting an incident
- **WHEN** a visitor or owner opens a monitor with incidents
- **THEN** the incident history and sanitized delivery state can be inspected
- **AND** unsupported email, SMS, and service-specific channels are not presented as working notification delivery
