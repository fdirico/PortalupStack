---
name: portalup-investigate
description: Root-cause investigation workflow adapted from GStack investigate. Use for debugging PortalUP issues before applying fixes, especially when cause is unclear, symptoms are misleading, or multiple systems are involved.
---

# PortalUP Investigate

## Use

Use this skill when the first job is to understand the cause, not to patch immediately.

Do not use it when the root cause and fix are already obvious.

## Workflow

1. State symptoms and impact.
2. Read `references/gstack-investigate-method.md` for root-cause phases and stop conditions.
3. Gather evidence from code, logs, configs, data, and recent changes.
4. Build hypotheses without committing to one too early.
5. Test hypotheses in order.
6. Only then propose fix and verification.

## Output

```text
Investigation status

Symptoms

Facts

Hypotheses

Evidence gathered

Most likely root cause

Fix options

Verification plan
```

## Checklist

- No fix before evidence.
- Recent changes are checked.
- Logs/config/data are considered.
- Alternative hypotheses are retired explicitly.
- Verification proves the cause, not just symptom disappearance.

## References

- `references/gstack-investigate-method.md`: adapted GStack root-cause investigation flow.
