# Expected output: orchestrator review users

Skill: `$portalup-orchestrator`

Minimum acceptable response:

- Detects review/correction intent without requiring the user to name `$portalup-review`.
- Classifies risk as High because roles and active state affect authorization.
- Selects `$portalup-review` and `$portalup-cso`, with reasons.
- Avoids invoking unrelated domain experts.
- Includes context plan, execution plan, and continuity summary.

Score target: 85/100.
