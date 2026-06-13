---
name: portalup-aws-backup-review
description: Review AWS backup designs for Windows and Linux servers using S3, IAM, encryption, retention, lifecycle, object lock, monitoring, restore testing, rollback, and operational ownership.
---

# PortalUP AWS Backup Review

## Use

Use this skill for AWS backup architecture, S3 backup rollout, restore readiness, retention design, security review, and operational hardening.

Do not use it as a substitute for legal, compliance, or cloud billing advice. Flag those as dependencies when needed.

## Workflow

1. Identify backup source, target buckets, regions, schedule, retention, RTO/RPO, and restore owner.
2. Review IAM, encryption, network access, public access block, lifecycle, object lock, logs, and secrets.
3. Check restore test, monitoring, alerting, failure handling, and rollback.
4. Produce launch decision, blockers, and operational runbook notes.

## Output

```text
Backup readiness
- Ready | Ready with changes | Blocked

Security review
- ...

Retention and recovery review
- ...

Validation steps
- ...

Release blockers
- ...

Rollback or contingency
- ...

Operational notes
- ...
```

## Checklist

- IAM follows least privilege and avoids long-lived unmanaged keys.
- S3 public access is blocked and bucket policy is explicit.
- Encryption and key ownership are defined.
- Retention, lifecycle, versioning, and object lock are appropriate for the risk.
- Restore test is executed before production acceptance.
- Monitoring, alerts, and ownership are documented.
