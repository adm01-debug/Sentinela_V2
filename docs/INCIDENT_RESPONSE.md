# Incident Response Plan

## Overview

Procedures for handling production incidents.

## Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P1 | Complete outage | 15 minutes |
| P2 | Major feature broken | 1 hour |
| P3 | Minor issue | 4 hours |
| P4 | Low priority | 24 hours |

## Incident Commander

The IC is responsible for:
- Coordinating response
- Making decisions
- Communicating status
- Documenting actions

## Response Steps

### 1. Detect
- Monitoring alerts
- User reports
- Error spikes

### 2. Triage
- Assess severity
- Assign IC
- Create incident channel

### 3. Investigate
- Review logs
- Check metrics
- Identify root cause

### 4. Mitigate
- Apply fix or rollback
- Verify resolution
- Monitor for recurrence

### 5. Communicate
- Update status page
- Notify stakeholders
- Send post-incident email

### 6. Post-mortem
- Document timeline
- Identify root cause
- Define action items

## Communication Templates

### Status Update
```
[INCIDENT] Service degradation affecting [X]
Status: Investigating
Impact: [Description]
ETA: [Time] or "Investigating"
```

### Resolution
```
[RESOLVED] [Incident title]
Duration: [X] minutes
Root cause: [Brief description]
Full post-mortem to follow.
```

## Runbooks

See `/docs/RUNBOOK.md` for detailed procedures.
