# Changelog

## 0.4.0 - 2026-06-10

- Added `portalup-spec` for spec-driven development: 5-phase interrogation (Why → Scope → Technical → Draft → Document) that locks the "what" before planning or coding. Produces `docs/<topic>-spec.md` consumed by `portalup-autoplan`. Written in model-agnostic markdown — works with any LLM coding assistant.
- Upgraded `portalup-autoplan`: full multi-perspective gauntlet (CEO → Design → Eng → CSO); 6 explicit auto-decision principles; mandatory plan document `docs/<topic>-plan.md`; design review now always runs for tasks touching screens/components; test strategy and RBAC/CSV-security analysis are non-negotiable deliverables.
- Upgraded `portalup-orchestrator`: new features always route through `portalup-spec` before `portalup-autoplan`; `portalup-ui-modernization` now mandatory (not optional) for any task touching a screen or component; tests required before coding starts.
- Upgraded `portalup-review`: zero tests in a new module is now HIGH severity (was advisory); missing CSV injection protection is HIGH; new RBAC permission without reuse justification is HIGH; UI/design quality check added to checklist.
- Upgraded `portalup-ship`: zero tests in a new module is Blocked (no exceptions); missing CSV injection protection is Blocked; RBAC reuse preference explicit in checklist.
- Development workflow updated: `portalup-spec → portalup-autoplan → implement → portalup-review → portalup-ship`.
- Based on evidence from A/B evaluation: same feature built with GStack vs PortalUP Stack; GStack produced tests, plan doc, and CSV security; improvements close the gap while preserving PortalUP domain specialization.

## 0.3.0 - 2026-06-07

- Added `portalup-quality-gate` for professional Sonar-like quality controls, architecture/code quality validation, robust remediation, and evidence-based gate decisions.
- Added `portalup-ui-modernization` for modern client-grade UI/UX, responsive layouts, compact controls, visual polish, and design-context pushback.
- Added `docs/professional-delivery-standard.md` as the transversal quality bar for client-grade applications.
- Updated orchestrator routing so professional app development uses quality gates and UI modernization when relevant.
- Updated review and engineering plan skills to reject cosmetic fixes, require root-cause thinking, and identify static quality controls.
- Added `pstack quality` and `pstack modernize`.
- Added quality/UI fixtures and actual outputs; validation suite now covers 26 skills and 22 fixtures.

## 0.1.0 - 2026-06-07

- Created repository structure for PortalUP Stack Codex.
- Added Codex-compatible skill MVP.
- Added tracking and knowledge documentation.
- Added local install and validation scripts.
- Added initial templates and fixtures.
- Cloned and inventoried real GStack source as ignored `vendor/gstack`.
- Added missing roadmap skills aligned to GStack: QA-only, plan reviews, document release, autoplan, investigate, and careful.
- Added GStack-adapted methodology references for review, QA, ship, CSO, investigate, careful, and documentation.
- Added fixture expected outputs, fixture validator, and MVP evaluation results.
- Added PortalUP-specific BPM, AWS backup, and solution architecture skills.
- Added v0.1.0 release candidate notes.
- Added actual Codex fixture outputs and validation for evidence files.

## 0.2.0 - 2026-06-07

- Planned autonomous orchestrator phase.
- Added expert advisory skills for architecture, commercial strategy, and marketing strategy.
- Added `portalup-orchestrator` for natural-language routing, specialist selection, context planning, and continuity summaries.
- Added persistent continuity templates, `outputs/sessions`, and continuity validation.
- Added `pstack` prompt helper CLI, doctor, validation suite, negative safety fixtures, and v0.2.0 release notes.
