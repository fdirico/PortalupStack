# GStack Ship Method Adaptation

Source: GStack `ship/` and `ship/sections/*`, MIT license.

## Release Gates

- Pre-flight: branch, status, scope, target environment, base branch.
- Tests: run required suites on merged code; triage failures instead of blindly stopping.
- Eval/prompt gates: if prompt or AI behavior changed, run relevant evals or document why not.
- Review readiness: review, adversarial checks, plan completion, test coverage, and release docs.
- Changelog and PR body: cover all substantive commits, not just recent work.
- Verification gate: smoke checks, health checks, and rollback readiness before push/deploy.

## Test Failure Ownership

Classify failures:

- In-branch regression: fix or block.
- Pre-existing: document, assign, or explicitly accept.
- Flaky: retry with evidence and document risk.
- Environment: verify separately and document.

## PortalUP Additions

- Include env vars, secrets, migrations, DB backups, and runtime workers.
- For customer-facing releases, include client message and support readiness.
- For production operational changes, include rollback and data restore plan.

