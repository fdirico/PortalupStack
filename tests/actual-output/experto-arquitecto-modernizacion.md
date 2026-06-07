# Actual output: experto arquitecto modernizacion

Fixture: `tests/fixtures/experto-arquitecto-modernizacion.md`
Skill: `$portalup-arquitecto-experto`

Architectural position
- Recommend an incremental modernization path. Do not replace the whole document platform first. Stabilize operational visibility, isolate integration points, and improve traceability before deciding whether deeper platform replacement is justified.

Business and technical drivers
- Reduce operational failures and repeated incidents.
- Improve end-to-end traceability across FileNet, SQL Server, and RPA.
- Avoid a risky big-bang rewrite.
- Preserve existing FileNet investment while improving integration governance.
- Make support work observable and auditable.

Options considered
- Option A: Stabilize and wrap current platform. Add monitoring, correlation IDs, controlled integration APIs/queues, RPA exception handling, SQL validation, and support runbooks.
- Option B: Partial modernization. Keep FileNet as repository of record but replace fragile UI-driven automation with service/API integrations where possible.
- Rejected option: full rebuild/replatform as first step. It may be valid later, but current goals are continuity and traceability, and a full rebuild increases delivery and adoption risk without enough discovery evidence.

Recommended architecture
- FileNet remains the document system of record.
- SQL Server becomes explicit validation/state support where appropriate, not an undocumented shadow workflow.
- RPA bots are moved behind orchestrated queues, credential governance, retry rules, and exception taxonomy.
- Introduce a correlation ID per document/process from intake to FileNet registration.
- Add an operational dashboard for queue age, failures by cause, retries, and manual interventions.
- Document support runbooks and rollback for each integration path.

Tradeoffs
- Incremental modernization is safer and faster, but may preserve some legacy constraints.
- API-based integration is more robust than UI automation, but requires platform access and possibly more initial engineering.
- More observability adds process discipline, but also requires ownership and operational routines.

Risks and controls
- Risk: duplicate document creation. Control: idempotency keys and duplicate checks.
- Risk: bot credential failures. Control: vault ownership and expiry alerts.
- Risk: FileNet permission drift. Control: role review and audit.
- Risk: SQL state inconsistency. Control: reconciliation jobs and recovery process.
- Risk: support cannot diagnose failures. Control: correlation IDs, logs, and runbooks.

Implementation roadmap
- Phase 1: discovery of current flows, incidents, versions, integrations, pain points, and operational owners.
- Phase 2: observability and traceability baseline.
- Phase 3: stabilize RPA queues, retries, credentials, and exception handling.
- Phase 4: harden SQL validation and FileNet ingestion.
- Phase 5: evaluate replacement of fragile automation with service/API integrations.
- Phase 6: decide whether broader platform modernization is justified.

Validation plan
- Trace a sample document end to end.
- Replay known incident scenarios.
- Validate restore/reprocess path.
- Confirm FileNet permissions and audit events.
- Measure incident recurrence before and after stabilization.

Open decisions
- Which FileNet/ICN versions are in use?
- Which integrations are API-based versus UI-driven?
- What RTO/RPO and support hours are required?
- Who owns operational monitoring?
- Which failure classes are most expensive today?

Evaluation
- Score: 90/100.
- Meets expected output: yes.
- Notes: Strong strategic architecture output. It can feed `$portalup-arquitectura-solucion` for detailed design.
