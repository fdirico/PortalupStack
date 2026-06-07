---
name: portalup-autoplan
description: Multi-perspective planning workflow adapted from GStack autoplan. Use for PortalUP initiatives that need strategy, design, engineering, QA, security, delivery tasks, and approval gates before implementation.
---

# PortalUP Autoplan

## Use

Use this skill for larger initiatives where one review perspective is not enough.

Do not use it for small fixes or one-file changes.

## Workflow

1. Capture request, context, constraints, and restore point.
2. Run strategic review with `$portalup-plan-ceo-review`.
3. Run engineering review with `$portalup-plan-eng-review`.
4. Add QA, CSO, documentation, and delivery checks when relevant.
5. Aggregate decisions, open questions, and implementation tasks.

## Output

```text
Autoplan status: approved | revise | blocked

Plan summary

Strategic findings

Engineering findings

QA and security considerations

Decision audit trail

Implementation tasks

Deferred work
```

## Checklist

- One decision per question.
- Bigger scope is justified by value.
- Engineering plan is actionable.
- Risks have owners or mitigations.
- Deferred work is explicit.

