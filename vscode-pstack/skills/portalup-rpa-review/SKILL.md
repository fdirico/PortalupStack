---
name: portalup-rpa-review
description: RPA review for UiPath, Rocketbot, attended/unattended bots, credentials, queues, retries, orchestrators, logs, business exceptions, technical exceptions, maintainability, and production operations.
---

# PortalUP RPA Review

## Use

Use this skill for bot failures, RPA process design, orchestrator review, production hardening, and operational support.

Do not use it for generic workflow design unless bot execution or orchestration is central.

## Workflow

1. Identify platform, bot type, trigger, environment, and impacted process.
2. Separate business exceptions from technical exceptions.
3. Check credentials, queues, retries, selectors, timeouts, dependencies, and logs.
4. Recommend fix, monitoring, and rollback/contingency.

## Output

```text
Diagnosis
- ...

Exception classification
- Business | Technical | Mixed | Unknown

Validation steps
- ...

Operational risks
- ...

Recommended fix
- ...

Hardening recommendations
- ...
```

## Checklist

- Credentials and vault entries are valid.
- Queue item states and retry policies are sane.
- Selectors or screen targets are stable.
- Bot logs include correlation IDs and business keys.
- Manual contingency exists for critical business processes.

