# ADR 008: SIEM Architecture

## Status

Accepted

## Context

Enterprises require security events to be forwarded to their SIEM (Splunk, Microsoft Sentinel).

## Decision

- **Mechanism:** Use DB triggers on security-critical tables to enqueue events in a `siem_event_outbox`.
- **Dispatcher:** A dedicated edge function processes the outbox with exponential backoff retry.
- **Encryption:** Encryption keys for connector tokens are managed via Lovable Secrets and Web Crypto API.
- **Normalization:** Format events using CEF (Common Event Format) for standard compatibility.

## Consequences

- Real-time compliance reporting.
- High reliability via outbox pattern.
- Secure credential management.
