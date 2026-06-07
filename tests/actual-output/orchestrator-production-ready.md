# Actual output: orchestrator production ready

Fixture: `tests/fixtures/orchestrator-production-ready.md`
Skill: `$portalup-orchestrator`

Intent detected
- Determine whether a completed feature is ready for production.

Stage
- release

Domain
- general + security + deployment

Risk
- high

Autonomy level
- ship

Specialists selected
- `$portalup-ship`: release readiness, tests, rollback, environment, migration, PR/deploy checklist.
- `$portalup-cso`: permission changes and environment variables require security review.
- `$portalup-careful`: migration scripts can be destructive or irreversible, so preflight/rollback is required.
- `$portalup-document-release`: update release notes, runbook, environment documentation, and migration notes.

Execution plan
- Review diff, tests, migration script, env vars, permission model, and rollback.
- Confirm migration dry run or staging run.
- Confirm secrets are not logged/committed.
- Define deployment window, backup, rollback, and post-deploy checks.
- Update documentation before release signoff.

Context plan
- What to load: changed files, migration script, env var list, permission changes, test results, deployment docs.
- What to summarize: release goal, affected users, rollback path, migration assumptions.
- What to avoid: unrelated domain docs and broad architecture review unless release checks reveal a design blocker.

Consolidated answer or next action
- Route to `$portalup-ship` with `$portalup-cso` and `$portalup-careful` gates. Do not mark ready until migration and permission checks are validated.

Continuity summary
- Objective: production readiness decision.
- Facts: feature complete; permissions, env vars, migration script changed.
- Decisions: high-risk release path; safety/security/docs required.
- Risks: auth regression, secret exposure, migration failure, rollback gap.
- Pending: staging validation, backup/rollback proof, documentation update.
- Next agent instructions: verify migration safety before any deploy recommendation.

Evaluation
- Score: 91/100.
- Meets expected output: yes.
- Notes: Correctly treats migration and permissions as release blockers.
