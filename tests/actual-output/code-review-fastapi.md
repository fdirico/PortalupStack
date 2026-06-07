# Actual output: code review FastAPI

Fixture: `tests/fixtures/code-review-fastapi.md`
Skill: `$portalup-review`

Decision: reject

Executive summary
- The endpoint should not be shipped yet. It can modify sensitive user fields (`roles`, `is_active`, `email`) and the authorization logic was copied from another module without evidence that it protects this specific resource and operation.
- The main blocker is authorization and object-level permission risk. Missing automated tests increases the chance of role escalation, unauthorized deactivation, or tenant/user boundary bypass.

Findings
- [High] Authorization: copied authorization may not match user administration semantics. Verify required permission, role hierarchy, tenant boundary, self-update rules, and whether the actor can modify roles or deactivate users.
- [High] Role escalation: accepting `roles` directly can allow privilege expansion if the endpoint does not enforce allowed role transitions server-side.
- [High] Object-level access: `user_id` must be checked against the caller scope. Do not rely only on route-level auth.
- [Medium] Input validation: validate email format, duplicate email behavior, allowed role values, empty role list, and `is_active` transitions.
- [Medium] Auditability: updates to roles and activation state should write an audit event with actor, target user, changed fields, timestamp, and correlation ID.
- [Medium] Missing tests: no automated coverage for a sensitive endpoint is a release blocker.

Tests recommended
- Authorized admin can update allowed fields.
- Non-admin and wrong-tenant users are denied.
- User cannot grant themselves or others higher roles without explicit permission.
- Self-deactivation and deactivation of last admin are blocked or explicitly handled.
- Invalid email, duplicate email, invalid role, empty role, and inactive target cases are covered.
- Audit event is emitted for role and activation changes.

Deployment and rollback risks
- A bad deployment could lock users out, disable administrators, or grant excessive access.
- Rollback should include reverting the endpoint and reviewing audit logs for changes made during exposure.

Open questions
- What permission is required for changing roles versus email versus active state?
- Is this multi-tenant?
- Are role changes constrained by a role hierarchy?
- Is there an existing audit table or event stream for user administration?

Evaluation
- Score: 87/100.
- Meets expected output: yes.
- Notes: Strong enough for MVP. A real code diff would improve file/path-specific findings.
