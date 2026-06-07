# Actual output: orchestrator review users

Fixture: `tests/fixtures/orchestrator-review-users.md`
Skill: `$portalup-orchestrator`

Intent detected
- Review a sensitive application change before upload/merge.

Stage
- review

Domain
- general application code + security

Risk
- high

Autonomy level
- route

Specialists selected
- `$portalup-review`: review implementation quality, missing tests, deployment risk, and behavioral regressions.
- `$portalup-cso`: roles and active state are authorization-sensitive and can create privilege escalation or lockout risk.

Execution plan
- Inspect the changed endpoint/service, auth checks, role update rules, validation, audit behavior, and tests.
- Require negative-path tests for role escalation, inactive user behavior, self-update, wrong-tenant/object access, and unauthorized callers.
- Do not proceed to ship review until review/security blockers are cleared.

Context plan
- What to load: files changed in user module, auth/RBAC policy, tests, API schema, audit/logging path.
- What to summarize: previous user-management behavior and permissions model.
- What to avoid: unrelated frontend/UI files unless they changed this flow.

Consolidated answer or next action
- Route first to `$portalup-review` with `$portalup-cso` criteria included. Decision should be reject or approve with changes if tests/authz are not proven.

Continuity summary
- Objective: validate user update changes before upload.
- Facts: fields include email, roles, and active status.
- Decisions: use review + security review; treat as high risk.
- Risks: privilege escalation, object-boundary bypass, account lockout, missing audit trail.
- Pending: inspect code and run/define tests.
- Next agent instructions: focus only on user update flow and authorization boundary.

Evaluation
- Score: 90/100.
- Meets expected output: yes.
- Notes: Correctly routes without overloading context.
