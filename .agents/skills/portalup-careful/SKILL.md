---
name: portalup-careful
description: Safety guardrail adapted from GStack careful for destructive, irreversible, production-impacting, database, filesystem, deployment, or credential actions. Use before risky commands, deletes, force pushes, migrations, or production changes.
---

# PortalUP Careful

## Use

Use this skill when an action could delete data, rewrite history, alter production, expose secrets, or cause downtime.

Do not use it for read-only inspection.

## Workflow

1. Identify the risky action.
2. Read `references/gstack-careful-method.md` when the action is destructive or production-impacting.
3. State the blast radius.
4. Confirm backups, rollback, environment, and target path.
5. Ask for explicit confirmation when risk is material.
6. Prefer dry-run or read-only validation first.

## Output

```text
Risk level: critical | high | medium | low

Proposed action

Blast radius

Pre-flight checks

Safer alternative

Confirmation required
```

## Checklist

- Absolute paths are verified.
- Environment is confirmed.
- Backups or rollback exist.
- Command is scoped.
- User confirmation is explicit for destructive actions.

## References

- `references/gstack-careful-method.md`: adapted GStack destructive command guardrails.
