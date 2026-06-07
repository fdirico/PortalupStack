# Continuidad de sesiones

## Objetivo

La continuidad persistente permite que otro agente retome una tarea sin cargar toda la conversacion previa. El objetivo es reducir tokens y preservar decisiones, riesgos y pendientes.

## Donde guardar continuidad

Guardar resumentes en:

```text
outputs/sessions/
```

Nombre recomendado:

```text
YYYY-MM-DD-tema-corto.md
```

## Cuando crear un resumen

Crear un `Continuity Summary` cuando:

- La tarea cambia de etapa.
- Intervienen varios especialistas.
- Se tomaron decisiones importantes.
- Hay riesgos abiertos.
- La conversacion ya es larga.
- Otro agente podria continuar el trabajo.

## Que debe incluir

Usar `templates/continuity-summary.md`.

Secciones obligatorias:

- `Status`
- `Completed`
- `Validated`
- `Remaining`
- `Risks`
- `Decisions`
- `Files Or Evidence`
- `Next Agent Instructions`
- `Token Budget`

## Handoff entre especialistas

Usar `templates/agent-handoff.md` antes de pasar de un especialista a otro.

Ejemplo:

```text
$portalup-orchestrator -> $portalup-arquitecto-experto -> $portalup-arquitectura-solucion
```

El primer especialista no debe recibir toda la conversacion. Debe recibir un resumen con objetivo, hechos, hipotesis, evidencia, decisiones, riesgos y pendientes.

## Reglas de seguridad

- No guardar secretos.
- No guardar credenciales.
- No guardar dumps productivos sin redaccion.
- No guardar datos personales innecesarios.
- No guardar informacion comercial sensible sin marcarla como confidencial.

## Validacion

Ejecutar:

```powershell
node scripts\validate-continuity.js
```
