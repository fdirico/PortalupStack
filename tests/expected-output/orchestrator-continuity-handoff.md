# Expected output: orchestrator continuity handoff

Skill: `$portalup-orchestrator`

Minimum acceptable response:

- Detects continuity/handoff intent.
- Selects relevant specialists only if needed for continuation.
- Produces or recommends `Agent Handoff Summary` and `Continuity Summary`.
- Recommends saving to `outputs/sessions/YYYY-MM-DD-short-topic.md`.
- Includes token guidance: keep, summarize, drop.
- Warns not to store secrets, credentials, raw dumps, or unnecessary sensitive data.

Score target: 85/100.
