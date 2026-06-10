# Actual output: orchestrator Codex to Claude handoff

The orchestrator should treat this as a multi-engine continuation, not as a new task.

Recommended response:

- Engine transition: Codex -> Claude Code.
- Active method: PortalUP Stack through `CLAUDE.md` and `.claude/skills`.
- Context loading policy: use only the handoff summary, referenced files, and direct evidence needed for the next action. Do not ask for the full previous conversation.
- Specialists:
  - `portalup-review` for implementation correctness.
  - `portalup-cso` for permissions/auth/security impact.
  - `portalup-ship` for production readiness.
  - `portalup-careful` if migrations, destructive operations, rollback, credentials, production data, or database changes are involved.
- Claude Code prompt:

```text
Usa portalup-orchestrator. Continua esta tarea desde el siguiente handoff. No cargues el historial completo; usa solo el resumen y evidencia directa necesaria. Selecciona especialistas PortalUP segun riesgo y deja un nuevo resumen de continuidad al cerrar.
```

Continuation checklist:

- Confirm objective and current state.
- Read the handoff.
- Inspect only referenced files or commands.
- Execute the next safe validation step.
- Record decisions, risks, changed files and validation results.
- Write a new continuity summary for the next engine or agent.

## Evaluation

Score: 92/100.

Meets expected output: yes.

Notes:

- Covers multi-engine continuation.
- Avoids requesting full chat history.
- Names Claude project assets and relevant PortalUP specialists.
- Leaves a concrete continuation prompt and checklist.
