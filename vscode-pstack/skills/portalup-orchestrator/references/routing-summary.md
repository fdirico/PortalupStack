# Routing summary

Use the fewest specialists that can produce a correct answer.

## Common routes

| User intent | Specialists |
| --- | --- |
| Code/change review | `$portalup-review`; add `$portalup-cso` for sensitive auth, roles, secrets, data, IAM |
| Professional application development or hardening | `$portalup-plan-eng-review` + `$portalup-quality-gate`; add `$portalup-ui-modernization` for frontend/user-facing work |
| Sonar-like controls, code smells, maintainability | `$portalup-quality-gate`; add `$portalup-review` when code changes are needed |
| UI modernization, look and feel, responsive design | `$portalup-ui-modernization`; add `$portalup-qa` for validation |
| Production readiness | `$portalup-ship`; add `$portalup-cso` and `$portalup-document-release` when needed |
| Unknown technical failure | `$portalup-investigate`; add domain skill after hypothesis |
| Incident with client/user impact | `$portalup-soporte-incidente` + domain skill |
| FileNet/WebSphere/ICN | `$portalup-filenet-review` |
| RPA bot/orchestrator/queue | `$portalup-rpa-review` |
| BPM process/approval/SLA | `$portalup-bpm-review` |
| SQL/database/migration/performance | `$portalup-sql-review` |
| AWS S3 backup/restore | `$portalup-aws-backup-review`; add `$portalup-cso` before release |
| Strategic architecture | `$portalup-arquitecto-experto`; then `$portalup-arquitectura-solucion` for deliverable |
| Commercial opportunity | `$portalup-comercial-experto`; then `$portalup-propuesta-comercial` for proposal |
| Marketing/positioning/campaign | `$portalup-marketing-experto`; add `$portalup-comercial-experto` if offer strategy is needed |
| Large initiative | `$portalup-autoplan` plus relevant experts |

## Precedence

1. Safety and production risk first.
2. Investigation before fixes when cause is unclear.
3. Domain expert before generic skill.
4. Quality gate before claiming professional readiness.
5. Expert advisor before deliverable generator for strategy requests.
6. Stop when one specialist is enough.
