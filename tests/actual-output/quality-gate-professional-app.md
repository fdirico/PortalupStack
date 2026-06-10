# Actual output: quality gate professional app

Fixture: `tests/fixtures/quality-gate-professional-app.md`
Skill: `$portalup-quality-gate`

Quality gate: pass with conditions

Scope and evidence
- Scope: existing application for a large client.
- Evidence available in the prompt: business intent and quality bar only.
- Missing evidence: repository, architecture diagram, build command, lint/static analysis, typecheck, tests, dependency scan, security scan, performance data, UI screenshots.

Scorecard
| Area | Status | Evidence | Required action |
| --- | --- | --- | --- |
| Architecture | Unknown | No architecture evidence | Map modules, dependencies, data flow, auth boundaries, deployment model |
| Code quality | Unknown | No code or static output | Run lint/static analysis and inspect complexity, duplication, dead code |
| Testing | Unknown | No test evidence | Run automated tests and map coverage to critical flows |
| Security | Unknown | No auth/secret/dependency evidence | Run secrets/dependency checks and review auth/authz boundaries |
| Observability | Unknown | No logging/metrics evidence | Verify actionable errors, audit logs, correlation IDs |
| Performance | Unknown | No profiling evidence | Check queries, pagination, payload size, frontend rendering |
| UX/accessibility | Unknown | No screenshots or flows | Validate density, responsive behavior, contrast, states |

Findings
- [High] Evidence gap: the app cannot be declared professional without validation outputs. Impact: false readiness can hide client-facing defects. Root cause: no quality gate evidence supplied. Permanent fix: define and run required controls before approval.
- [High] Remediation risk: cosmetic changes would not address architecture/code/test weaknesses. Impact: defects return. Root cause: unclear root-cause analysis process. Permanent fix: require each fix to include cause, code change, test, and verification.

Required controls
- Build: run the project build command.
- Lint/static analysis: run available linter or Sonar-like scanner.
- Typecheck: run TS/mypy/compiler checks when available.
- Tests: run unit, integration, regression, negative paths.
- Security/dependencies: scan secrets, auth/authz, dependencies, sensitive logs.
- Performance: inspect queries, payloads, frontend render cost.
- UX/accessibility: validate responsive screenshots, states, contrast, keyboard focus.

Remediation plan
- Establish baseline evidence.
- Triage Critical/High findings first.
- Fix root causes, not presentation symptoms.
- Add regression tests for each high-risk correction.
- Re-run controls and document residual risk.

Verification
- Gate can pass only after evidence is attached or command results are recorded.

Evaluation
- Score: 92/100.
- Meets expected output: yes.
- Notes: Correctly refuses to treat missing evidence as readiness and enforces permanent fixes.
