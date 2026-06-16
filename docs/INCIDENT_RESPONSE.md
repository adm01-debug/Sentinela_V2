# Incident Response Guide

## Overview
Standard procedures for handling production incidents.

## Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| SEV1 | Critical - Service down | 15 minutes | Complete outage, data breach |
| SEV2 | Major - Degraded service | 30 minutes | Partial outage, slow response |
| SEV3 | Minor - Limited impact | 4 hours | Feature broken, minor bug |
| SEV4 | Low - Minimal impact | 24 hours | UI issue, typo |

## Response Process

### 1. Detection
- Automated monitoring alerts
- User reports via support
- Internal discovery

### 2. Triage
```
□ Verify the incident
□ Assess severity level
□ Identify affected systems
□ Page appropriate responders
```

### 3. Response
```
□ Establish incident commander
□ Create incident channel (#incident-YYYYMMDD-N)
□ Begin investigation
□ Implement mitigation
□ Communicate status updates
```

### 4. Resolution
```
□ Confirm fix deployed
□ Verify services restored
□ Monitor for recurrence
□ Update status page
```

### 5. Post-Incident
```
□ Schedule post-mortem (within 48 hours)
□ Write incident report
□ Identify action items
□ Update runbooks
```

## Roles & Responsibilities

### Incident Commander (IC)
- Coordinates response efforts
- Makes decisions on response actions
- Manages communication
- Escalates as needed

### Technical Lead
- Investigates root cause
- Implements fixes
- Coordinates with other engineers

### Communications Lead
- Updates status page
- Notifies stakeholders
- Prepares customer communications

## Communication Templates

### Initial Acknowledgment
```
**Incident Detected**

We are investigating reports of [issue description].

Impact: [affected services/users]
Status: Investigating
Next Update: [time]
```

### Progress Update
```
**Update - [Incident Name]**

Current Status: [Investigating/Identified/Monitoring/Resolved]
Impact: [current impact]
Actions Taken: [brief description]
Next Steps: [planned actions]
Next Update: [time]
```

### Resolution Notice
```
**Resolved - [Incident Name]**

The incident has been resolved.

Duration: [start time] to [end time]
Impact: [summary of impact]
Root Cause: [brief description]
Follow-up: Post-mortem scheduled for [date]
```

## Escalation Matrix

| Severity | Primary | Secondary | Executive |
|----------|---------|-----------|-----------|
| SEV1 | On-call Engineer | Team Lead | CTO |
| SEV2 | On-call Engineer | Team Lead | - |
| SEV3 | On-call Engineer | - | - |

## Post-Mortem Template

```markdown
# Incident Post-Mortem: [Title]

## Summary
- **Date**: YYYY-MM-DD
- **Duration**: X hours Y minutes
- **Severity**: SEV[N]
- **Impact**: [description]

## Timeline
- HH:MM - Event/action
- HH:MM - Event/action

## Root Cause
[Detailed explanation]

## Resolution
[What fixed the issue]

## Lessons Learned
- What went well
- What could be improved

## Action Items
- [ ] Action 1 - Owner - Due date
- [ ] Action 2 - Owner - Due date
```

## Related Documentation
- [RUNBOOK.md](./RUNBOOK.md)
- [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md)
- [MONITORING.md](./MONITORING.md)

