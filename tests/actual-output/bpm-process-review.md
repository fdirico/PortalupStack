# Actual output: BPM approval bottleneck

Fixture: `tests/fixtures/bpm-process-review.md`
Skill: `$portalup-bpm-review`

Process diagnosis
- The process has a High severity bottleneck if purchase approvals are SLA-bound or block procurement operations for more than 48 hours.
- Current evidence is insufficient to choose a single cause. The most likely areas are supervisor queue assignment, escalation/SLA rules, ERP integration response, or a business rule that is routing tasks incorrectly.

Severity
- High, pending confirmation of business impact, number of blocked requests, and financial/operational consequence.

Flow and state review
- Identify the exact process version, affected task node, queue name, roles/groups, and number/age of stuck tasks.
- Review whether tasks are waiting for human approval, integration callback, rule evaluation, or retry.
- Confirm if supervisors can see the tasks and whether delegation/escalation is configured.
- Check audit trail for state transitions before the queue stall.

Risks
- Purchases may breach internal SLA or delay operations.
- Manual reassignment without evidence can skip approval controls.
- Reprocessing can duplicate ERP requests if integration idempotency is weak.
- Lack of audit trail can create compliance issues.

Validation steps
- Export stuck task list with creation time, owner/group, process instance ID, and business key.
- Review BPM engine logs around the first stuck timestamp.
- Validate supervisor role/group membership and recent identity changes.
- Review SLA/escalation configuration and calendar rules.
- Check ERP integration logs, timeouts, error responses, and pending callbacks.
- Compare with a successful approval instance from the same process version.

Recommended action
- First contain: reassign a small controlled sample only after confirming it does not bypass required approvals.
- Fix based on evidence: correct role mapping, repair escalation rule, patch integration retry/callback handling, or adjust routing business rule.
- Add monitoring for queue age, stuck task count, and integration failures.

Rollback or contingency
- Use a documented manual approval path for urgent purchases while preserving approval evidence.
- If a process change caused the issue, roll back to the last working process version and migrate/retry affected instances under change control.

Open questions
- Which BPM engine is used?
- How many tasks and purchase values are affected?
- Was there a recent role, ERP, calendar, or process deployment change?
- Are SLAs contractual or internal?

Evaluation
- Score: 84/100.
- Meets expected output: yes.
- Notes: Solid MVP. V1 should add engine-specific checks.
