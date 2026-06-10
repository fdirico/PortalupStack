# Continuidad Codex -> Claude Code

Este flujo permite iniciar una tarea en Codex y continuarla en Claude Code usando PortalUP Stack.

## Requisitos

- Paquete Claude generado o instalado en el proyecto objetivo.
- `CLAUDE.md` presente en el proyecto.
- Skills en `.claude/skills`.
- Handoff creado desde Codex usando `templates/agent-handoff.md` o `templates/continuity-summary.md`.

## Instalacion en proyecto Claude

Dry-run:

```powershell
.\scripts\install-claude-project.ps1 "D:\ruta\de\tu-proyecto" -DryRun
```

Instalar sobrescribiendo assets PortalUP existentes:

```powershell
.\scripts\install-claude-project.ps1 "D:\ruta\de\tu-proyecto" -Force
```

El instalador copia:

```text
CLAUDE.md
.claude/skills/
templates/
```

Por seguridad, si esos destinos ya existen y no se usa `-Force`, el script falla sin sobrescribir.

## Prompt de continuidad en Claude

```text
Usa portalup-orchestrator. Continua esta tarea desde el siguiente handoff.
No cargues el historial completo; usa solo el resumen y evidencia directa necesaria.
Selecciona especialistas PortalUP segun riesgo y deja un nuevo resumen de continuidad al cerrar.

[pegar handoff aqui]
```

## Criterios de aceptacion

- Claude identifica que la tarea viene de Codex.
- Usa `portalup-orchestrator` como punto de entrada.
- No pide el historial completo.
- Selecciona especialistas segun riesgo.
- Respeta `CLAUDE.md` y `.claude/skills`.
- Produce nuevo handoff al cerrar.
