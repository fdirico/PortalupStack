# Actual output: orchestrator FileNet incident

Fixture: `tests/fixtures/orchestrator-filenet-incident.md`
Skill: `$portalup-orchestrator`

Intent detected
- Triage and contain a production document management incident.

Stage
- incident

Domain
- FileNet / IBM Content Navigator / WebSphere

Risk
- critical

Autonomy level
- route

Specialists selected
- `$portalup-soporte-incidente`: structure diagnosis, client impact, containment, communication, and action plan.
- `$portalup-filenet-review`: analyze ICN plugin, WebSphere classpath, missing dependency, deployment, and rollback.
- `$portalup-investigate`: use before applying a fix if the missing class/dependency source is not confirmed.

Execution plan
- Contain first: consider disabling/removing the new plugin or restoring the previous plugin if the desktop is blocked.
- Gather exact class name, stack trace, WebSphere logs, ICN plugin registration, package contents, deployment timestamp, and previous working artifact.
- Validate whether the dependency is missing, misplaced, or conflicting in classloader scope.
- Communicate client-safe status and avoid blame until evidence is confirmed.

Context plan
- What to load: WebSphere logs, ICN plugin config, plugin package contents, deployment notes.
- What to summarize: impact, timeline, changed artifact, affected desktop/users.
- What to avoid: unrelated FileNet repository operations unless logs point there.

Consolidated answer or next action
- Route to incident + FileNet specialist immediately. Start with rollback/disable option because production users are blocked.

Continuity summary
- Objective: restore ICN desktop after plugin deployment failure.
- Facts: production users blocked; WebSphere has `ClassNotFoundException`; new plugin was deployed.
- Decisions: critical incident; containment before deep remediation.
- Risks: prolonged outage, bad rollback, classloader conflict, repeated failed deploy.
- Pending: exact missing class, package verification, rollback decision.
- Next agent instructions: do not prescribe rebuild until artifact/classloader evidence is checked.

Evaluation
- Score: 91/100.
- Meets expected output: yes.
- Notes: Strong routing and containment bias.
