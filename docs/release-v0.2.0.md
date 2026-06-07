# Release v0.2.0

Estado: cerrado para pruebas generales.

## Alcance incluido

- `portalup-orchestrator` para interpretar pedidos naturales y enrutar especialistas.
- Expertos consultivos: arquitectura, comercial y marketing.
- Continuidad persistente con `outputs/sessions/`.
- Plantillas `agent-handoff` y `continuity-summary`.
- CLI helper `pstack`.
- Exportador Windows `scripts/export-skills.ps1`.
- Doctor y validacion general.
- Fixtures negativos para secretos, acciones destructivas y ambiguedad comercial.

## Validaciones generales

```powershell
node scripts\validate-all.js
node scripts\doctor.js
```

Validadores incluidos:

- `validate-skills.js`
- `validate-fixtures.js`
- `validate-actual-outputs.js`
- `validate-continuity.js`
- `validate-cli.js`

## Uso rapido

```powershell
.\scripts\pstack.ps1 ask "Tengo cambios de permisos y migracion. Quiero saber si esta listo para produccion."
```

O directamente en Codex:

```text
Usa $portalup-orchestrator. Tengo cambios de permisos y migracion. Quiero saber si esta listo para produccion.
```

## Cierre funcional

- El usuario puede pedir tareas sin nombrar skills.
- El orquestador selecciona especialistas.
- El sistema conserva continuidad en archivos.
- El CLI genera prompts listos para Codex.
- La instalacion ejecuta validaciones y doctor.
- La fase de browser/QA visual queda separada para Fase 3.

## Estado esperado

- 24 skills.
- 20 fixtures.
- 20 respuestas reales.
- 5 validadores especializados.
- 1 validador general.
- 1 doctor de instalacion.
- Export Windows probado con `Compress-Archive`.
