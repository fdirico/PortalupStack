# Actual output: orchestrator continuity handoff

Fixture: `tests/fixtures/orchestrator-continuity-handoff.md`
Skill: `$portalup-orchestrator`

Intent detected
- Preserve continuity so another agent can continue a long SQL incident investigation without reading the full conversation.

Stage
- incident + continuity

Domain
- SQL + operations

Risk
- high

Autonomy level
- route

Specialists selected
- `$portalup-investigate`: continue root-cause investigation if the cause remains unconfirmed.
- `$portalup-sql-review`: validate growth, backup, restore, capacity, and migration/remediation path.

Execution plan
- Create an `Agent Handoff Summary` for the next specialist.
- Create a `Continuity Summary` and save it under `outputs/sessions/YYYY-MM-DD-sql-growth-backup.md`.
- Keep confirmed facts and decisions; drop conversational repetition.
- Continue with restore validation and growth analysis before recommending production changes.

Context plan
- What to load: SQL size/growth evidence, backup history, restore-test status, incident timeline, affected systems.
- What to summarize: prior investigation, hypotheses, decisions, open risks.
- What to avoid: raw dumps, secrets, credentials, unrelated chat history.

Consolidated answer or next action
- Save needed: yes.
- Suggested file: `outputs/sessions/YYYY-MM-DD-sql-growth-backup.md`.
- Template: `templates/continuity-summary.md`.
- Handoff template: `templates/agent-handoff.md`.

Continuity summary
- Objective: continue SQL incident investigation.
- Facts: possible growth issue; backup exists but restore is not proven.
- Decisions: do not recommend migration/remediation until restore and growth evidence are validated.
- Risks: data loss, capacity limit, failed rollback, untested backup.
- Pending: verify DB size trend, backup history, restore test, largest tables, disk capacity, RTO/RPO.
- Next agent instructions: start with `$portalup-sql-review`; use `$portalup-investigate` if cause remains unclear.

Persistent continuity
- Save needed: yes.
- Suggested file: `outputs/sessions/YYYY-MM-DD-sql-growth-backup.md`.
- Template: `templates/continuity-summary.md`.

Evaluation
- Score: 92/100.
- Meets expected output: yes.
- Notes: Strong continuity and token guidance; correctly avoids sensitive raw data.
