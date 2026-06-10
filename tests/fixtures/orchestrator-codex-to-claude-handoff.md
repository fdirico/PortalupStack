# Fixture: orchestrator Codex to Claude handoff

Usa `$portalup-orchestrator`.

Contexto: "Empece una tarea en Codex revisando permisos, migracion y readiness de produccion. Ya existe un handoff con objetivo, decisiones, archivos revisados, riesgos y proximos pasos. Ahora quiero continuar en Claude Code usando PortalUP Stack instalado en `.claude/skills`."

Salida esperada: detectar cambio de engine Codex -> Claude, cargar solo el handoff y evidencia directa necesaria, seleccionar especialistas segun riesgo (`portalup-review`, `portalup-cso`, `portalup-ship`, `portalup-careful` si aplica), no pedir historial completo, indicar como usar `CLAUDE.md` y `.claude/skills`, y producir siguiente paso operativo para Claude Code.
