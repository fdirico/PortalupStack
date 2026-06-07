# Expected output: code review FastAPI

Skill: `$portalup-review`

Minimum acceptable response:

- Decision is reject or approve with changes due to missing tests and authorization uncertainty.
- Findings include auth/authz risk, role escalation risk, tenant/object boundary risk, input validation, auditability, and missing negative-path tests.
- Recommends denied-case tests, role modification tests, self-update tests, inactive user behavior, and API contract tests.
- Mentions not trusting copied authorization without reading the original module and verifying required permissions.
- Notes deployment risk if endpoint can deactivate users or modify roles.

Score target: 85/100.

