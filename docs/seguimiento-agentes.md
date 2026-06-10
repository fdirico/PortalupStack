# Seguimiento para agentes

Este documento sirve como bitacora de continuidad para cualquier agente que retome el trabajo.

## Estado actual

- Proyecto: PortalUP Stack Codex.
- Rama: `main`.
- Roadmap fuente: `Roadmap Stack Codex Implementation.txt`.
- Version objetivo: `v0.2.0`.
- Estrategia: adaptador limpio para Codex y evolucion hacia Runtime Multi-LLM, no fork directo de GStack.
- Estado actual de rama `main`: 24 skills, 20 fixtures con respuestas reales, continuidad persistente y CLI `pstack`.
- Runtime Multi-LLM: Etapa 3 avanzada con Claude Code adapter validado documentalmente contra `.claude/skills`, instalador de proyecto, fixture Codex -> Claude y validador.
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
| 7. Orquestador autonomo | Completo v0.2.0 | Interprete de intencion, routing, continuidad y optimizacion de contexto | `portalup-orchestrator`, continuidad persistente, CLI y validators creados |
| 8. CLI pstack | Completo basico | CLI opcional | `scripts/pstack.*` genera prompts listos para Codex |
| 9. Plugin Codex | Pendiente | Plugin distribuible | No iniciado |
| 10. Runtime Multi-LLM | Etapa 3 en ejecucion | Core portable, adapters, config, paquetes por host y continuidad entre motores | Claude adapter actualizado a `.claude/skills`; instalador y fixture creados; pendiente prueba real |

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
- `scripts/validate-actual-outputs.js`: valida respuestas reales de fixtures.
- `scripts/validate-continuity.js`: valida plantillas y archivos base de continuidad persistente.
- `scripts/install-local.ps1`: instala skills en `$env:USERPROFILE\.codex\skills`.
- `scripts/install-local.sh`: instala skills en `${CODEX_HOME:-$HOME/.codex}/skills`.

## Proximos pasos recomendados

1. Ejecutar uso real de `0.2.0` en una aplicacion PortalUP.
2. Ampliar referencias de dominio para V1: FileNet, SQL, BPM y AWS.
3. Probar instalador Claude en una sesion real de Claude Code.
4. Validar resultado de continuidad Codex -> Claude con handoff real.
5. Agregar comando para cambiar engine configurado desde CLI.
7. Planificar plugin Codex distribuible.
8. Evaluar browser, QA visual y memoria externa.

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
| 2026-06-07 | Codex | Se documento Fase 2 avanzada para orquestador autonomo, routing, continuidad y optimizacion de tokens | Pendiente implementar |
| 2026-06-07 | Codex | Se agregaron skills expertas: arquitecto, comercial y marketing; fixtures y salidas esperadas/reales | Tres validadores passed |
| 2026-06-07 | Codex | Se agrego `portalup-orchestrator` con routing natural, politica de contexto y 5 fixtures de prueba | Tres validadores passed |
| 2026-06-07 | Codex | Se agrego continuidad persistente con `outputs/sessions`, plantillas de handoff/continuidad y `validate-continuity.js` | Pendiente validacion final |
| 2026-06-07 | Codex | Se cerro `0.2.0` con `pstack`, `doctor`, `validate-all`, fixtures negativos y documentacion de Fase 3 futura | Pendiente publicacion final |
| 2026-06-07 | Codex | Se preparo `0.3.0` con quality gate profesional, modernizacion UI/UX, estandar de delivery, routing y fixtures | `node scripts\doctor.js` passed: 26 skills / 22 fixtures |
| 2026-06-08 | Codex | Se inicio Runtime Multi-LLM con arquitectura, roadmap, plan, config ejemplo, skill registry, adapters Codex/Claude y `validate-runtime.js` | `node scripts\validate-runtime.js` passed |
| 2026-06-08 | Codex | Se agrego `scripts/generate-host-assets.js`, paquetes Codex/Claude/Cursor, comandos `pstack engine/runtime/package` y guia de host assets | Pendiente validacion final |
| 2026-06-08 | Codex | Se verifico formato oficial Claude Code Skills, se actualizo adapter Claude a `.claude/skills` y se agrego guia `docs/claude-code-adapter.md` | Pendiente validacion final |
| 2026-06-09 | Codex | Se agrego instalador Claude por proyecto, lectura de `portalup.config.json` real en `pstack` y fixture Codex -> Claude | Pendiente validacion final |
