# Expected output: AWS backup S3

Skills: `$portalup-aws-backup-review`, `$portalup-cso`, `$portalup-ship`

Minimum acceptable response:

- AWS backup review checks source servers, schedule, RTO/RPO, S3 bucket design, lifecycle, versioning, object lock if needed, monitoring, and restore ownership.
- CSO review checks IAM least privilege, S3 bucket policy, encryption, key management, public access block, audit logs, and credential handling.
- Ship review checks backup schedule, restore validation, monitoring, retention, rollback, target environments, and operational ownership.
- Includes restore test as release blocker.
- Includes risk for ransomware/delete protection and accidental overwrite.
- Avoids exposing bucket names, access keys, or sensitive infrastructure details unless provided and explicitly needed.

Score target: 85/100.
