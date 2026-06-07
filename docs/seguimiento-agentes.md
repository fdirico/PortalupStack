# Seguimiento para agentes

Este documento sirve como bitacora de continuidad para cualquier agente que retome el trabajo.

## Estado actual

- Proyecto: PortalUP Stack Codex.
- Rama: `main`.
- Roadmap fuente: `Roadmap Stack Codex Implementation.txt`.
- Version objetivo: `v0.1.0`.
- Estrategia: adaptador limpio para Codex, no fork directo de GStack.
- GStack revisado: `https://github.com/garrytan/gstack.git`, commit `476b0ec59741fd69e4151ebee363a432d2b5c497`, version `1.56.1.0`, licencia MIT.
- Nota critica: `vendor/gstack` es referencia local ignorada por Git. No se debe commitear.

## Fases del roadmap

| Fase | Estado | Resultado esperado | Resultado actual |
| --- | --- | --- | --- |
| 1. Discovery GStack | Completo MVP | Matriz de portabilidad y ADR-001 | GStack real inventariado, licencia registrada y matriz creada |
| 2. Adaptador Codex | Completo MVP | ADR-002, ADR-003, validator | Estructura `.agents/skills`, `AGENTS.md`, `openai.yaml` y scripts base |
| 3. Core GStack | Completo MVP | Skills review, QA, QA-only, ship, CSO, document, plan, autoplan, investigate, careful | 12 skills core creadas con referencias metodologicas |
| 4. Capa PortalUP | Completo MVP | Skills FileNet, RPA, BPM, SQL, AWS backup, propuesta, incidente, arquitectura | 8 skills PortalUP creadas |
| 5. Instalador local | Completo MVP | Scripts Windows/Linux | Scripts iniciales creados |
| 6. Testing | Completo MVP | Fixtures y rubrica | 8 fixtures, salidas esperadas, respuestas reales, rubrica y validators |
| 7. CLI pstack | Pendiente | CLI opcional | No iniciado |
| 8. Plugin Codex | Pendiente | Plugin distribuible | No iniciado |

## Decisiones tomadas

- Usar `.agents/skills/<skill>/SKILL.md` como formato canonico.
- Invocar skills con `$portalup-review`, `$portalup-qa`, etc.
- No replicar slash commands en MVP.
- Mantener PortalUP Stack como distribucion especializada, no como copia de GStack.
- Separar documentacion operativa (`seguimiento-agentes.md`) de documentacion de uso (`base-conocimiento.md`).

## Configuracion creada

- `AGENTS.md`: instrucciones base para agentes.
- `.agents/skills`: carpeta local de skills Codex.
- `scripts/validate-skills.js`: valida frontmatter, nombres, contenido minimo y metadata.
- `scripts/validate-fixtures.js`: valida que fixtures y salidas esperadas esten pareados y apunten a skills reales.
- `scripts/install-local.ps1`: instala skills en `$env:USERPROFILE\.codex\skills`.
- `scripts/install-local.sh`: instala skills en `${CODEX_HOME:-$HOME/.codex}/skills`.

## Proximos pasos recomendados

1. Agregar fixtures negativos para secretos, acciones destructivas, rollback y permisos.
2. Definir si el instalador debe copiar tambien a `.agents/skills/gstack` para compatibilidad especifica.
3. Planificar CLI `pstack` o plugin Codex como fase posterior.
4. Ampliar referencias de dominio para V1: FileNet, SQL, BPM y AWS.

## Registro de cambios

| Fecha | Agente | Cambio | Validacion |
| --- | --- | --- | --- |
| 2026-06-07 | Codex | Inicio de estructura MVP, docs, skills, scripts y fixtures | `node scripts/validate-skills.js` passed |
| 2026-06-07 | Codex | Se reclasifica el MVP inicial como andamio provisional y se crea checklist de discovery real | Luego completado con discovery GStack |
| 2026-06-07 | Codex | Se clono GStack en `vendor/gstack`, se registro commit/version/licencia y se actualizo matriz real | Discovery fase 1 primera pasada completa |
| 2026-06-07 | Codex | Se agregaron skills faltantes del roadmap: qa-only, plan-eng, plan-ceo, document-release, autoplan, investigate y careful | `node scripts/validate-skills.js` passed |
| 2026-06-07 | Codex | Se crearon referencias adaptadas desde GStack para review, QA, ship, CSO, investigate, careful y documentacion; skills enlazadas | Pendiente prueba con fixtures |
| 2026-06-07 | Codex | Se agregaron 6 salidas esperadas, `scripts/validate-fixtures.js` y reporte `docs/evaluacion-resultados.md` | `node scripts/validate-fixtures.js` passed |
| 2026-06-07 | Codex | Se agregaron skills PortalUP diferenciales faltantes: BPM, AWS Backup y Arquitectura de Solucion; total 20 skills y 8 fixtures | `node scripts/validate-skills.js` y `node scripts/validate-fixtures.js` passed |
| 2026-06-07 | Codex | Se creo nota de release candidata `docs/release-v0.1.0.md` y se ajusto documentacion de instalacion/contribucion | Pendiente prueba real de respuestas |
| 2026-06-07 | Codex | Se ejecutaron los 8 fixtures, se guardaron respuestas reales en `tests/actual-output` y se agrego `scripts/validate-actual-outputs.js` | Tres validadores passed |
| 2026-06-07 | Codex | Se creo commit, se etiqueto `v0.1.0` y se publico `main` + tag en `origin` | Publicado |
