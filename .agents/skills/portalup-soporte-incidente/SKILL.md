---
name: portalup-soporte-incidente
description: Incident support workflow for PortalUP technical issues, production outages, FileNet/RPA/SQL/AWS/application problems, client communication, diagnostics, hypotheses, validation steps, contingency, definitive fix, and postmortem.
---

# PortalUP Soporte Incidente

## Use

Use this skill when the user reports a technical problem and needs diagnosis, validation steps, contingency, client message, or postmortem.

Do not use it for normal feature QA unless there is an incident or operational failure.

## Workflow

1. Capture impact: who, what, since when, environment, severity.
2. Separate facts, assumptions, and hypotheses.
3. Define immediate containment.
4. Provide validation steps and commands/logs to review.
5. Recommend definitive fix and prevention.
6. Draft client communication.

## Output

```text
Incident summary

Severity
- Critical | High | Medium | Low

Facts
- ...

Hypotheses
- ...

Immediate containment
- ...

Validation plan
- ...

Definitive solution
- ...

Client message
- ...

Post-incident actions
- ...
```

## Checklist

- Avoid blaming without evidence.
- Give the safest immediate action first.
- Include rollback or contingency.
- Ask for missing timestamps, logs, versions, and recent changes.
- Provide customer-safe wording.

