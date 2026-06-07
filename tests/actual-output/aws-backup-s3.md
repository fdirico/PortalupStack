# Actual output: AWS backup S3

Fixture: `tests/fixtures/aws-backup-s3.md`
Skills: `$portalup-aws-backup-review`, `$portalup-cso`, `$portalup-ship`

Backup readiness
- Ready with changes. The design can proceed only after security controls, retention rules, monitoring, and at least one restore test are validated.

Security review
- IAM must use least privilege for write/read/list/delete operations. Avoid broad `s3:*` policies and unmanaged long-lived access keys.
- S3 public access block must be enabled.
- Bucket policy should restrict access to approved principals, network paths if applicable, and expected prefixes.
- Enable server-side encryption and define KMS key ownership/rotation if SSE-KMS is used.
- Do not place access keys in scripts, logs, shared folders, or repository files.
- Enable CloudTrail/S3 data events or equivalent audit trail for sensitive backup access.

Retention and recovery review
- Define RTO/RPO, backup schedule, retention by server/application, lifecycle transitions, versioning, and deletion protection.
- Consider object lock or protected retention for ransomware/delete protection if business risk requires it.
- Separate backup prefixes/accounts/roles where needed to reduce blast radius.
- Validate that Windows and Linux backups preserve required metadata and can be restored to usable systems.

Validation steps
- Confirm source server list, OS versions, backup agent/tool, schedule, and owner.
- Validate bucket policy and IAM simulator result for expected operations.
- Confirm encryption on uploaded objects.
- Run restore test before production acceptance and document elapsed time.
- Simulate failed upload and alert path.
- Confirm lifecycle expiration does not delete required recovery points.

Release blockers
- No restore test.
- No defined RTO/RPO.
- Credentials stored outside a managed vault or IAM role.
- Bucket allows public access or broad delete permission.
- No monitoring/alerting for failed backups.

Rollback or contingency
- Keep current backup mechanism active until S3 restore test passes and monitoring is stable.
- If rollout fails, disable scheduled S3 backup job, preserve logs, and continue with previous backup process.

Operational notes
- Document runbook: daily check, failed backup response, restore process, credential/key owner, escalation, and monthly restore sampling.

Evaluation
- Score: 89/100.
- Meets expected output: yes.
- Notes: Strong MVP output. V1 can add provider-specific policy examples.
