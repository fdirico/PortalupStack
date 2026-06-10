# Expected output: orchestrator Codex to Claude handoff

Skill: `portalup-orchestrator`

Minimum acceptable response:

- Detects a multi-engine continuation from Codex to Claude Code.
- Uses only the provided handoff plus direct evidence needed for the next action.
- Does not request the full previous chat.
- Mentions Claude project assets: `CLAUDE.md` and `.claude/skills`.
- Selects specialists according to risk, such as `portalup-review`, `portalup-cso`, `portalup-ship`, and `portalup-careful` when production, migrations, permissions or destructive actions are involved.
- Produces a concrete continuation plan for Claude Code.
- Requires updated continuity output after the Claude session.

Score target: 90/100.
