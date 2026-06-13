---
name: portalup-bpm-review
description: Review BPM processes, workflow engines, approvals, queues, SLAs, integrations, forms, exceptions, auditability, bottlenecks, and production support risks for PortalUP business process automation work.
---

# PortalUP BPM Review

## Use

Use this skill for BPM process design, incident analysis, workflow optimization, approval chains, task queues, SLA review, and operational support.

Do not use it for generic project management unless there is a real workflow/process automation component.

## Workflow

1. Identify process, actors, systems, forms, states, queues, SLAs, and integrations.
2. Separate business rule issues from technical execution issues.
3. Review bottlenecks, exception paths, audit trails, permissions, and retry/reprocessing needs.
4. Recommend changes with validation, rollout, rollback, and operational ownership.

## Output

```text
Process diagnosis
- ...

Severity
- Critical | High | Medium | Low

Flow and state review
- ...

Risks
- ...

Validation steps
- ...

Recommended action
- ...

Rollback or contingency
- ...
```

## Checklist

- Process states are explicit and recoverable.
- Approvals, roles, escalations, and delegations are clear.
- Queues, stuck tasks, retries, and reprocessing are observable.
- Integrations have timeout, idempotency, and failure handling.
- Audit trail supports operational and compliance needs.
