---
name: portalup-sql-review
description: SQL Server and PostgreSQL review for performance, backups, indexes, jobs, permissions, growth, migrations, Express vs Standard constraints, collation, CPU, memory, and production database risk.
---

# PortalUP SQL Review

## Use

Use this skill for database health, migration, performance, backup, licensing constraints, and operational review.

Do not use it as a replacement for executing DBA commands; provide safe validation steps and mark assumptions.

## Workflow

1. Identify engine, version, edition, database size, workload, and symptom.
2. Check capacity, backups, indexes, blocking, jobs, permissions, growth, collation, and maintenance.
3. Rank risks and propose validations.
4. Recommend migration or remediation plan.

## Output

```text
Database assessment
- ...

Main risks
- [Severity] ...

Validation queries or checks
- ...

Recommended actions
- ...

Migration/rollback notes
- ...
```

## Checklist

- SQL Server Express limits are considered when applicable.
- Backups have frequency, retention, restore test, and storage target.
- Index recommendations are tied to workload evidence.
- Permissions follow least privilege.
- Growth settings and disk capacity are reviewed.
- Migration includes downtime, validation, and rollback.

