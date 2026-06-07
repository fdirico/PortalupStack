# Checklist de ejecucion

Este checklist controla el avance real del proyecto PortalUP Stack Codex.

## Estado general

- [x] Crear repositorio base conectado a Git.
- [x] Crear andamio inicial de documentacion, skills, scripts, templates y fixtures.
- [x] Validar que el andamio inicial pasa `node scripts/validate-skills.js`.
- [x] Revisar el repositorio real de GStack.
- [x] Inventariar roles, prompts, comandos, checklists, QA, review, shipping y documentacion de GStack.
- [x] Revisar licencia, atribuciones y restricciones de reutilizacion.
- [x] Crear matriz real de portabilidad GStack -> Codex.
- [x] Reemplazar o ajustar el andamio actual con contenido realmente adaptado desde GStack.
- [x] Crear referencias compactas con metodologia real de GStack para review, QA, ship, CSO, investigate, careful y documentacion.
- [x] Validar contrato estructural de cada skill con `node scripts/validate-skills.js`.
- [x] Crear salidas esperadas y validador de fixtures.
- [x] Validar fixtures con `node scripts/validate-fixtures.js`.
- [x] Ejecutar cada skill contra fixtures con respuestas reales de Codex.
- [x] Validar evidencia con `node scripts/validate-actual-outputs.js`.
- [x] Actualizar base de conocimiento con comportamiento MVP.
- [x] Preparar nota de release candidata `v0.1.0`.
- [x] Aprobar y etiquetar release MVP `v0.1.0`.

## Fase 1 - Discovery real de GStack

- [x] Clonar o descargar `https://github.com/garrytan/gstack.git`.
- [x] Registrar commit/revision analizada.
- [x] Identificar estructura principal del repo.
- [x] Inventariar archivos de instrucciones de agente.
- [x] Inventariar slash commands o equivalentes.
- [x] Inventariar skills/prompts reutilizables.
- [x] Inventariar scripts/hooks/workflows.
- [x] Identificar dependencias Claude-only.
- [x] Revisar licencia y aviso de atribucion.
- [x] Completar `docs/matriz-portabilidad-gstack.md` con datos reales.

## Fase 2 - Adaptador Codex

- [x] Mapear `CLAUDE.md` o equivalentes hacia `AGENTS.md`.
- [x] Mapear `.claude/skills` o equivalentes hacia `.agents/skills`.
- [x] Mapear slash commands hacia skills `$portalup-*`.
- [x] Identificar scripts wrapper necesarios.
- [x] Actualizar ADRs con hallazgos reales.

## Fase 3 - Skills MVP

- [x] Ajustar `portalup-review` con base en GStack real.
- [x] Ajustar `portalup-qa` con base en GStack real.
- [x] Agregar `portalup-qa-only` con base en GStack real.
- [x] Ajustar `portalup-ship` con base en GStack real.
- [x] Ajustar `portalup-cso` con base en GStack real.
- [x] Ajustar `portalup-document-generate` con base en GStack real.
- [x] Agregar `portalup-document-release` con base en GStack real.
- [x] Agregar `portalup-plan-eng-review` con base en GStack real.
- [x] Agregar `portalup-plan-ceo-review` con base en GStack real.
- [x] Agregar `portalup-autoplan` con base en GStack real.
- [x] Agregar `portalup-investigate` con base en GStack real.
- [x] Agregar `portalup-careful` con base en GStack real.
- [x] Ajustar capa PortalUP sin perder identidad propia.

## Fase 4 - Skills PortalUP diferenciales

- [x] Crear `portalup-filenet-review`.
- [x] Crear `portalup-rpa-review`.
- [x] Crear `portalup-bpm-review`.
- [x] Crear `portalup-sql-review`.
- [x] Crear `portalup-aws-backup-review`.
- [x] Crear `portalup-propuesta-comercial`.
- [x] Crear `portalup-soporte-incidente`.
- [x] Crear `portalup-arquitectura-solucion`.

## Registro rapido

| Fecha | Avance | Estado |
| --- | --- | --- |
| 2026-06-07 | Andamio inicial creado desde roadmap, sin revisar GStack real | Provisional |
| 2026-06-07 | Usuario confirmo URL de GStack y se reorienta a discovery real | En curso |
| 2026-06-07 | GStack clonado, version/licencia/skills/host Codex inventariados | Fase 1 primera pasada completa |
| 2026-06-07 | Skills iniciales faltantes del roadmap agregadas y alineadas a GStack real | Fase 3 primera pasada completa |
| 2026-06-07 | Primer corte de 17 skills validado con `node scripts/validate-skills.js` | Validacion estructural OK |
| 2026-06-07 | Referencias metodologicas GStack agregadas a skills core/transversales | Pendiente validar fixtures |
| 2026-06-07 | Primer corte de 6 fixtures enlazado a salidas esperadas y validado con `node scripts/validate-fixtures.js` | Validacion de contrato OK |
| 2026-06-07 | Skills BPM, AWS Backup y Arquitectura agregadas; suite sube a 20 skills y 8 fixtures | Validacion de contrato OK |
| 2026-06-07 | Nota de release candidata `docs/release-v0.1.0.md` creada | Pendiente corrida real de fixtures |
| 2026-06-07 | 8 respuestas reales guardadas en `tests/actual-output` y validadas | Todos los fixtures aprueban MVP |
| 2026-06-07 | Release MVP etiquetado como `v0.1.0` | Tag local creado |
| 2026-06-07 | `main` y tag `v0.1.0` publicados en `origin` | Publicado |
