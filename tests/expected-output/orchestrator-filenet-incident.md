# Expected output: orchestrator FileNet incident

Skill: `$portalup-orchestrator`

Minimum acceptable response:

- Detects production incident and FileNet/ICN/WebSphere domain.
- Classifies risk as High or Critical.
- Selects `$portalup-soporte-incidente` and `$portalup-filenet-review`; may include `$portalup-investigate`.
- Includes containment/rollback orientation before broad remediation.
- Includes evidence needed and continuity summary.

Score target: 85/100.
