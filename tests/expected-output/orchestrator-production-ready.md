# Expected output: orchestrator production ready

Skill: `$portalup-orchestrator`

Minimum acceptable response:

- Detects release/production readiness intent.
- Classifies risk as High due to permissions, environment variables, and migration script.
- Selects `$portalup-ship`, `$portalup-cso`, and `$portalup-document-release`; includes `$portalup-careful` if migration risk is material.
- Includes validation, rollback, and context plan.
- Does not route to unrelated domain experts.

Score target: 85/100.
