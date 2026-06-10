# Professional Quality Gate Reference

## Gate Areas

| Area | Checks |
| --- | --- |
| Architecture | clear boundaries, dependency direction, stable contracts, no accidental coupling |
| Code quality | complexity, duplication, naming, cohesion, dead code, fragile conditionals |
| Data and contracts | validation, schema drift, migrations, API compatibility, error semantics |
| Security | secrets, auth/authz, tenant boundaries, injection, dependency risk, sensitive logs |
| Testing | unit, integration, regression, negative paths, fixtures, deterministic coverage |
| Observability | logs, metrics, audit, correlation IDs, actionable errors |
| Performance | queries, N+1, pagination, caching, payload size, frontend rendering cost |
| UX quality | density, responsiveness, accessibility, loading/empty/error states |
| Delivery | build, lint, typecheck, CI, rollback, release notes, smoke tests |

## Sonar-like Controls

When the project supports them, prefer real tools:

- JavaScript/TypeScript: `npm run lint`, `npm run typecheck`, `npm test`, `npx tsc --noEmit`.
- Python: `ruff`, `black --check`, `mypy`, `pytest`, `bandit`, dependency audit.
- Java: Maven/Gradle tests, Checkstyle/SpotBugs/PMD, dependency audit.
- SQL: migration dry-run, explain plans, index checks, rollback scripts.
- General: secret scan, dependency scan, duplicated code scan, dead-code scan.

If tools are unavailable, report the gap and perform manual inspection against the gate areas.

## Remediation Standard

Every required fix should state:

- Root cause.
- Permanent correction.
- Files or modules likely affected.
- Tests or checks that prove the fix.
- Release or rollback risk.

Reject fixes that only rename, restyle, suppress warnings, add broad try/catch, hide errors, or bypass validation without removing the actual risk.
